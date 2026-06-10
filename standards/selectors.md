# Standard: Selector Priority and Usage

## Repository Structure for Selectors

Selectors are stored in **per‑page files** inside `tests/selectors/`:

``` tests/selectors/
├── index.ts              # Re‑exports all selector objects (barrel file)
├── todo.selectors.ts     # Selectors for the Todo page
├── auth.selectors.ts     # Selectors for the login page
└── ...
```

Each file exports a **typed constant object** with descriptive key names:

```typescript
// tests/selectors/todo.selectors.ts
export const todoSelectors = {
  addButton: '[data-testid="add-todo-button"]',
  titleInput: '[placeholder="Enter title"]',
  submitButton: 'button:has-text("Save")',
  todoList: '[data-testid="todo-list"]',
  deleteButton: (id: string) => `[data-testid="delete-todo-${id}"]`,
} as const;
```

## Selector Hierarchy (Highest to Lowest Priority)

| Priority | Selector Type | Example | When to Use |
| --- | --- | --- | --- |
| 1 | `data-testid` | `[data-testid="add-todo-button"]` | Always preferred. If missing from app, request developer to add it. |
| 2 | `aria-label` | `[aria-label="Add a new todo"]` | Good for accessibility‑supported apps |
| 3 | Role + Name | `role=button[name="Add Todo"]` | Semantic, stable across UI redesigns |
| 4 | Placeholder | `[placeholder="Enter title"]` | Input fields only |
| 5 | Label text | `page.getByLabel("Todo Title")` | Form fields with associated `<label>` elements |
| 6 | Text content | `page.getByText("Add Todo")` | Buttons, links, headings |
| 7 | CSS ID | `#add-todo-btn` | Only if ID is static (not auto‑generated) |
| 8 | CSS class | `.ms-Button--primary` | Last resort — most fragile |

## Naming Conventions for Selector Keys

- Use **camelCase** with descriptive names: `addButton`, `titleInput`, `todoList`
- For dynamic selectors (e.g., list items with IDs), use **functions**: `deleteButton: (id: string) => ...`
- Group related selectors with prefixes: `formTitle`, `formDescription`, `formSubmit`

## How Page Objects Use Selectors

Page objects **import** selectors from the corresponding file and use them in locators:

```typescript
// tests/pages/todo.page.ts
import { todoSelectors } from '../selectors/todo.selectors';
import { BasePage } from './base.page';

export class TodoPage extends BasePage {
  get addButton() {
    return this.page.locator(todoSelectors.addButton);
  }

  get titleInput() {
    return this.page.locator(todoSelectors.titleInput);
  }

  async addTodo(title: string) {
    await this.addButton.click();
    await this.titleInput.fill(title);
    await this.page.locator(todoSelectors.submitButton).click();
  }
}
```

## Format Rules

- Always use Playwright's **locator** syntax, not raw CSS selectors in assertions.
- ✅ `await page.locator(todoSelectors.addButton).click()`
- ❌ `await page.$eval(todoSelectors.addButton, el => el.click())`
- Never hardcode selector strings in test functions or page objects — always import from `tests/selectors/`.

## Anti‑Patterns (Never Use)

- XPath selectors: `//div[@class="todo"]/button`
- Index‑based selectors: `button:nth-child(2)`
- Fixed timeouts after selectors: `await page.click('.btn'); await page.waitForTimeout(2000)`
- Chained CSS that depends on DOM structure: `div > div > .list > button`

## Healing Rules (for Healer Agent)

1. **Determine the affected page** from the failing test’s context (e.g., if `TodoPage` is used, update `todo.selectors.ts`).
2. **For a broken `data-testid` selector**: first check if the `data-testid` attribute value changed in the DOM.
3. **If no `data-testid` exists** on the replacement element, fall to `aria-label`, then role+name, then text content (following the hierarchy above).
4. **Always update the selector file** — never modify the selector inline in the page object or test.
5. **If a new element is discovered** during healing (e.g., a new button), add a new key to the appropriate selector file.
6. **Never replace a `data-testid` selector with an index‑based CSS selector.**

## Explorer Agent Instructions

When capturing DOM selectors, the Explorer agent must:

1. **Group captured elements by page** (e.g., elements in the Todo section go to `todo.selectors.ts`).
2. **Generate the highest‑priority selector** for each element following the hierarchy.
3. **Output a mapping** of `pageName → { elementName → selectorString }` for the Generator agent.
4. **Include dynamic selector functions** where elements are identified by ID (e.g., list items).

## Validation (Orchestrator)

The orchestrator must validate generated tests against this standard:

```javascript
function validateGeneratedTest(testCode) {
  if (testCode.match(/xpath|XPath/i)) {
    throw new Error('Generated test contains XPath — violates selectors.md');
  }
  if (testCode.includes('waitForTimeout')) {
    throw new Error('Generated test uses waitForTimeout — violates test-style.md');
  }
  if (testCode.includes('page.locator(') && !testCode.includes('data-testid')) {
    console.warn('Warning: Test uses locator but no data-testid found — consider adding data-testid to the app.');
  }
  return true;
}
```

## Summary

| Aspect | Requirement |
| --- | --- |
| Location | `tests/selectors/<page>.selectors.ts` |
| Exported as | `const <page>Selectors = { ... } as const` |
| Key naming | camelCase, descriptive |
| Dynamic selectors | Functions that accept parameters |
| Imported by | Page objects (not test files directly) |
| Healing | Update the selector file, not the page object |