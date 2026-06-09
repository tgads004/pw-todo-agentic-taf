# Quality Standards

## Test Isolation

### Data Isolation

GOOD: Isolated test data

```typescript
test('user can create list', async ({ page }) => {
  const uniqueId = `test-${Date.now()}-${Math.random()}`;
  const listName = `My List ${uniqueId}`;
  // ... test logic
  await cleanup(uniqueId); // Always cleanup
});
```

BAD: Shared test data

```typescript
test('user can create list', async ({ page }) => {
  await createList('Shared List'); // Multiple tests using same name
});
```

### Test Independence

- No test dependencies: Each test must run independently
- Parallel execution safe: Tests must not conflict
- Cleanup: Auto-cleanup via fixtures (dataCleanup)

## Test Stability

### Flakiness Policy

- Threshold: < 1% flakiness rate
- Quarantine: Flaky tests moved to .quarantine/ directory
- Fix SLA: Fix within 3 business days or delete test

### Retry Strategy

```typescript
// playwright.config.ts
export default {
  retries: process.env.CI ? 2 : 0, // Retry in CI only
  timeout: 30000, // 30s per test
  expect: {
    timeout: 5000 // 5s for assertions
  }
};
```

## Test Data Management

### Test Data Generator

```typescript
// tests/fixtures/testDataGenerator.ts
export function generateUser() {
  return {
    username: `testuser_${uuid()}`,
    email: `test_${uuid()}@example.com`,
    // ... synthetic data
  };
}
```

### Data Cleanup

```typescript
// tests/fixtures/dataCleanup.ts
export const test = base.extend({
  dataCleanup: async ({}, use, testInfo) => {
    const createdIds: string[] = [];
    await use({
      trackForCleanup: (id: string) => createdIds.push(id)
    });
    // Cleanup after test
    for (const id of createdIds) {
      await deleteTestData(id);
    }
  }
});
```

## Version Control

### Git Tagging

- Generated tests: Tag with source commit SHA
- Agent changes: Semantic versioning (v1.2.3)
- Release tags: Match source repo releases

### Test File Headers (Traceability)

```typescript
/**
 * E2E Tests: Display User Name in Header
 * 
 * Source: https://github.com/tgads004/todo-nodejs-mongo-aca
 * Feature: docs/features/display-user-name-in-header
 * Source SHA: abc123...
 * Generated: 2026-06-02T10:30:00Z
 * Generator Version: v1.2.0
 * 
 * WARNING: DO NOT EDIT MANUALLY
 * This file is auto-generated. Changes will be overwritten.
 * To modify tests, update feature specs in source repository.
 */
```

## Change Management

### Agent Changes Require

1. CHANGELOG.md entry
2. Test run on sample feature (smoke test)
3. Documentation update

### Test Regeneration Policy

- Automatic: When feature spec changes (via webhook)
- Manual: Request via GitHub Issue (QA Lead approval)
- Bulk: Monthly regeneration for all features (maintenance window)
