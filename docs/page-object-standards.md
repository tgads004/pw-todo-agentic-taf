# Page Object Model Standards

## Architecture

### File Structure

```text
tests/
├── fixtures/
│   ├── basePage.ts              # Base page class
│   ├── dataCleanup.ts           # Data cleanup fixture
│   └── testDataGenerator.ts     # Test data generator
├── page-objects/
│   ├── pages/                   # Full page objects
│   │   ├── homePage.ts
│   │   ├── listDetailPage.ts
│   │   └── authPage.ts
│   └── components/              # Reusable components
│       ├── header.component.ts
│       ├── listCard.component.ts
│       └── todoItem.component.ts
└── tests/
    └── e2e/
        ├── create-list.spec.ts
        └── display-user-name.spec.ts
```

## Naming Conventions

### Files
- **Pages**: `camelCase` + `Page.ts` → `listDetailPage.ts`
- **Components**: `camelCase` + `.component.ts` → `header.component.ts`
- **Tests**: `kebab-case` + `.spec.ts` → `create-list.spec.ts`

### Classes

```typescript
// ✅ GOOD
export class ListDetailPage { }
export class HeaderComponent { }

// ❌ BAD
export class ListDetail { }  // Missing "Page"
export class Header { }       // Missing "Component"
```

### Methods

```typescript
// ✅ GOOD: Action methods start with verbs
async clickCreateButton() { }
async enterListName(name: string) { }
async waitForListToAppear() { }
async isListVisible() { }

// ❌ BAD: Unclear intent
async createButton() { }  // Is this clicking or getting?
async listName(name: string) { }  // Ambiguous
```

## Base Page Pattern

### BasePage Class

```typescript
// tests/fixtures/basePage.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }
  
  /**
   * Navigate to a path relative to base URL
   */
  async goto(path: string) {
    await this.page.goto(path);
  }
  
  /**
   * Wait for network idle (useful after mutations)
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Get element with retry logic
   */
  protected getElement(selector: string): Locator {
    return this.page.locator(selector);
  }
  
  /**
   * Safe click with wait
   */
  protected async safeClick(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }
  
  /**
   * Safe fill with clear
   */
  protected async safeFill(locator: Locator, text: string) {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(text);
  }
}
```

## Page Object Pattern

### Full Page Example

```typescript
// tests/page-objects/pages/listDetailPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../fixtures/basePage';

/**
 * Page Object: List Detail Page
 * 
 * Represents: /lists/:listId
 * Purpose: View and manage todo items in a list
 * 
 * Source: docs/features/create-list/spec.md
 * Generated: 2026-06-02T10:30:00Z
 */
export class ListDetailPage extends BasePage {
  // Locators (readonly, defined in constructor)
  readonly listTitle: Locator;
  readonly addItemButton: Locator;
  readonly itemNameInput: Locator;
  readonly saveItemButton: Locator;
  readonly itemsList: Locator;
  
  constructor(page: Page) {
    super(page);
    
    // Define locators with data-testid (preferred)
    this.listTitle = page.getByTestId('list-title');
    this.addItemButton = page.getByTestId('add-item-btn');
    this.itemNameInput = page.getByTestId('item-name-input');
    this.saveItemButton = page.getByTestId('save-item-btn');
    this.itemsList = page.getByTestId('items-list');
  }
  
  // Navigation
  async goto(listId: string) {
    await super.goto(`/lists/${listId}`);
    await this.waitForPageLoad();
  }
  
  async waitForPageLoad() {
    await this.listTitle.waitFor({ state: 'visible' });
  }
  
  // Actions
  async addItem(itemName: string) {
    await this.safeClick(this.addItemButton);
    await this.safeFill(this.itemNameInput, itemName);
    await this.safeClick(this.saveItemButton);
    await this.waitForNetworkIdle();
  }
  
  async getListTitle(): Promise<string> {
    return await this.listTitle.textContent() || '';
  }
  
  // Assertions helpers
  async isItemVisible(itemName: string): Promise<boolean> {
    const item = this.itemsList.getByText(itemName);
    return await item.isVisible();
  }
  
  async getItemCount(): Promise<number> {
    return await this.itemsList.locator('[data-testid="todo-item"]').count();
  }
}
```

## Component Pattern

### Reusable Component Example

```typescript
// tests/page-objects/components/header.component.ts
import { Page, Locator } from '@playwright/test';

/**
 * Component: Header
 * 
 * Appears on: All authenticated pages
 * Purpose: Navigation, user info, logout
 * 
 * Source: docs/features/display-user-name-in-header/spec.md
 */
export class HeaderComponent {
  readonly page: Page;
  readonly root: Locator;
  readonly userNameDisplay: Locator;
  readonly logoutButton: Locator;
  readonly homeLink: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('app-header');
    this.userNameDisplay = this.root.getByTestId('user-name-display');
    this.logoutButton = this.root.getByTestId('logout-btn');
    this.homeLink = this.root.getByTestId('home-link');
  }
  
  async getUserName(): Promise<string> {
    return await this.userNameDisplay.textContent() || '';
  }
  
  async isUserNameVisible(): Promise<boolean> {
    return await this.userNameDisplay.isVisible();
  }
  
  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL('**/login');
  }
  
  async goHome() {
    await this.homeLink.click();
  }
}
```

