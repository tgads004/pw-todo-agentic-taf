# Playwright Todo Agentic Test Automation Framework

A comprehensive end-to-end test automation framework built with Playwright and TypeScript, designed for testing web applications across multiple browsers.

## 🚀 Features

- **Multi-Browser Support**: Tests run on Chromium, Firefox, and WebKit
- **TypeScript**: Full TypeScript support for type safety and better IDE integration
- **Parallel Execution**: Tests run in parallel for faster execution
- **Environment Variables**: `.env` file support for configuration management
- **Rich Reporting**: HTML reports with screenshots and videos on failure
- **Flexible Test Modes**: Headless, headed, debug, and UI modes
- **CI/CD Ready**: GitHub Actions workflow included

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pw-todo-agentic-taf
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

4. (Optional) Set up environment variables:
```bash
copy .env.example .env
```
Edit `.env` file with your configuration values.

## 📂 Project Structure

```
pw-todo-agentic-taf/
├── tests/                      # Test files
│   ├── example.spec.ts        # Sample Playwright.dev tests
│   └── todo.spec.ts           # TodoMVC application tests
├── playwright.config.ts       # Playwright configuration
├── package.json               # Project dependencies and scripts
├── .env.example              # Example environment variables
├── .gitignore                # Git ignore patterns
└── README.md                 # This file
```

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests (headless mode)
npm test

# Run tests with browser visible
npm run test:headed

# Run tests in interactive UI mode
npm run test:ui

# Run tests in debug mode (step-by-step)
npm run test:debug

# View HTML test report
npm run test:report
```

### Browser-Specific Commands

#### Chromium
```bash
npm run test:chromium              # Headless
npm run test:chromium:headed       # With browser UI
npm run test:chromium:debug        # Debug mode
```

#### Firefox
```bash
npm run test:firefox               # Headless
npm run test:firefox:headed        # With browser UI (sequential)
npm run test:firefox:debug         # Debug mode
```

#### WebKit
```bash
npm run test:webkit                # Headless
npm run test:webkit:headed         # With browser UI (sequential)
npm run test:webkit:debug          # Debug mode
```

### Advanced Usage

```bash
# Run specific test file
npx playwright test tests/todo.spec.ts

# Run tests matching a pattern
npx playwright test -g "should add a new todo"

# Run with custom workers (parallel threads)
npx playwright test --workers=4

# Run in specific browser with options
npx playwright test --project=chromium --headed --workers=1

# Generate code from browser interactions
npx playwright codegen
```

## ⚙️ Configuration

### Playwright Configuration

The [playwright.config.ts](playwright.config.ts) file contains:

- **Test Directory**: `./tests`
- **Timeout**: 30 seconds per test
- **Expect Timeout**: 5 seconds for assertions
- **Retries**: 2 retries on CI, 0 locally
- **Workers**: 1 on CI, unlimited locally
- **Reporter**: HTML report
- **Screenshots**: On failure only
- **Video**: Retained on failure
- **Trace**: Collected on first retry

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
BASE_URL=http://localhost:3000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=your_password
API_BASE_URL=http://localhost:3001/api
TEST_ENV=development
```

Access variables in tests:
```typescript
const baseUrl = process.env.BASE_URL;
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

Reports include:
- Test execution timeline
- Screenshots of failures
- Videos of failed tests (when configured)
- Test traces for debugging

## 🧰 Useful Playwright Commands

```bash
# Update Playwright to latest version
npm install -D @playwright/test@latest

# Install/update browsers
npx playwright install

# Show Playwright version
npx playwright --version

# Open Playwright Inspector
npx playwright test --debug

# Record a new test
npx playwright codegen <url>
```

## 📝 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.com');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.getByRole('button', { name: 'Submit' });
    
    // Act
    await button.click();
    
    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Best Practices

- Use Page Object Model for complex applications
- Prefer user-facing locators (role, text, label)
- Keep tests independent and isolated
- Use `test.describe` to group related tests
- Add meaningful test descriptions
- Use `beforeEach` for common setup

## 🔧 Troubleshooting

### Tests Running Too Fast to See

Use headed mode with single worker:
```bash
npm run test:firefox:headed
```

### Browser Not Opening

Make sure you're using `:headed` scripts or `--headed` flag:
```bash
npx playwright test --headed
```

### Port Already in Use (Report Server)

Kill the process using the port or use a different port:
```bash
npx playwright show-report --port=9324
```

### Tests Failing Intermittently

1. Increase timeouts in `playwright.config.ts`
2. Add explicit waits: `await page.waitForLoadState('networkidle')`
3. Use retry logic for flaky tests
4. Check network conditions

## 🚦 CI/CD Integration

A GitHub Actions workflow is included in `.github/workflows/playwright.yml`:

- Runs on push and pull requests
- Tests across all browsers
- Uploads test reports as artifacts
- Runs in headless mode

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [Writing Tests](https://playwright.dev/docs/writing-tests)

## 📄 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure they pass
5. Submit a pull request

## 📧 Support

For issues or questions, please create an issue in the repository.

---

**Happy Testing! 🎭**
