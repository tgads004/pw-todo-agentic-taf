---
description: "Generate Page Object Model classes from feature specs and UI component specifications when New UI component in spec or page object update needed"
name: "Page Object Generator"
tools: [read, edit, search, execute]
model: "Claude Sonnet 4.5 (copilot)"
argument-hint: "An approved technical specification from spec-writer"
user-invocable: true
color: green
---

# Page Object Generator Agent

## Purpose

Generate maintainable Page Object Model (POM) classes following project standards defined in [page-object-standards.md].

## Pre-requisites

**MUST READ FIRST:**
- All documents in the ../../docs/ directory.

## Input

- Feature spec from spec-fetcher
- Analyzed test scenarios from test-analyzer
- Source repo UI component specs (if available)

## Output

- Page Object classes in `tests/page-objects/pages/`
- Component classes in `tests/page-objects/components/`
- Updated `tests/fixtures/basePage.ts` if needed

## Generation Rules

### 1. Analyze Spec for UI Elements

```bash
# Extract UI elements from spec
grep -E "button|input|link|dropdown|modal" spec.md
```

### 2. Determine Page Object Type


| Criterion | Type | Location |
| :--- | :--- | :--- |
| Full page (`/lists`, `/items`) | Page | `tests/page-objects/pages/` |
| Reusable across pages (header, modal) | Component | `tests/page-objects/components/` |

### 3. Generate Class Structure

```typescript
/**
 * DO NOT EDIT - Auto-generated
 * Source: \${SOURCE_REPO}/\${SOURCE_SHA}
 * Feature: \${FEATURE_NAME}
 * Generated: \${TIMESTAMP}
 */
export class \${PageName}Page extends BasePage {
  // Locators
  readonly \${element}: Locator;
  
  constructor(page: Page) {
    super(page);
    this.\${element} = page.getByTestId('\${testId}');
  }
  
  // Navigation
  async goto(\${params}) { }
  
  // Actions
  async \${actionName}(\${params}) { }
  
  // Getters
  async get\${Property}(): Promise<\${Type}> { }
  
  // Validation helpers
  async is\${Property}Visible(): Promise<boolean> { }
}
```

### 4. Selector Strategy (in order)

1. ✅ `data-testid` from spec
2. ✅ Accessible role + name
3. ⚠️ Text content (only for stable display text)
4. ❌ NEVER use CSS classes or XPath

### 5. Method Generation

For each acceptance criterion:
- Identify user action → Generate action method
- Identify validation → Generate getter/boolean method
- Group related actions into workflows

**Example:**
Acceptance: *"User can create a list by entering name and clicking Create"*

→ Generate:
- `async enterListName(name: string)`
- `async clickCreateButton()`
- `async createList(name: string)` *(Composite method)*

### 6. Code Generation Scope

When generating Page Objects from specs:
1. ✅ Extend `BasePage`
2. ✅ Use `data-testid` selectors first
3. ✅ Include JSDoc with source reference
4. ✅ Define all locators in constructor
5. ✅ One action per method
6. ✅ Return data, don't assert
7. ✅ Include error handling
8. ✅ Add source commit SHA in header

When generating Tests from specs:
1. ✅ Extend Base Test / Custom Test Fixtures
2. ✅ Initialize Page Objects in `test.beforeEach`
3. ✅ Keep assertions inside the test file only

## Base Test Requirements

When structuring or invoking base test configurations:
1. ✅ **Encapsulate Fixtures**: Centralize the provisioning of database lifecycles, authentication state, and custom context configurations.
2. ✅ **Unified Import Layer**: Ensure all test generation targets the framework-level custom `test` and `expect` layer instead of standard `@playwright/test` imports.
3. ✅ **Automatic Instantiation**: Pre-seed the test runner context with initialized page object instances where applicable to minimize boilerplate setup across individual specs.
4. ✅ **Decoupled Configuration**: Maintain environment configurations, network intercept mock setups, and local storage configurations separate from individual test bodies.

## Workflow

