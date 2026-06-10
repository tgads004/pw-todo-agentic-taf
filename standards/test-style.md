# Standard: Test Style Guide

All generated and manual tests MUST conform to these rules.

## File Structure

- One test file per feature: `tests/generated/<feature-name>.spec.ts`
- Each test file imports the required page objects and helpers
- Tests use `BaseTest` as the base class (or a test-specific derived class)

## Code Pattern

```typescript
import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/todo.page';
import { ApiHelper } from '../helpers/api-helper';

test.describe('Todo CRUD', () => {

  test.beforeEach(async ({ page }) => {
    // Auth handled by BaseTest – do not add login flows here
    await page.goto('/');
  });

  test('should create a new todo', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodo('Test item');
    await expect(todoPage.todoList).toContainText('Test item');
  });
});
```

## Page Object Rules

- Every UI screen gets a page class in `tests/pages/`
- Page classes extend `BasePage` (located in `tests/pages/base.page.ts`)
- Page objects expose locators and actions, **not** test logic
- Selectors are imported from `tests/selectors/<page>.selectors.ts`

## Base Test Class

- `tests/base-test.ts` provides `test.beforeAll` and `test.afterAll` hooks for global setup
- Authentication (MSAL bypass) is configured in `BaseTest`
- Common fixtures (like `apiHelper`) are injected via Playwright fixtures

## Helpers

- API calls go through `ApiHelper` class (wraps `playwright.request`)
- Test data generation uses `DataGenerator` (creates random strings, dates, etc.)
- Helpers reside in `tests/helpers/` and are imported as needed

## Selectors

- Stored in `tests/selectors/` by page name (e.g., `todo.selectors.ts`)
- Each file exports an object with named selectors (e.g., `export const todoSelectors = { addButton: '[data-testid="add-todo-button"]' }`)
- Page objects import selector objects and use them in locators

## Assertion Rules

- Always include status code assertion for API calls
- Prefer `toBeVisible()` over `toBeInTheDocument()`
- Use `toHaveText()` for text content
- Use `toHaveURL()` for URL assertions

## Anti-Patterns

- No XPath
- No `waitForTimeout`
- No direct CSS selectors in test functions – always use page object methods