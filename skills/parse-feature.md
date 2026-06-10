# Skill: Parse Feature Document

## Input

Raw markdown content of a feature document as a string.

## Process

1. Extract feature name from the first `# Feature:` heading (trim whitespace)
2. Extract API endpoints from markdown tables with columns containing "Method" and "Endpoint":
   - Match rows with `| GET |`, `| POST |`, `| PUT |`, `| DELETE |`
   - Capture the method and path from each matching row
3. Extract test scenarios from numbered lists under `## Test Scenarios`:
   - Match lines starting with `1.`, `2.`, etc.
   - Extract the bold text (`**...**`) as the scenario name
   - Extract the description after the dash (`- ...`)
4. Extract edge cases from lists under `## Edge Cases`
5. Extract authentication requirement from the line `## Authentication Required` — check next non-empty line for "Yes" or "No"

## Output

Return a JSON object with exactly this structure:

```json
{
  "featureName": "Todo CRUD",
  "endpoints": [
    { "method": "POST", "path": "/api/todos" },
    { "method": "GET", "path": "/api/todos" }
  ],
  "scenarios": [
    { "name": "Create todo", "description": "POST /api/todos with valid body returns 201" }
  ],
  "edgeCases": [
    "Empty title should return 400",
    "Non-existent ID should return 404"
  ],
  "requiresAuth": true
}
```

## Rules

- If a section is missing from the document, return an empty array for that field
- Do not fabricate data that isn't in the document
- The feature name should be the text after `# Feature:` on the same line