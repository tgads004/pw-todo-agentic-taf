---
name: test-factory-orchestrator
description: End-to-end test generation orchestrator
user-invocable: true
argument-hint: "A feature name, branch, or commit SHA to generate E2E tests for"
---

# Test Factory - E2E Test Generation Orchestrator

Coordinates 6 specialized agents to generate a complete, production-ready E2E test suite.

## Purpose

Act as the primary state machine and execution gatekeeper for the automated Playwright Test Factory, managing inter-agent communications, data pipelines, and mandatory human-in-the-loop approval checkpoints.

## Input

- Direct user or webhook request containing a feature identifier, branch name, or specific source repository commit SHA.

## Output

- Orchestrates the delivery of verified Page Objects, custom Core/Fixture contexts, and clean E2E specifications.
- Consolidates automated pipeline run logs and final test execution reports.

## Workflow

The orchestrator maps out data outputs from upstream agents sequentially and feeds them into downstream tasks using the following execution sequence:

1. **[spec-fetcher.agent]** ──► Fetches raw specs via the source repository API.
2. **[test-analyzer.agent]** ──► Filters E2E test scenarios (skips unit/integration targets).
3. **⚠️ HUMAN APPROVAL REQUIRED** ──► Structural Review: Sign off on target Test Plan scenarios.
4. **[page-object-generator.agent]** ──► Generates semantic Page Objects and UI Components.
5. **[fixture-builder.agent]** ──► Registers elements into baseTest and handles custom fixtures.
6. **[test-generator.agent]** ──► Compiles final automated E2E test specification files.
7. **[test-runner.agent]** ──► Executes generated test cases and aggregates logs.
8. **⚠️ HUMAN APPROVAL REQUIRED** ──► Execution Review: Sign off on final test results & metrics.

```text
1. [spec-fetcher.agent]
        │
        ▼
2. [test-analyzer.agent]
        │
        ▼
3. ⚠️ HUMAN APPROVAL: Test Plan
        │
        ▼
4. [page-object-generator.agent]
        │
        ▼
5. [fixture-builder.agent]
        │
        ▼
6. [test-generator.agent]
        │
        ▼
7. [test-runner.agent]
        │
        ▼
8. ⚠️ HUMAN APPROVAL: Results
```

## Usage

Human users can trigger the end-to-end lifecycle by calling the orchestrator directly with a clear scope boundary:

```text
User: "Run test factory for display-user-name-in-header"
```

The orchestrator catches this command, extracts the string target, provisions a clean local `.temp-specs/` workspace context, and begins executing sub-agents sequentially while halting at defined approval gates.

## Error Recovery

If a specialized agent throws an unhandled exception or fails validation loops during any execution layer, the orchestrator executes the following containment protocol:

1. **Isolate and Log**: Halt the pipeline immediately, capture standard error streams, and write diagnostic records to local log streams.
2. **Report**: Disclose the exact component failure and context parameters to the user interface layer.
3. **Remediation**: Suggest explicit manual interventions or code modifications required to clear the blocking hurdle.
4. **Interactive Recovery**: Prompt the user with choices to either **Retry** the failed agent step (post-fix), **Skip** the execution branch, or **Abort** the factory instance safely.

## Validation

Before closing out an execution lifecycle:
- ✅ Verify all intermediate artifacts are cached inside localized tracking layers.
- ✅ Enforce that all generated files have successfully cleared code quality audits (`npm run lint`).
