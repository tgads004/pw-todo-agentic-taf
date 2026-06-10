# Skill: Fix Selector

## Input

- `broken_selector`: The selector string that failed
- `current_dom_elements`: Array of current DOM elements from exploration
- `selector_context`: The semantic purpose of the element (e.g., "add button", "search input")
- `page_name`: The page the element belongs to (e.g., "todo")

## Process

1. Understand what the broken selector was trying to target based on its string pattern:
   - `[data-testid="..."]` → find by test ID
   - `text="..."` or `:has-text("...")` → find by text content
   - `[placeholder="..."]` → find by placeholder
   - `[name="..."]` → find by name attribute
   - `role=...` → find by ARIA role and name

2. Search the `current_dom_elements` for a matching replacement:
   - First, look for the same `data-testid` (might have changed value)
   - Then, look for the same text content (might have changed casing or wording)
   - Then, look for the same placeholder or name
   - Finally, look for elements with similar semantic context

3. Generate a replacement selector using the standard priority:
   - `[data-testid="<new_value>"]` if available
   - `[aria-label="<text>"]` if available
   - `role=<role>[name="<text>"]` if both are available
   - `getByText("<exact text>")` otherwise

4. Determine which selector file to update:
   - `tests/selectors/<page_name>.selectors.ts`

5. Generate the updated selector file content with the fixed selector

## Output

Return a JSON object:

```json
{
  "originalSelector": "[data-testid='add-todo-button']",
  "replacementSelector": "[aria-label='Add a new todo']",
  "selectorFile": "tests/selectors/todo.selectors.ts",
  "selectorKey": "addButton",
  "confidence": "high",
  "explanation": "The data-testid was removed. Found element with matching aria-label 'Add a new todo'."
}
```

## Rules

- Only replace selectors when the replacement is semantically equivalent
- Set confidence to "high" if exact text match found, "medium" if fuzzy match, "low" if guessing
- Never suggest XPath as replacement
- If no good replacement exists, return `"replacementSelector": null` and explain why
- Always specify which selector file and key to update
