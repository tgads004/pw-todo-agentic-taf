# Skill: Generate Assertions

## Input

- `feature_scenario`: A test scenario object with name and description
- `api_response`: The actual API response captured during exploration (status + body)
- `feature_doc`: The original feature document for expected behavior
- `page_name`: The page object class to use (e.g., "TodoPage")

## Process

1. Read the scenario description to understand what's being tested
2. Compare the actual API response against expected behavior from the feature doc
3. Generate assertions using page objects and helpers:

   **For API status codes:**
   - `expect(response.status()).toBe(201)`

   **For response bodies:**
   - `expect(body).toHaveProperty('id')`
   - `expect(body.title).toBe('Expected Title')`

   **For UI elements (using page objects):**
   - `await expect(todoPage.addButton).toBeVisible()`
   - `await expect(todoPage.todoList).toContainText('Test Item')`

   **For API calls via helpers:**
   - `const response = await apiHelper.createTodo({ title: 'Test' })`
   - `expect(response.status()).toBe(201)`

4. Wrap assertions in proper Playwright syntax with `await` and `expect`

## Output

Return an array of assertion strings ready to insert into a test:

```json
[
  "const todoPage = new TodoPage(page);",
  "await todoPage.addTodo('Test Item');",
  "await expect(todoPage.todoList).toContainText('Test Item');"
]
```

## Rules

- Base assertions on actual API behavior, not just the doc
- Always include a status code assertion for API calls
- Use page object methods for UI interactions, not raw selectors
- Use helpers for direct API calls (ApiHelper, DataGenerator)
- For array responses, assert length or check specific elements