# Reliability and Resilience Standards

## Overview

This document defines reliability and resilience patterns for E2E tests to ensure stable test execution under various failure scenarios. Tests must handle network issues, service degradation, and transient errors gracefully without producing false negatives.

## Circuit Breaker Pattern

The circuit breaker pattern prevents cascading failures by detecting repeated failures and temporarily blocking requests to failing services. This protects test infrastructure from overload during service outages.

### States

- **CLOSED**: Normal operation, requests proceed
- **OPEN**: Service failing, requests blocked immediately
- **HALF_OPEN**: Testing recovery, limited requests allowed

### Implementation

```typescript
// tests/fixtures/circuitBreaker.ts
class CircuitBreaker {
  private failureCount = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private readonly threshold = 5;
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker OPEN');
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }
  
  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      setTimeout(() => this.state = 'HALF_OPEN', 60000); // 1 min
    }
  }
}
```

## Retry Strategy

Configure intelligent retry policies with exponential backoff for transient failures. Retry only idempotent operations to prevent duplicate test data creation.

### Configuration

- Maximum retries: 3 attempts
- Initial delay: 1 second
- Backoff multiplier: 2x
- Maximum delay: 10 seconds

## Timeout Management

Set appropriate timeouts at multiple levels to prevent hanging tests while allowing sufficient time for legitimate operations.

### Timeout Hierarchy

- Test timeout: 30 seconds
- Action timeout: 10 seconds
- Navigation timeout: 15 seconds
- Assertion timeout: 5 seconds

## Health Checks

Implement pre-test health checks to verify service availability before executing test suites. Skip tests gracefully when dependencies are unavailable rather than producing false failures.

### Health Check Criteria

- API endpoint responds within 2 seconds
- Database connection established
- Authentication service available
- Required test data accessible