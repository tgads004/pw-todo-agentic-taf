# Observability Standards — Playwright Test Factory

## Overview
Purpose: Structured logging, metrics, and alerting for test generation workflow

---

## Structured Logging Format (JSON)
```json
{
  "timestamp": "2026-06-02T10:30:00Z",
  "level": "INFO",
  "agent": "test-generator",
  "feature_name": "display-user-name-in-header",
  "source_repo": "tgads004/todo-nodejs-mongo-aca",
  "source_sha": "abc123...",
  "message": "Generated 5 E2E tests",
  "duration_ms": 1250,
  "test_count": 5,
  "correlation_id": "uuid-here"
}
```

---

## Log Levels

- **ERROR**: Test generation failures, API errors, invalid specs
- **WARN**: Skipped tests (non-E2E), rate limit warnings
- **INFO**: Agent execution, test generation, workflow progress
- **DEBUG**: Detailed parsing, GitHub API responses

---

## Metrics to Track

### Workflow Metrics
| Metric | Description | Target |
|---|---|---|
| `test_generation_duration_ms` | Time to generate tests | < 30s |
| `test_execution_duration_ms` | Time to run all tests | < 5min |
| `spec_fetch_success_rate` | % successful spec fetches | > 99% |
| `test_pass_rate` | % tests passing | > 95% |
| `github_api_rate_limit_remaining` | Remaining API calls | > 100 |

### Agent Performance
- **spec-fetcher**: Fetch time, cache hit rate
- **test-analyzer**: Parse time, E2E filter accuracy
- **test-generator**: Generation time, Page Object complexity
- **test-runner**: Execution time, flakiness rate

---

## Alerting

### Critical Alerts (PagerDuty/Teams)
- Test generation fails 3 times in a row
- Test pass rate drops below 90%
- GitHub API rate limit < 10 remaining
- Spec fetch fails for merged PR

### Warning Alerts (Email/Slack)
- Test execution takes > 10 minutes
- More than 5 tests skipped in one run
- GitHub API rate limit < 100 remaining

---

## Dashboards

### Azure Monitor Workbook (recommended)
- **Test Generation Overview**: Success rate, duration trends, agent performance
- **Test Execution**: Pass/fail rates, flakiness trends, execution time
- **GitHub API Health**: Rate limit usage, request patterns, error rates

### Grafana Alternative
[Configuration for self-hosted monitoring]

---

## Log Retention

- **GitHub Actions logs**: 90 days (GitHub default)
- **Azure Monitor logs**: 90 days (compliance requirement)
- **Test artifacts**: 30 days (Playwright reports, traces)