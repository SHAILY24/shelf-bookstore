# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Tools & Practices

This project implements comprehensive security measures using industry-standard tools:

### 🔐 Secret Detection
- **Gitleaks**: Scans for secrets in code and git history
- **Pre-commit hooks**: Prevents committing secrets
- **GitHub Secret Scanning**: Automatic detection in repository

### 🐍 Python Security
- **Bandit**: Static security analysis for Python code
- **Safety**: Checks Python dependencies for known vulnerabilities
- **pip-audit**: Audits Python packages for security issues

### 📦 JavaScript/React Security
- **ESLint Security Plugin**: Identifies security issues in JavaScript/TypeScript
- **Yarn Audit**: Checks npm dependencies for vulnerabilities
- **Dependabot**: Automated dependency updates

### 🐳 Container Security (if applicable)
- **Trivy**: Vulnerability scanner for containers and file systems
- **Hadolint**: Dockerfile linting for security best practices

### 🔍 Continuous Security
- **GitHub Actions**: Automated security scanning on every push/PR
- **CodeQL**: Semantic code analysis for security vulnerabilities
- **SAST**: Static Application Security Testing

## Running Security Checks Locally

### Prerequisites
```bash
# Install Python security tools
pip install bandit safety pip-audit

# Install Gitleaks
wget https://github.com/gitleaks/gitleaks/releases/download/v8.28.0/gitleaks_8.28.0_linux_x64.tar.gz
tar -xzf gitleaks_8.28.0_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/

# Install pre-commit
pip install pre-commit
pre-commit install
```

### Manual Security Scans

#### 1. Secret Detection
```bash
# Scan entire repository
gitleaks detect --source . --verbose

# Scan staged changes only
gitleaks protect --staged --verbose
```

#### 2. Python Security
```bash
# Run Bandit security scan
bandit -r backend/ -ll

# Check for vulnerable dependencies
safety check -r backend/requirements.txt
pip-audit -r backend/requirements.txt
```

#### 3. JavaScript/React Security
```bash
cd frontend

# Run ESLint with security plugin
yarn eslint . --ext .js,.jsx,.ts,.tsx

# Audit dependencies
yarn audit
yarn audit --level moderate
```

#### 4. Run All Pre-commit Hooks
```bash
# Run on all files
pre-commit run --all-files

# Run specific hook
pre-commit run gitleaks --all-files
pre-commit run bandit --all-files
```

## Security Best Practices

### Environment Variables
1. **Never commit** `.env` files with real credentials
2. Use `.env.example` files with placeholder values
3. Store secrets in environment variables or secure vaults
4. Rotate credentials regularly

### Dependencies
1. Keep all dependencies up to date
2. Review dependency licenses
3. Audit dependencies regularly
4. Use lock files (yarn.lock, requirements.txt)

### Code Practices
1. Validate all user inputs
2. Use parameterized queries for databases
3. Implement proper authentication and authorization
4. Follow OWASP guidelines
5. Enable HTTPS in production
6. Implement rate limiting
7. Use secure session management

### Git Security
1. Sign commits with GPG keys
2. Use branch protection rules
3. Require PR reviews before merging
4. Enable required status checks

## Reporting Security Vulnerabilities

### For Private Disclosure

**DO NOT** create public issues for security vulnerabilities.

Instead, please report security vulnerabilities via:
1. **GitHub Security Advisories**: Navigate to the Security tab > Report a vulnerability
2. **Email**: security@[your-domain].com (if applicable)

### What to Include
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### Response Timeline
- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Resolution Target**: Within 30 days for critical issues

## Security Checklist

### Before Committing
- [ ] Run `gitleaks detect` to check for secrets
- [ ] Review changes for hardcoded credentials
- [ ] Ensure `.env` files are in `.gitignore`
- [ ] Run security linters (Bandit, ESLint)

### Before Deployment
- [ ] Update all dependencies
- [ ] Run full security scan suite
- [ ] Review security headers
- [ ] Verify HTTPS configuration
- [ ] Check API rate limiting
- [ ] Review authentication flows
- [ ] Test authorization rules
- [ ] Validate input sanitization

### Weekly Security Tasks
- [ ] Review Dependabot alerts
- [ ] Check for new CVEs in dependencies
- [ ] Review access logs for anomalies
- [ ] Rotate development credentials
- [ ] Update security tools

### Monthly Security Tasks
- [ ] Full dependency audit
- [ ] Review and update security policies
- [ ] Security training/awareness
- [ ] Incident response drill
- [ ] Review security metrics

## Security Configuration Files

| File | Purpose |
|------|---------|
| `.gitleaks.toml` | Gitleaks configuration |
| `.bandit` | Bandit Python security scanner config |
| `.pre-commit-config.yaml` | Pre-commit hooks including security checks |
| `.github/workflows/security.yml` | GitHub Actions security workflow |
| `pyproject.toml` | Python tools configuration |
| `eslint.config.js` | ESLint with security rules |

## Emergency Response

### If a Secret is Exposed

1. **Immediately rotate** the exposed credential
2. **Revoke** the old credential if possible
3. **Review logs** for any unauthorized access
4. **Run** `gitleaks detect` to check for other exposures
5. **Remove from history** using:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch PATH-TO-FILE" \
     --prune-empty --tag-name-filter cat -- --all
   ```
6. **Force push** to remote (coordinate with team)
7. **Document** the incident and response

### Security Incident Template
```markdown
## Incident: [Brief Description]
**Date**: [Date/Time]
**Severity**: Critical/High/Medium/Low
**Status**: Active/Resolved

### Description
[What happened]

### Impact
[What was affected]

### Response Actions
1. [Action taken]
2. [Action taken]

### Prevention
[Steps to prevent recurrence]

### Lessons Learned
[What we learned]
```

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [Bandit Documentation](https://bandit.readthedocs.io/)
- [ESLint Security Plugin](https://github.com/eslint-community/eslint-plugin-security)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)

## License

This security policy is part of the project and follows the same license terms.