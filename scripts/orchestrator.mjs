#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// --- Configuration ---
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:3000';
const AGENTS_DIR = path.join(ROOT, 'agents');
const SKILLS_DIR = path.join(ROOT, 'skills');
const STANDARDS_DIR = path.join(ROOT, 'standards');
const FEATURES_DIR = path.join(ROOT, 'features');
const TESTS_DIR = path.join(ROOT, 'tests/generated');
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4';
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:3b';
const MAX_HEALING_ATTEMPTS = 3;

// --- Utilities ---

async function callLLM(systemPrompt, userPrompt) {
  if (!LLM_API_KEY && LLM_PROVIDER === 'openai') {
    throw new Error('LLM_API_KEY environment variable is required for OpenAI provider');
  }

  if (LLM_PROVIDER === 'ollama') {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        system: systemPrompt,
        prompt: userPrompt,
        stream: false,
        temperature: 0.2,
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.response;
  }

  // Default: OpenAI-compatible API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

function loadPromptFile(filePath) {
  const resolvedPath = path.resolve(ROOT, filePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Prompt file not found: ${resolvedPath}`);
  }
  return fs.readFileSync(resolvedPath, 'utf-8');
}

function extractSkillReferences(agentContent) {
  const backtickRefs = [...agentContent.matchAll(/`([^`]+)`/g)].map(m => m[1]);
  const skills = [];

  for (const ref of backtickRefs) {
    const skillPath = path.join(SKILLS_DIR, `${ref}.md`);
    if (fs.existsSync(skillPath)) {
      skills.push(ref);
    }
  }

  return [...new Set(skills)];
}

function extractCodeBlock(text) {
  const tsMatch = text.match(/```typescript\n([\s\S]*?)```/);
  if (tsMatch) return tsMatch[1].trim();

  const tsxMatch = text.match(/```ts\n([\s\S]*?)```/);
  if (tsxMatch) return tsxMatch[1].trim();

  const genericMatch = text.match(/```\n([\s\S]*?)```/);
  if (genericMatch) return genericMatch[1].trim();

  if (text.includes('import') || text.includes('test.describe')) {
    return text.trim();
  }

  throw new Error('No code block found in LLM response');
}

// --- NEW: Automatic Standards Injection (Option 2) ---

function loadAllStandards() {
  if (!fs.existsSync(STANDARDS_DIR)) {
    return '';
  }

  const standardFiles = fs.readdirSync(STANDARDS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort(); // Consistent order

  if (standardFiles.length === 0) {
    return '';
  }

  let standardsSection = '\n\n---\n\n## Standards You MUST Follow\n\n';
  standardsSection += 'The following standards define the rules and conventions for all generated code. ';
  standardsSection += 'You MUST adhere to every rule in every standard file below.\n\n';

  for (const file of standardFiles) {
    const content = loadPromptFile(`standards/${file}`);
    const name = file.replace('.md', '');
    standardsSection += `### ${name}\n${content}\n\n`;
  }

  return standardsSection;
}

async function buildAgentPrompt(agentName, skillResults = {}) {
  console.log(`  Loading agent: ${agentName}`);
  const agentContent = loadPromptFile(path.join(AGENTS_DIR, `${agentName}.md`));

  // Resolve skill references
  const skillRefs = extractSkillReferences(agentContent);
  console.log(`  Resolved skills: ${skillRefs.join(', ') || 'none'}`);

  // Build the full prompt
  let fullPrompt = agentContent;

  // 🔥 Inject ALL standards automatically
  fullPrompt += loadAllStandards();

  // Add skills section
  if (skillRefs.length > 0) {
    fullPrompt += '\n\n---\n\n## Available Skills\n\n';
    for (const skillName of skillRefs) {
      try {
        const skillContent = loadPromptFile(path.join(SKILLS_DIR, `${skillName}.md`));
        fullPrompt += `### Skill: ${skillName}\n${skillContent}\n\n`;
      } catch (err) {
        console.warn(`  ⚠️  Skill "${skillName}" referenced but not found, skipping`);
      }
    }
  }

  // Append runtime results
  if (Object.keys(skillResults).length > 0) {
    fullPrompt += `\n\n---\n\n## Runtime Data\n\`\`\`json\n${JSON.stringify(skillResults, null, 2)}\n\`\`\`\n`;
  }

  return fullPrompt;
}

// --- Programmatic Skills (Runtime Functions) ---

async function skillProbeApiEndpoint(method, path, sampleBody = null) {
  const url = `${API_URL}${path}`;
  const fetchOptions = {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: sampleBody ? JSON.stringify(sampleBody) : undefined,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    clearTimeout(timeout);

    const responseBody = await response.json().catch(() => null);
    return {
      method,
      path,
      status: response.status,
      responseBody,
      headers: Object.fromEntries(response.headers.entries()),
      error: null,
    };
  } catch (err) {
    return {
      method,
      path,
      status: null,
      responseBody: null,
      headers: {},
      error: err.message,
    };
  }
}

async function skillCaptureDomSelectors(page) {
  const elements = await page.evaluate(() => {
    const interactiveSelectors = [
      'button', 'a', 'input', 'select', 'textarea',
      '[role="button"]', '[role="link"]', '[role="tab"]',
      '[data-testid]', '[aria-label]',
    ];
    const elements = document.querySelectorAll(interactiveSelectors.join(', '));
    return Array.from(elements).map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim().slice(0, 100) || null,
      id: el.id || null,
      class: el.className?.slice(0, 100) || null,
      'data-testid': el.getAttribute('data-testid'),
      'aria-label': el.getAttribute('aria-label'),
      href: el.getAttribute('href'),
      type: el.getAttribute('type'),
      name: el.getAttribute('name'),
      placeholder: el.getAttribute('placeholder'),
      role: el.getAttribute('role'),
    }));
  });

  return {
    totalElements: elements.length,
    elements,
  };
}