## Selector Strategy (Priority Order)

### 1. data-testid (BEST)

```typescript
// ✅ PREFERRED: Stable, semantic, test-specific
page.getByTestId('create-list-btn')
```

### 2. Accessible Role + Name (GOOD)

```typescript
// ✅ GOOD: Semantic, accessibility-friendly
page.getByRole('button', { name: 'Create List' })
page.getByLabel('List Name')
```

### 3. Text Content (OK - for display text)

```typescript
// ⚠️ OK: Only for user-visible text that won't change
page.getByText('My Todo List')
```

### 4. CSS/XPath (AVOID)

## Error Handling

### Wrap interactions with retries

```typescript
async addItem(itemName: string, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await this.safeClick(this.addItemButton);
      await this.safeFill(this.itemNameInput, itemName);
      await this.safeClick(this.saveItemButton);
      await this.waitForNetworkIdle();
      return; // Success
    } catch (err) {
      if (i === retries - 1) throw err; // Last retry, rethrow
      await this.page.waitForTimeout(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

## Base Tests Standards

### Custom Test Fixture Configuration

```typescript
// tests/fixtures/baseTest.ts
import { test as base } from '@playwright/test';
import { HomePage } from '../page-objects/pages/homePage';
import { ListDetailPage } from '../page-objects/pages/listDetailPage';
import { HeaderComponent } from '../page-objects/components/header.component';

// Define the fixtures types
type TestFixtures = {
  homePage: HomePage;
  listDetailPage: ListDetailPage;
  header: HeaderComponent;
};

// Extend base test to include pre-instantiated Page Objects and Components
export const test = base.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await use(homePage);
  },
  listDetailPage: async ({ page }, use) => {
    await use(new ListDetailPage(page));
  },
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
});

export { expect } from '@playwright/test';
```

## Usage in Tests

### Test Example

```typescript
// tests/e2e/create-list.spec.ts
import { test, expect } from '../fixtures/baseTest';

test.describe('Create List', () => {
  
  test('user can create a new list', async ({ homePage, listDetailPage }) => {
    const listName = `Test List ${Date.now()}`;
    
    // Act
    await homePage.createList(listName);
    
    // Assert - using Page Object methods
    expect(await listDetailPage.getListTitle()).toBe(listName);
    expect(await listDetailPage.getItemCount()).toBe(0);
  });
  
  test('created list shows in home page', async ({ homePage, header }) => {
    const listName = `My List ${Date.now()}`;
    
    await homePage.createList(listName);
    await header.goHome();
    
    expect(await homePage.isListVisible(listName)).toBe(true);
  });
});
```

## Anti-Patterns to AVOID

### ❌ DON'T: Put assertions in Page Objects

```typescript
// ❌ BAD
async addItem(itemName: string) {
  await this.addItemButton.click();
  await expect(this.itemsList).toContainText(itemName); // NO!
}

// ✅ GOOD: Return data, let tests assert
async addItem(itemName: string) {
  await this.addItemButton.click();
  // Just perform action
}
```

### ❌ DON'T: Expose raw locators

```typescript
// ❌ BAD
export class HomePage {
  get createButton() {
    return this.page.getByTestId('create-btn'); // Exposed
  }
}

// ✅ GOOD: Expose methods, not locators
export class HomePage {
  private readonly createButton: Locator;
  
  async clickCreate() {
    await this.createButton.click();
  }
}
```
### ❌ DON'T: Put test data in Page Objectscts

```typescript
// ❌ BAD
async createList() {
  await this.createList('Hardcoded Name'); // NO!
}

// ✅ GOOD: Accept parameters
async createList(listName: string) {
  await this.fillListName(listName);
  await this.clickCreate();
}
```

## Code Generation Requirements

When generating Page Objects from specs:
1.  ✅ Extend BasePage
2.  ✅ Use data-testid selectors first
3.  ✅ Include JSDoc with source reference
4.  ✅ Define all locators in constructor
5.  ✅ One action per method
6.  ✅ Return data, don't assert
7.  ✅ Include error handling
8.  ✅ Add source commit SHA in header

### When generating Tests from specs:
1. ✅ Extend Base Test / Custom Test Fixtures (e.g., `import { test } from '../fixtures/baseTest'`)
2. ✅ Initialize Page Objects in `test.beforeEach`
3. ✅ Keep assertions inside the test file only