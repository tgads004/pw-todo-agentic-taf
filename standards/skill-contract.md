
# Standard: Skill Contract

This defines the **input/output contract** for every skill in the `/skills/` directory.

Every skill MUST define these sections in its `.md` file:

## Required Sections

### Input

Describe the exact data the skill expects. Use JSON schema notation:

```json
{
  "type": "object",
  "properties": {
    "method": { "type": "string", "enum": ["GET", "POST", "PUT", "DELETE"] },
    "path": { "type": "string", "pattern": "^/" }
  },
  "required": ["method", "path"]
}
```

### Output

Describe the exact data the skill returns. Use JSON schema notation:

```json
{
  "type": "object",
  "properties": {
    "status": { "type": "number" },
    "responseBody": { "type": "object" },
    "error": { "type": ["string", "null"] }
  },
  "required": ["status"]
}
```

### Process

Step-by-step instructions for the LLM to follow when executing this skill.

### Rules

Hard constraints the LLM must obey (e.g., "Never use XPath", "Always prefer data-testid").

## Optional Sections

### Examples

Provide 1-2 examples of input/output pairs so the LLM understands the expected format.

### See Also

References to related skills or standards.

## Validation Rules

- All skills must have exactly one Input section and one Output section
- Input/Output must specify all required fields
- The orchestrator validates that skill outputs match their declared schema
- If a skill's output fails validation, the orchestrator retries the LLM call once