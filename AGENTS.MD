# Test Agent Instructions — Cross-Repository E2E Tests

**BEFORE making any changes:** Read this file AND every markdown file in `/docs/` directory in full. Do not modify, create, or delete any code until all standards files have been read.  ALWAYS follow these instructions when reading, writing, or modifying any code in this repository.

**Integration:** Webhook-driven, API-fetched specs  

## Purpose
Generate and maintain **E2E tests only** from feature specifications in source repository tgads004/todo-nodejs-mongo-aca.

---

## Source Repository References

### Feature Documentation Source
- **Required files:** story.md, spec.md, test-plan.md
**Source Repository:** `tgads004/todo-nodejs-mongo-aca`  

### Application Architecture
For detailed architecture, see source repo: `docs/architecture.md`

---

## Testing Pyramid Boundaries

**CRITICAL:** This repository handles E2E user workflows ONLY (top of Testing Pyramid)
               ╱ E2E Tests ╲          ← THIS REPO
              ╱─────────────╲           (Playwright)
             ╱               ╲
            ╱  Integration    ╲       ← SOURCE REPO
           ╱─────────────────╲         (Jest + Supertest)
          ╱                   ╲
         ╱    Unit Tests       ╲      ← SOURCE REPO
        ╱───────────────────────╲      (Jest)



### Critical: What Playwright Tests SHOULD Cover
Focus on end-to-end user journeys and observable UI behavior. Examples include:
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
Avoid testing unit-level, API-level, or implementation details handled by the source repository.  Examples include:
**Unit-level concerns (handled by source repo):**
- "getUserDisplayName() returns fallback when name claim missing"
- "createList() throws error with invalid input"
- "TodoItem component renders with correct props"
**API-level concerns (handled by source repo):**
- "POST /lists returns 201 status code"
- "GET /lists?filter=active returns only active lists"
- "API validates required fields"
**Implementation details:**
- Function return values
- Internal state management
- Database queries
- HTTP status codes (unless visible to user)

## Test Selection from Feature Specs

See `test-docs/test-selection-criteria.md` (this repo) for filtering logic.
When parsing `test-plan.md`, **only generate E2E tests for:**

1. **Acceptance criteria describing user actions:**
   - "Given user is logged in, When they view header, Then they see their name"
   - "Given MSAL returns name claim, When component renders, Then Persona displays name"

2. **Observable user outcomes:**
   - "User sees confirmation message after creating list"
   - "API returns 201 status code"

3. **Multi-step user workflows:**
   - "User creates list, adds items, marks complete, filters by status"
   - "Database query returns correct records"

---

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

---

## Non-Negotiable Rules

1. **E2E tests only** - No unit or integration test duplication
2. **Always fetch latest** - Use GitHub API, never cache specs
3. **One feature = one test file** - Clear 1:1 mapping
4. **Traceability required** - Test files include source commit SHA
5. **Page Object Model mandatory** - No raw selectors in tests
6. **Data cleanup required** - Every test cleans up created data
7. **Tests are generated** - Not manually written (except overrides)
8. **Plain text markdown** - no emojis or special Unicode characters, Follow conventional markdown syntax