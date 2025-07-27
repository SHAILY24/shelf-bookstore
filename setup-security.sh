#!/bin/bash

# Security Setup Script for PureHD Bookstore POC
# This script installs and configures all security tools

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if running on Linux/macOS
if [[ "$OSTYPE" != "linux-gnu"* ]] && [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for Linux and macOS only"
    exit 1
fi

echo "================================================"
echo "     Security Setup for PureHD Bookstore"
echo "================================================"
echo ""

# 1. Install Gitleaks
print_status "Installing Gitleaks for secret detection..."
if ! command -v gitleaks &> /dev/null; then
    GITLEAKS_VERSION="8.28.0"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        GITLEAKS_URL="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if [[ $(uname -m) == "arm64" ]]; then
            GITLEAKS_URL="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_darwin_arm64.tar.gz"
        else
            GITLEAKS_URL="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_darwin_x64.tar.gz"
        fi
    fi
    
    wget -q "$GITLEAKS_URL" -O gitleaks.tar.gz
    tar -xzf gitleaks.tar.gz
    
    if [ -w /usr/local/bin ]; then
        sudo mv gitleaks /usr/local/bin/
    else
        mkdir -p ~/bin
        mv gitleaks ~/bin/
        export PATH=$HOME/bin:$PATH
        echo 'export PATH=$HOME/bin:$PATH' >> ~/.bashrc
    fi
    
    rm -f gitleaks.tar.gz LICENSE README.md
    print_success "Gitleaks installed successfully"
else
    print_success "Gitleaks already installed ($(gitleaks version))"
fi

# 2. Install Python security tools
print_status "Installing Python security tools..."
if command -v pip &> /dev/null || command -v pip3 &> /dev/null; then
    PIP_CMD=$(command -v pip3 || command -v pip)
    $PIP_CMD install --upgrade pip
    $PIP_CMD install --user bandit safety pip-audit pre-commit detect-secrets
    print_success "Python security tools installed"
else
    print_warning "pip not found. Please install Python and pip first"
fi

# 3. Install Node.js security tools (using yarn)
print_status "Installing JavaScript security tools..."
if [ -d "frontend" ]; then
    cd frontend
    if command -v yarn &> /dev/null; then
        yarn add -D eslint-plugin-security@latest
        print_success "JavaScript security tools installed"
    else
        print_warning "Yarn not found. Please install yarn first"
    fi
    cd ..
fi

# 4. Setup pre-commit hooks
print_status "Setting up pre-commit hooks..."
if command -v pre-commit &> /dev/null; then
    pre-commit install
    pre-commit install --hook-type commit-msg
    print_success "Pre-commit hooks installed"
else
    print_warning "pre-commit not found. Install it with: pip install pre-commit"
fi

# 5. Initialize secret baseline for detect-secrets
print_status "Initializing secret detection baseline..."
if command -v detect-secrets &> /dev/null; then
    detect-secrets scan --baseline .secrets.baseline
    print_success "Secret detection baseline created"
fi

# 6. Create security scan script
print_status "Creating security scan script..."
cat > run-security-scan.sh << 'EOF'
#!/bin/bash
# Run all security scans

echo "==================================="
echo "    Running Security Scans"
echo "==================================="

# Secret Detection
echo -e "\n[1/4] Scanning for secrets..."
if command -v gitleaks &> /dev/null; then
    gitleaks detect --source . --verbose
else
    echo "Gitleaks not installed"
fi

# Python Security
echo -e "\n[2/4] Scanning Python code..."
if [ -d "backend" ] && command -v bandit &> /dev/null; then
    bandit -r backend/ -ll
    if [ -f "backend/requirements.txt" ]; then
        safety check -r backend/requirements.txt || true
        pip-audit -r backend/requirements.txt || true
    fi
else
    echo "Python security tools not installed or backend not found"
fi

# JavaScript Security
echo -e "\n[3/4] Scanning JavaScript code..."
if [ -d "frontend" ]; then
    cd frontend
    yarn audit --level moderate || true
    yarn eslint . --ext .js,.jsx,.ts,.tsx || true
    cd ..
else
    echo "Frontend directory not found"
fi

# Pre-commit checks
echo -e "\n[4/4] Running pre-commit checks..."
if command -v pre-commit &> /dev/null; then
    pre-commit run --all-files
else
    echo "pre-commit not installed"
fi

echo -e "\n==================================="
echo "    Security Scan Complete"
echo "==================================="
EOF

chmod +x run-security-scan.sh
print_success "Security scan script created: run-security-scan.sh"

# 7. Check for existing secrets
print_status "Checking for existing secrets in repository..."
if command -v gitleaks &> /dev/null; then
    echo ""
    gitleaks detect --source . --verbose --no-git
    echo ""
fi

# 8. Setup GitHub CLI (if available)
if command -v gh &> /dev/null; then
    print_status "GitHub CLI detected. Checking authentication..."
    if gh auth status &> /dev/null; then
        print_success "GitHub CLI authenticated"
    else
        print_warning "GitHub CLI not authenticated. Run: gh auth login"
    fi
else
    print_warning "GitHub CLI not installed. Install from: https://cli.github.com/"
fi

# 9. Final checks and recommendations
echo ""
echo "================================================"
echo "           Setup Complete!"
echo "================================================"
echo ""
echo "✅ Security tools installed and configured"
echo ""
echo "📋 Next Steps:"
echo "1. Review and commit the security configuration files"
echo "2. Run './run-security-scan.sh' to perform a full security scan"
echo "3. Set up Aikido Security (free tier):"
echo "   - Sign up at: https://app.aikido.dev/signup"
echo "   - Connect your GitHub account"
echo "   - Select repositories to monitor"
echo ""
echo "🔒 Important Reminders:"
echo "- Never commit real API keys or secrets"
echo "- Always use environment variables for sensitive data"
echo "- Keep dependencies updated regularly"
echo "- Review security alerts promptly"
echo ""
echo "📚 Documentation:"
echo "- Security policies: SECURITY.md"
echo "- Project README: README.md"
echo ""

# Create a weekly security check script
cat > weekly-security-check.sh << 'EOF'
#!/bin/bash
# Weekly Security Check Script

echo "==================================="
echo "    Weekly Security Check"
echo "    $(date)"
echo "==================================="

# Update security tools
echo -e "\n📦 Updating security tools..."
pip install --upgrade bandit safety pip-audit gitleaks pre-commit detect-secrets

# Full repository scan
echo -e "\n🔍 Running full security scan..."
./run-security-scan.sh

# Check for dependency updates
echo -e "\n📊 Checking for dependency updates..."
if [ -f "backend/requirements.txt" ]; then
    echo "Python dependencies:"
    pip list --outdated
fi

if [ -d "frontend" ]; then
    echo -e "\nJavaScript dependencies:"
    cd frontend
    yarn outdated
    cd ..
fi

# Generate security report
echo -e "\n📄 Generating security report..."
mkdir -p security-reports
REPORT_FILE="security-reports/weekly-report-$(date +%Y%m%d).txt"
{
    echo "Weekly Security Report - $(date)"
    echo "================================"
    echo ""
    echo "1. Secret Scan Results:"
    gitleaks detect --source . --verbose 2>&1
    echo ""
    echo "2. Python Security:"
    bandit -r backend/ -f txt 2>&1
    echo ""
    echo "3. Dependency Audit:"
    safety check -r backend/requirements.txt 2>&1 || true
    echo ""
} > "$REPORT_FILE"

echo "Report saved to: $REPORT_FILE"
echo ""
echo "==================================="
echo "    Weekly Check Complete"
echo "==================================="
EOF

chmod +x weekly-security-check.sh
print_success "Weekly security check script created: weekly-security-check.sh"