// --- Agent Execution Functions ---

async function runExplorer(featureDoc, featureName, browser) {
  console.log('\n  🔍 Running Explorer agent...');

  // Step 1: Parse the feature doc using the skill
  const parseSkill = loadPromptFile(path.join(SKILLS_DIR, 'parse-feature-doc.md'));
  const parsePrompt = `${parseSkill}\n\n## Input Feature Document\n${featureDoc}`;
  const parseResult = await callLLM(
    'You are a feature document parser. Output ONLY valid JSON.',
    parsePrompt
  );

  let parsed;
  try {
    parsed = JSON.parse(parseResult);
  } catch {
    const jsonMatch = parseResult.match(/```json\n([\s\S]*?)```/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error(`Failed to parse feature doc: ${parseResult.slice(0, 200)}`);
    }
  }

  console.log(`  Parsed ${parsed.endpoints?.length || 0} endpoints, ${parsed.scenarios?.length || 0} scenarios`);

  // Step 2: Probe each endpoint
  const endpointResults = [];
  for (const ep of (parsed.endpoints || [])) {
    console.log(`    Probing ${ep.method} ${ep.path}...`);
    const sampleBody = ep.method === 'POST' || ep.method === 'PUT'
      ? { title: `Test from explorer - ${Date.now()}` }
      : null;
    const result = await skillProbeApiEndpoint(ep.method, ep.path, sampleBody);
    endpointResults.push(result);
    console.log(`    → ${result.status || 'ERROR'}`);
  }

  // Step 3: Capture DOM selectors
  console.log('    Capturing DOM selectors...');
  const page = await browser.newPage();
  let selectors = { totalElements: 0, elements: [] };
  try {
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 15000 });
    selectors = await skillCaptureDomSelectors(page);
    console.log(`    Found ${selectors.totalElements} interactive elements`);
  } catch (err) {
    console.warn(`    ⚠️  DOM capture failed: ${err.message}`);
  }
  await page.close();

  // Combine into exploration report
  return {
    featureName: parsed.featureName || featureName,
    endpoints: endpointResults,
    scenarios: parsed.scenarios || [],
    edgeCases: parsed.edgeCases || [],
    selectors,
    url: APP_URL,
  };
}

