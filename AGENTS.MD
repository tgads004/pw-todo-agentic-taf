# Test Agent Instructions — Cross-Repository E2E Tests

**Source Repository:** `tgads004/todo-nodejs-mongo-aca`  
**Integration:** Webhook-driven, API-fetched specs  
**Test Scope:** E2E user workflows ONLY (top of Testing Pyramid)

## Testing Pyramid Boundaries
               ╱ E2E Tests ╲          ← THIS REPO
              ╱─────────────╲           (Playwright)
             ╱               ╲
            ╱  Integration    ╲       ← SOURCE REPO
           ╱───────────────────╲         (Jest + Supertest)
          ╱                     ╲
         ╱    Unit Tests         ╲      ← SOURCE REPO
        ╱─────────────────────────╲      (Jest)



### Critical: What Playwright Tests SHOULD Cover

**User-visible workflows:**
- "User can create a todo list and see it appear in the list"
- "Authenticated user sees their name in the header"
- "User can mark a todo item as complete and it shows checkmark"
- "User can filter todo lists by status"

**Cross-page flows:**
- "User creates list → adds item → edits item → deletes item"
- "User logs in → creates data → logs out → data persists on login"

**UI interactions:**
- Click buttons, fill forms, navigate pages
- Visual state changes, animations, modals
- Accessibility (screen reader labels, keyboard navigation)

### Critical: What Playwright Tests SHOULD NOT Cover

**Unit-level concerns (handled by source repo):**
- ❌ "getUserDisplayName() returns fallback when name claim missing"
- ❌ "createList() throws error with invalid input"
- ❌ "TodoItem component renders with correct props"

**API-level concerns (handled by source repo):**
- ❌ "POST /lists returns 201 status code"
- ❌ "GET /lists?filter=active returns only active lists"
- ❌ "API validates required fields"

**Implementation details:**
- ❌ Function return values
- ❌ Internal state management
- ❌ Database queries
- ❌ HTTP status codes (unless visible to user)

## Test Selection from Feature Specs

When parsing `test-plan.md`, **only generate E2E tests for:**

1. **Acceptance criteria describing user actions:**
   - ✅ "Given user is logged in, When they view header, Then they see their name"
   - ❌ "Given MSAL returns name claim, When component renders, Then Persona displays name"

2. **Observable user outcomes:**
   - ✅ "User sees confirmation message after creating list"
   - ❌ "API returns 201 status code"

3. **Multi-step user workflows:**
   - ✅ "User creates list, adds items, marks complete, filters by status"
   - ❌ "Database query returns correct records"

## Agent Architecture

This repository uses 6 specialized agents orchestrated by skills:

| Agent | Role |
|-------|------|
| **spec-fetcher** | Fetches feature specs from source repo via GitHub API |
| **test-analyzer** | Parses specs, filters for E2E tests, plans coverage |
| **page-object-generator** | Creates Page Object Model classes |
| **fixture-builder** | Builds Playwright fixtures (auth, cleanup) |
| **test-generator** | Generates test files with traceability |
| **test-runner** | Executes tests, analyzes failures, reports results |

## Workflow

Source Repo: Feature merged
↓
Webhook sent
↓
Playwright Repo: feature-receiver.yml triggered
↓
Agents orchestrate test generation
↓
Tests executed automatically
↓
Results posted back to source PR


## Non-Negotiable Rules

1. **E2E tests only** - No unit or integration test duplication
2. **Always fetch latest** - Use GitHub API, never cache specs
3. **One feature = one test file** - Clear 1:1 mapping
4. **Traceability required** - Test files include source commit SHA
5. **Page Object Model mandatory** - No raw selectors in tests
6. **Data cleanup required** - Every test cleans up created data
7. **Tests are generated** - Not manually written (except overrides)