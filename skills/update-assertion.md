# Skill: Update Assertion

## Input

- `current_test_code`: The full test code as a string
- `failure_diagnosis`: The diagnosis object from `diagnose-failure` skill
- `current_api_responses`: Current API responses from latest exploration
- `page_name`: The page object class being used

## Process

1. Identify the failing assertion line in the test code using `failingLine` from diagnosis
2. Read the expected value and actual value from the diagnosis
3. Check the current API response for the correct expected value
4. Generate a replacement assertion:

   **Status code changed:**
   - Old: `expect(response.status()).toBe(200)`
   - New: `expect(response.status()).toBe(201)`

   **Property name changed:**
   - Old: `expect(body).toHaveProperty('task')`
   - New: `expect(body).toHaveProperty('title')`

   **Page object method changed:**
   - Old: `await todoPage.addTodo('Test')`
   - New: `await todoPage.createTodo('Test')`

   **Helper method changed:**
   - Old: `const response = await apiHelper.createTodo({ title: 'Test' })`
   - New: `const response = await apiHelper.createTask({ title: 'Test' })`

5. If the surrounding context changed (e.g., different endpoint, different method), update the entire block

## Output

Return a JSON object:

```json
{
  "lineNumber": 15,
  "oldCode": "expect(response.status()).toBe(200);",
  "newCode": "expect(response.status()).toBe(201);",
  "reason": "API now returns 201 Created instead of 200 OK for POST requests"
}
```

## Rules

- Only change the minimum necessary to fix the assertion
- If multiple assertions are affected, return one entry per change
- If the entire test logic is wrong, indicate that regeneration is needed
- Prefer updating page object methods over inline test code