async function runGenerator(featureName, featureDoc, explorationData) {
  console.log('\n  📝 Running Generator agent...');
  
  // 🔥 buildAgentPrompt now automatically includes ALL standards
  const systemPrompt = await buildAgentPrompt('generator', {
    exploration: explorationData,
  });

  const userPrompt = `
Feature Name: ${featureName}

## Feature Documentation
${featureDoc}

## Exploration Report
${JSON.stringify(explorationData, null, 2)}

Generate a complete Playwright test file for this feature. Output ONLY valid TypeScript code inside a code block.
`;

  const rawOutput = await callLLM(systemPrompt, userPrompt);
  return extractCodeBlock(rawOutput);
}

async function runHealer(featureName, testCode, failureError, featureDoc, browser) {
  console.log('\n  🩹 Running Healer agent...');

  // First, diagnose the failure
  const diagnoseSkill = loadPromptFile(path.join(SKILLS_DIR, 'diagnose-failure.md'));
  const diagnosePrompt = `${diagnoseSkill}\n\n## Failure Error\n${failureError.slice(0, 2000)}`;
  const diagnosisResult = await callLLM(
    'You are a failure diagnosis expert. Output ONLY valid JSON.',
    diagnosePrompt
  );

  let diagnosis;
  try {
    diagnosis = JSON.parse(diagnosisResult);
  } catch {
    const jsonMatch = diagnosisResult.match(/```json\n([\s\S]*?)```/);
    if (jsonMatch) {
      diagnosis = JSON.parse(jsonMatch[1]);
    } else {
      diagnosis = { errorType: 'assertion_failure', summary: 'Could not parse diagnosis' };
    }
  }

  console.log(`  Diagnosis: ${diagnosis.errorType} — ${diagnosis.summary}`);

  // Gather context for healing
  const context = {};

  if (diagnosis.errorType === 'selector_failure') {
    const page = await browser.newPage();
    try {
      await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 15000 });
      const freshDom = await skillCaptureDomSelectors(page);
      context.currentDom = freshDom;

      const fixSkill = loadPromptFile(path.join(SKILLS_DIR, 'fix-selector.md'));
      const fixPrompt = `${fixSkill}\n\n## Broken Selector\n${diagnosis.selectorString || ''}\n\n## Current DOM Elements\n${JSON.stringify(freshDom.elements.slice(0, 50), null, 2)}`;
      const fixResult = await callLLM(
        'You are a selector fixing expert. Output ONLY valid JSON.',
        fixPrompt
      );
      let fix;
      try {
        fix = JSON.parse(fixResult);
      } catch {
        const jsonMatch = fixResult.match(/```json\n([\s\S]*?)```/);
        fix = jsonMatch ? JSON.parse(jsonMatch[1]) : { replacementSelector: null };
      }
      context.selectorFix = fix;
    } catch (err) {
      console.warn(`  ⚠️  Could not get fresh DOM: ${err.message}`);
    }
    await page.close();
  }

  if (diagnosis.errorType === 'assertion_failure' || diagnosis.errorType === 'response_shape_change') {
    const parseSkill = loadPromptFile(path.join(SKILLS_DIR, 'parse-feature-doc.md'));
    const parsePrompt = `${parseSkill}\n\n## Input Feature Document\n${featureDoc}`;
    const parseResult = await callLLM(
      'You are a feature document parser. Output ONLY valid JSON.',
      parsePrompt
    );
    let parsed;
    try {
      parsed = JSON.parse(parseResult);
    } catch {
      const jsonMatch = parseResult.match(/```json\n([\s\S]*?)```/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[1]) : { endpoints: [] };
    }

    const freshApiResults = [];
    for (const ep of (parsed.endpoints || [])) {
      const result = await skillProbeApiEndpoint(ep.method, ep.path);
      freshApiResults.push(result);
    }
    context.freshApiResponses = freshApiResults;
  }

  // 🔥 Healer also gets ALL standards injected automatically
  const systemPrompt = await buildAgentPrompt('healer', {
    diagnosis,
    context,
    testCode,
    failureError: failureError.slice(0, 2000),
  });

  const userPrompt = `
Feature Name: ${featureName}

## Current Test Code
${testCode}

## Failure Error
${failureError.slice(0, 2000)}

## Diagnosis
${JSON.stringify(diagnosis, null, 2)}

## Healing Context
${JSON.stringify(context, null, 2)}

## Feature Documentation
${featureDoc}

Diagnose the failure and output the corrected test code. Output ONLY valid TypeScript code inside a code block.
`;

  const rawOutput = await callLLM(systemPrompt, userPrompt);
  return extractCodeBlock(rawOutput);
}

