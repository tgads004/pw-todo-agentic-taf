# Security Standards

## Secrets Management

### GitHub Tokens
- **NEVER commit tokens** - Use GitHub Secrets or Azure Key Vault
- **Token rotation**: Rotate every 90 days
- **Least privilege**: `repo` scope ONLY (no admin/delete)
- **Audit logging**: Log all API calls with token ID (not token value)

### Test Data
- **No PII in tests** - Use synthetic data generators
- **Credentials**: Store in Key Vault, reference via environment
- **Database cleanup**: Always delete test data after execution

### Code Scanning
- **Dependabot alerts**: Monitor and patch within 7 days
- **CodeQL scanning**: Enable on Playwright repo
- **Secret scanning**: GitHub Advanced Security

## Access Control

### Branch Protection (main)
- Require status checks (linting, test validation)


## Audit Requirements
- **Test execution logs**: Retain 90 days
- **Test result artifacts**: Retain 365 days
- **Agent changes**: Require approval from QA Lead
- **Feature spec changes**: Track source commit SHA in every test