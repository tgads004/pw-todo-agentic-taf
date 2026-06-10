# Todo App — Playwright Test Repository

This repository contains the **agentic testing system** for the [todo-nodejs-mongo-aca](https://github.com/your-org/todo-nodejs-mongo-aca) application. It automatically generates, executes, and heals
Playwright end‑to‑end tests using the **Page Object Model**.

## How It Works

``` Main Project updates docs/features/*.md
  → Repository Dispatch event
  → This repo: Explorer → Generator → Run → Heal (if needed)
  → Commit tests that use BasePage, BaseTest, and page objects
```

## Project Structure

```├── features/                 # Feature docs (synced from main project)
├── agents/                   # Agent prompt files
├── skills/                   # Skill prompt files
├── standards/                # Style guides and contracts
├── scripts/                  # Orchestrator and utilities
└── tests/
    ├── generated/            # Auto‑generated test files
    ├── pages/                # Page Object classes
    │   ├── base.page.ts
    │   ├── todo.page.ts
    │   └── ...
    ├── helpers/              # Utility functions
    │   ├── api-helper.ts
    │   ├── data-generator.ts
    │   └── ...
    ├── selectors/            # Selectors organized by page
    │   ├── todo.selectors.ts
    │   └── ...
    └── base-test.ts          # Base test class (setup, teardown, auth)
```

## Quick Start

### Prerequisites

- Node.js 20+, npm
- Running instance of the application (local or deployed)
- LLM API key (OpenAI) or local Ollama

### Installation

```bash
git clone <this-repo>
cd playwright-repo
npm install
npx playwright install chromium
cp .env.example .env   # Edit as needed
```

### Run the Orchestrator

```bash
node scripts/orchestrator.mjs todo-crud
```

### Run Generated Tests Directly

```bash
npx playwright test tests/generated/todo-crud.spec.ts
```

## Automatic Triggers

The system is triggered by Repository Dispatch events from the main project. The workflow downloads changed feature docs into `features/` and runs the orchestration.

## Test Architecture

- **Page Objects**: Each UI screen has a page class (e.g., `TodoPage`) extending `BasePage`
- **Base Page**: Provides common navigation, waiting, and selector resolution methods
- **Base Test**: Handles authentication, global setup, and cleanup
- **Helpers**: `ApiHelper` for direct API calls, `DataGenerator` for test data
- **Selectors**: Stored in `tests/selectors/<page>.selectors.ts` as exported objects, imported by page objects

## Contributing

See [AGENTS.md](AGENTS.md) for detailed agent documentation and how to add new skills or agents.
