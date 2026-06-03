# Test Selection Criteria — E2E vs Unit/Integration

## Decision Tree

When reading feature specs:

Is the test verifiable through UI user actions?
├─ NO → Source repo (unit/integration test)
└─ YES
│
Does it require API inspection or internal state?
├─ YES → Source repo (integration test)
└─ NO
│
Does it test a complete user workflow?
├─ YES → Playwright E2E test ✅
└─ NO → Source repo (component test)


## Filter Logic

### ✅ Include in Playwright (E2E indicators):
- "user sees", "user can", "user clicks"
- "displays", "appears", "shown", "visible"
- "navigates to", "workflow", "journey"
- "screen reader", "accessibility", "keyboard navigation"

### ❌ Exclude from Playwright (unit/integration indicators):
- "function returns", "API returns", "status code"
- "database", "validates input", "throws error"
- "component renders", "prop is passed", "state updates"
- "method called", "internal state"

## Examples

| Acceptance Criterion | Test Type | Repo |
|---------------------|-----------|------|
| User sees display name in header | E2E ✅ | Playwright |
| getUserDisplayName() returns fallback | Unit ❌ | Source |
| POST /lists returns 201 | Integration ❌ | Source |
| User creates list and sees it appear | E2E ✅ | Playwright |
| Database insert successful | Integration ❌ | Source |