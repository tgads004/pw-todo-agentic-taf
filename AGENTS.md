# Agents in This Repository

## Overview

This repository uses an agentic testing system that automatically generates, runs, and heals Playwright tests based on feature documentation. The system is event-driven — it triggers when the main project
(`todo-nodejs-mongo-aca`) publishes feature doc changes via GitHub Repository Dispatch.

## Repository Structure

```todo-playwright-repo/
├── AGENTS.md                 # This file
├── README.md                 # Project overview
├── features/                 # Feature docs synced from main project (at root)
├── agents/                   # Agent prompt files
│   ├── explorer.md
│   ├── generator.md
│   └── healer.md
├── skills/                   # Reusable skill prompt files
│   ├── parse-feature-doc.md
│   ├── probe-api-endpoint.md
│   ├── capture-dom-selectors.md
│   ├── generate-assertions.md
│   ├── diagnose-failure.md
│   ├── fix-selector.md
│   └── update-assertion.md
├── standards/                # Rules for agents, skills, and generated tests
│   ├── test-style.md
│   ├── agent-protocol.md
│   ├── skill-contract.md
│   └── selectors.md
├── scripts/
│   └── orchestrator.mjs
├── tests/
│   ├── generated/            # Auto‑generated tests (use Page Objects)
│   ├── pages/                # Page Object classes
│   │   ├── base.page.ts
│   │   ├── todo.page.ts
│   │   └── ...
│   ├── helpers/              # Utility functions
│   │   ├── api-helper.ts
│   │   ├── data-generator.ts
│   │   └── ...
│   ├── selectors/            # Selectors organized by page
│   │   ├── todo.selectors.ts
│   │   └── ...
│   └── base-test.ts          # Base test class with common setup/teardown
├── playwright.config.ts
├── global-setup.ts
└── package.json
```

## Agent Files

| Agent | File | Purpose |
| --- | --- | --- |
| Explorer | `agents/explorer.md` | Reads feature docs from `features/`, probes APIs, captures DOM |
| Generator | `agents/generator.md` | Generates test files that use Page Objects, Base classes, and helpers |
| Healer | `agents/healer.md` | Diagnoses failures and fixes tests, respecting Page Object patterns |

## Skill Files

| Skill | File | Purpose |
| --- | --- | --- |
| Parse Feature Doc | `skills/parse-feature-doc.md` | Extracts endpoints, scenarios, edge cases from markdown |
| Probe API Endpoint | `skills/probe-api-endpoint.md` | Calls API and captures response |
| Capture DOM Selectors | `skills/capture-dom-selectors.md` | Maps DOM elements to page‑specific selector files |
| Generate Assertions | `skills/generate-assertions.md` | Builds assertions using API responses and structured selectors |
| Diagnose Failure | `skills/diagnose-failure.md` | Classifies error types (selector, assertion, network, etc.) |
| Fix Selector | `skills/fix-selector.md` | Replaces broken selectors with current ones from `tests/selectors/` |
| Update Assertion | `skills/update-assertion.md` | Updates assertions in line with changed API behavior |

## Standards

All agents and skills MUST conform to the rules in `standards/`:

| Standard | File | Scope |
| --- | --- | --- |
| Test Style Guide | `standards/test-style.md` | Page Object usage, Base classes, helper imports |
| Agent Protocol | `standards/agent-protocol.md` | Data flow between agents and skills |
| Skill Contract | `standards/skill-contract.md` | Input/output schemas for skills |
| Selectors | `standards/selectors.md` | How selectors are stored per page and referenced |

## Orchestration

`scripts/orchestrator.mjs` drives the loop:

1. Loads an agent prompt from `agents/`
2. Resolves skill references and injects them into the prompt
3. Calls an LLM (OpenAI or Ollama)
4. Runs programmatic skills (API probes, DOM capture)
5. Generates tests that import `BasePage`, `BaseTest`, and helpers
6. Executes Playwright tests
7. Invokes Healer on failure (up to 3 attempts)

## Trigger Mechanism

- **Automatic**: GitHub Repository Dispatch from `todo-nodejs-mongo-aca` when `docs/features/*.md` changes → synced to `features/` in this repo
- **Manual**: `node scripts/orchestrator.mjs <feature-name>`

## Conventions

- All generated tests must use `BasePage`, `BaseTest`, and page‑specific page objects
- Selectors are stored in `tests/selectors/<page>.selectors.ts` and imported by page objects
- Helpers live in `tests/helpers/` (e.g., `ApiHelper`, `DataGenerator`)
- Feature docs are always placed in `features/` (root directory)