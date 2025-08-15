# Contributing to Shelf Bookstore

Thanks for your interest in contributing to Shelf! This document provides guidelines for contributing to the project.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots if applicable
- Your environment details (OS, browser, Node version, etc.)

### Suggesting Features

Feature requests are welcome! Please provide:

- Clear use case for the feature
- Detailed description of the solution
- Alternative solutions you've considered
- Mockups or examples if applicable

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and security checks
5. Commit with clear messages
6. Push to your branch
7. Open a pull request

## Development Setup

### Prerequisites

- Node.js v18 or higher
- Yarn (we use Yarn exclusively, not npm)
- Python 3.9 or higher
- Git

### Getting Started

1. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/shelf-bookstore.git
   cd shelf-bookstore
   ```

2. Set up backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   python init_db.py
   ```

3. Set up frontend:
   ```bash
   cd frontend
   yarn install
   cp .env.example .env
   ```

4. Run security setup:
   ```bash
   ./setup-security.sh
   ```

## Code Style

### Python (Backend)

- Follow PEP 8
- Use Black for formatting
- Run Bandit for security checks
- Type hints are encouraged

### JavaScript/TypeScript (Frontend)

- Use ESLint configuration provided
- Prettier for formatting
- TypeScript for type safety
- Functional components with hooks for React

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Formatting changes
- `refactor:` Code restructuring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

## Testing

### Running Tests

Backend tests:
```bash
cd backend
pytest
```

Frontend tests:
```bash
cd frontend
yarn test
```

Security scan:
```bash
./run-security-scan.sh
```

### Writing Tests

- Write tests for new features
- Maintain existing test coverage
- Include edge cases
- Test error handling

## Security

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Run security scans before submitting PR
- Report security issues to shailysharmawork@gmail.com

## Pull Request Process

1. Update documentation for any API changes
2. Update README.md with new environment variables
3. Run all tests and ensure they pass
4. Run security scans and fix any issues
5. Request review from maintainers
6. Address review feedback promptly

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We're committed to providing a welcoming and inclusive environment.

## Questions?

Feel free to reach out:
- Open an issue for questions
- Email: shailysharmawork@gmail.com
- GitHub: [@SHAILY24](https://github.com/SHAILY24)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Shelf! Every contribution, no matter how small, is valued and appreciated.