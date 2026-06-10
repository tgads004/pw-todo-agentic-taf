# Skill: Diagnose Failure

## Input

- `failure_error`: The full error output from a Playwright test run (string)

## Process

1. Classify the error type by searching for keywords:

   | Keyword Pattern | Error Type | Root Cause |
   | --- | --- | --- |
   | `locator` + `not found` or `timeout` | Selector Failure | DOM element doesn't exist or selector is wrong |
   | `expected * to be * but got *` | Assertion Failure | API response or UI state changed |
   | `net::ERR_CONNECTION_REFUSED` | Network Failure | Service not running or URL wrong |
   | `page.goto: Timeout` | Navigation Failure | App not loading or URL changed |
   | `Cannot read properties of undefined` | Response Shape Change | API returned different structure |
   | `401` or `403` | Authentication Failure | Auth bypass not working or token expired |
   | `500` | Server Error | API bug or missing dependency |

2. Extract the **failing line number** from the error stack trace
3. Extract the **expected vs actual values** from assertion errors
4. Extract the **selector string** from locator errors
5. Summarize the failure in one sentence

## Output

Return a JSON object:

```json
{
  "errorType": "selector_failure" | "assertion_failure" | "network_failure" | "navigation_failure" | "response_shape_change" | "auth_failure" | "server_error",
  "failingLine": 42,
  "expectedValue": "[data-testid='add-todo-button']",
  "actualValue": "element not found",
  "selectorString": "[data-testid='add-todo-button']",
  "summary": "The 'add Todo' button selector no longer matches the DOM"
}
```

## Rules

- Be precise — extract exact strings from the error message
- If the error type is ambiguous, default to "assertion_failure"
- Never modify the test code during diagnosis — only analyze