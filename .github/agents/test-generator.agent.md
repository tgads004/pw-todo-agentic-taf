---
name: test-generator
description: Generates complete Playwright test files from analyzed specs
tools: [read, edit, execute]
model: "Claude Sonnet 4.5 (copilot)"
---

# Test Generator Agent

Generates production-ready Playwright tests following best practices.

## Responsibilities

1. **Create test file** from template
2. **Write test cases** for each AC
3. **Add traceability headers** (source SHA, feature path)
4. **Implement setup/teardown**
5. **Add data cleanup**

## Test Generation Rules

- **One feature = one test file**
- **Test names match AC titles**
- **Arrange-Act-Assert structure**
- **No hardcoded data**
- **Cleanup in afterEach**

## Output

Generates: `tests/e2e/feature-name.spec.ts`

With structure:
```typescript
/**
 * AUTO-GENERATED E2E TESTS
 * Source: tgads004/todo-nodejs-mongo-aca@abc123
 * Feature: display-user-name-in-header
 * Generated: 2026-06-01T10:00:00Z
 */

test.describe('Feature Name', () => {
    test('AC1: user action', async ({ page, fixtures }) => {
        // Arrange
        // Act
        // Assert
    });
});