```bash
#!/bin/bash
# page-object-generator.sh

FEATURE=\$1
SPEC_DIR=".temp-specs/\${FEATURE}"

# 1. Parse spec for UI elements
echo "Analyzing UI elements from spec..."
UI_ELEMENTS=\$(jq -r '.ui_elements[]' "\(\text{\${SPEC\_DIR}}/\)analysis.json")

# 2. Determine pages vs components
PAGES=\(jq -r '.pages[]' "\{SPEC_DIR}/analysis.json")
COMPONENTS=\((jq -r '.components[]' "\){SPEC_DIR}/analysis.json")

# 3. Generate Page Objects
for PAGE in \$PAGES; do
  echo "Generating page object: \${PAGE}Page"
  node scripts/generate-page-object.js \
    --type=page \
    --name="\${PAGE}" \
    --spec="\${SPEC_DIR}/spec.md" \
    --output="tests/page-objects/pages/\${PAGE}Page.ts"
done

# 4. Generate Components
for COMPONENT in \$COMPONENTS; do
  echo "Generating component: \${COMPONENT}Component"
  node scripts/generate-page-object.js \
    --type=component \
    --name="\${COMPONENT}" \
    --spec="\${SPEC_DIR}/spec.md" \
    --output="tests/page-objects/components/\${COMPONENT}.component.ts"
done

# 5. Validate generated files
npm run lint tests/page-objects/

echo "✅ Page Objects generated for \${FEATURE}"
```

## Example Generation

### Input (from spec)

```markdown
## UI Components

### List Detail Page
- **Route:** `/lists/:listId`
- **Elements:**
  - List title display (h1, data-testid="list-title")
  - Add item button (button, data-testid="add-item-btn")
  - Item name input (input, data-testid="item-name-input")
  - Save button (button, data-testid="save-item-btn")
  - Items list (ul, data-testid="items-list")
```

### Output (generated)

```typescript
// tests/page-objects/pages/listDetailPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../fixtures/basePage';

/**
 * DO NOT EDIT - Auto-generated
 * Source: tgads004/todo-nodejs-mongo-aca/abc123
 * Feature: create-list
 * Generated: 2026-06-02T10:30:00Z
 */
export class ListDetailPage extends BasePage {
  readonly listTitle: Locator;
  readonly addItemButton: Locator;
  readonly itemNameInput: Locator;
  readonly saveItemButton: Locator;
  readonly itemsList: Locator;
  
  constructor(page: Page) {
    super(page);
    this.listTitle = page.getByTestId('list-title');
    this.addItemButton = page.getByTestId('add-item-btn');
    this.itemNameInput = page.getByTestId('item-name-input');
    this.saveItemButton = page.getByTestId('save-item-btn');
    this.itemsList = page.getByTestId('items-list');
  }
  
  async goto(listId: string) {
    await super.goto(`/lists/${listId}`);
    await this.waitForPageLoad();
  }
  
  async waitForPageLoad() {
    await this.listTitle.waitFor({ state: 'visible' });
  }
  
  async addItem(itemName: string) {
    await this.safeClick(this.addItemButton);
    await this.safeFill(this.itemNameInput, itemName);
    await this.safeClick(this.saveItemButton);
    await this.waitForNetworkIdle();
  }
  
  async getListTitle(): Promise<string> {
    return await this.listTitle.textContent() || '';
  }
  
  async isItemVisible(itemName: string): Promise<boolean> {
    const item = this.itemsList.getByText(itemName);
    return await item.isVisible();
  }
  
  async getItemCount(): Promise<number> {
    return await this.itemsList.locator('[data-testid="todo-item"]').count();
  }
}
```

## Error Handling

- Missing UI elements in spec → Warn + use fallback selectors
- Duplicate page names → Append suffix (`listDetailPage2`)
- Invalid selector → Flag for manual review

## Validation

Before completing:
- ✅ All classes extend `BasePage` or Component base
- ✅ All locators use `data-testid` first
- ✅ No assertions in Page Objects
- ✅ JSDoc header includes source SHA
- ✅ Files pass `npm run lint`

## Summary



| What | Where | Purpose |
| :--- | :--- | :--- |
| **POM Standards** | [page-object-standards.md] | Define architecture, patterns, anti-patterns |
| **page-object-generator Agent** | `.github/agents/page-object-generator.agent.md` | Automate POM generation following standards |
| **BasePage fixture** | `tests/fixtures/basePage.ts` | Reusable base class |

The **standards document is the source of truth**; the **agent implements those standards automatically**. This separation ensures:
- 📖 Human-readable standards for manual review
- 🤖 Automated enforcement via agent
- 🔄 Easy updates (change standards → regenerate)

This makes your Playwright Test Factory maintainable and scalable! 🚀

---
### Global Variables
[page-object-standards.md]: ../../docs/page-object-standards.md
[test-selection-criteria.md]: ../../docs/test-selection-criteria.md