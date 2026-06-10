# Skill: Capture DOM Selectors

## Input

Array of interactive DOM elements, each with these possible attributes:

- `tag`, `text`, `id`, `class`, `data-testid`, `href`, `type`, `name`, `placeholder`, `ariaLabel`, `role`

## Process

1. Group elements by their likely page based on URL path and element context:
   - Elements on `/todos` → page name `todo`
   - Elements on `/login` → page name `auth`
   - Elements on `/` → page name `home`

2. For each element, generate the most stable selector using this priority order:
   - `[data-testid="<value>"]` — highest priority
   - `[aria-label="<value>"]`
   - `role=<role>[name="<text>"]`
   - `getByText("<text>")`
   - `[placeholder="<value>"]`
   - `[name="<value>"]`
   - `#<id>` — only if meaningful
   - CSS selector — last resort

3. For elements that appear in lists (e.g., todo items with IDs), generate a **dynamic selector function**:
   - `deleteButton: (id: string) => \`[data-testid="delete-todo-${id}"]\``

4. Name each selector with a descriptive camelCase key:
   - `addButton`, `titleInput`, `submitButton`, `todoList`

## Output

Return a JSON object mapping page names to their selector file content:

```json
{
  "todo": {
    "filePath": "tests/selectors/todo.selectors.ts",
    "selectors": {
      "addButton": "[data-testid='add-todo-button']",
      "titleInput": "[placeholder='Enter title']",
      "submitButton": "button:has-text('Save')",
      "todoList": "[data-testid='todo-list']",
      "deleteButton": "(id: string) => `[data-testid='delete-todo-${id}']`"
    }
  },
  "auth": {
    "filePath": "tests/selectors/auth.selectors.ts",
    "selectors": {
      "loginButton": "[data-testid='login-button']",
      "usernameInput": "[placeholder='Username']"
    }
  }
}
```

## Rules

- Always prefer `data-testid` over any other selector type
- Never generate XPath selectors
- Group elements by page — do not mix pages in the same output
- For dynamic elements (list items, detail views), generate function selectors
- If an element has no stable selector, exclude it rather than using a fragile one