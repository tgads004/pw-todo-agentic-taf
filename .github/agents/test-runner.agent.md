---
name: test-runner
description: Executes tests and reports results when Tests generated and ready to run
user-invocable: true
tools: [execute, read]
---

# Test Runner Agent

Runs tests, analyzes failures, posts results to source PR.

## Execution

```bash
npx playwright test tests/e2e/{{feature}}.spec.ts --reporter=html,json
```


# Result Report (posted to source PR)

## ✅ E2E Test Results

**Feature:** {{feature_name}}  
**Status:** {{status}}  
**Tests:** {{passed}}/{{total}} passed  
**Duration:** {{duration}}

[View Report →]({{artifact_url}})