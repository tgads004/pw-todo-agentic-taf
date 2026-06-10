
# Standard: Agent Protocol

This defines how agents call skills and pass data between them.

## Agent-to-Skill Communication

Agents declare skill dependencies at the top of their `.md` file:

```## Skills Used
- `parse-feature-doc` — to extract endpoints
- `probe-api-endpoint` — to call APIs
```

The orchestrator resolves these references and injects the skill content into the LLM prompt.

## Data Flow Between Phases

``` parse-feature-doc → { featureName, endpoints, scenarios, edgeCases }
         ↓
probe-api-endpoint → { method, path, status, responseBody, error }
         ↓
capture-dom-selectors → { totalElements, elements }
         ↓
generate-assertions → [ assertion strings ]
         ↓
All combined → Exploration Report JSON → Generator Agent
```

## Agent Output Format

All agents MUST output their results as JSON (for data processing) or TypeScript code blocks (for code generation).

| Agent | Output Format |
| --- | --- |
| Explorer | JSON object with `featureName`, `endpoints`, `scenarios`, `selectors` |
| Generator | TypeScript code block containing a complete test file |
| Healer | TypeScript code block containing the fixed test file |

## Error Propagation

- If a skill fails, the agent MUST record the error but continue processing other skills
- If all skills fail for an agent, the agent returns an error object: `{ error: "description", phase: "explorer|generator|healer" }`
- The orchestrator checks for errors before proceeding to the next phase