// --- Main Agent Loop ---

async function agenticTestRun(featureName) {
  console.log(`\n🤖 Agentic Playwright: "${featureName}"\n`);

  // Read feature doc from root features directory
  const docPath = path.join(FEATURES_DIR, `${featureName}.md`);
  if (!fs.existsSync(docPath)) {
    throw new Error(`Feature doc not found: ${docPath}`);
  }
  const featureDoc = fs.readFileSync(docPath, 'utf-8');
  console.log(`📖 Loaded feature doc (${featureDoc.length} chars)`);

  const browser = await chromium.launch({ headless: true });
  let currentTestCode = null;
  let attempts = 0;

  try {
    while (attempts < MAX_HEALING_ATTEMPTS) {
      attempts++;
      console.log(`\n🔄 Attempt ${attempts}/${MAX_HEALING_ATTEMPTS}`);

      // Phase 1: Explore
      if (!currentTestCode) {
        const exploration = await runExplorer(featureDoc, featureName, browser);
        // Phase 2: Generate
        currentTestCode = await runGenerator(featureName, featureDoc, exploration);
        console.log(`📝 Generated test (${currentTestCode.length} chars)`);
      }

      // Write test file and run
      const testFile = path.join(TESTS_DIR, `${featureName}.spec.ts`);
      fs.mkdirSync(path.dirname(testFile), { recursive: true });
      fs.writeFileSync(testFile, currentTestCode);

      console.log('🧪 Running tests...');
      try {
        execSync(`npx playwright test "${featureName}.spec.ts" --reporter=line`, {
          cwd: ROOT,
          stdio: 'pipe',
          timeout: 60000,
        });
        console.log(`\n✅ All tests passed for "${featureName}"!`);
        return { success: true, testFile, testCode: currentTestCode };
      } catch (runError) {
        const errorMessage = runError.stderr?.toString() || runError.stdout?.toString() || runError.message;
        console.log(`❌ Tests failed, attempting heal...`);

        // Phase 3: Heal
        currentTestCode = await runHealer(
          featureName,
          currentTestCode,
          errorMessage.slice(0, 2000),
          featureDoc,
          browser
        );
        console.log(`🩹 Healed test generated`);
      }
    }

    console.log(`\n⚠️ Max healing attempts reached for "${featureName}"`);
    return { success: false, testFile: null, testCode: currentTestCode };

  } finally {
    await browser.close();
  }
}

// --- CLI Entry Point ---

async function main() {
  const args = process.argv.slice(2);
  const featureName = args[0] || process.env.FEATURE_NAME;

  if (!featureName) {
    console.error('Usage: node scripts/orchestrator.mjs <feature-name>');
    console.error('       or set FEATURE_NAME environment variable');
    process.exit(1);
  }

  if (!fs.existsSync(FEATURES_DIR)) {
    console.error(`Features directory not found: ${FEATURES_DIR}`);
    console.error('Run the GitHub workflow to fetch feature docs first.');
    process.exit(1);
  }

  const result = await agenticTestRun(featureName);

  if (result.success) {
    console.log(`\n🎉 Tests written to: ${result.testFile}`);
  } else {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Orchestrator crashed:', err);
  process.exit(1);
});