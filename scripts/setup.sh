#!/bin/bash

# Mario Uomo Development Environment Setup Script

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Print step message
print_step() {
    echo -e "${YELLOW}\n==> $1${NC}"
}

# Print success message
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Print error message
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed"
        return 1
    fi
    print_success "$1 is installed"
    return 0
}

# Install Node.js using nvm
setup_node() {
    print_step "Setting up Node.js..."
    
    # Install nvm if not present
    if ! command -v nvm &> /dev/null; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi

    # Install Node.js 18
    nvm install 18
    nvm use 18
    print_success "Node.js setup complete"
}

# Install and configure pnpm
setup_pnpm() {
    print_step "Setting up pnpm..."
    
    # Install pnpm if not present
    if ! command -v pnpm &> /dev/null; then
        npm install -g pnpm
    fi

    # Configure pnpm
    pnpm config set store-dir ~/.pnpm-store
    print_success "pnpm setup complete"
}

# Setup PostgreSQL
setup_postgres() {
    print_step "Setting up PostgreSQL..."
    
    # Install PostgreSQL if not present
    if ! command -v postgres &> /dev/null; then
        brew install postgresql@14
        brew services start postgresql@14
    fi

    # Create development database
    createdb mario_uomo_dev || true
    print_success "PostgreSQL setup complete"
}

# Setup Redis
setup_redis() {
    print_step "Setting up Redis..."
    
    # Install Redis if not present
    if ! command -v redis-cli &> /dev/null; then
        brew install redis
        brew services start redis
    fi
    print_success "Redis setup complete"
}

# Setup project
setup_project() {
    print_step "Setting up project..."
    
    # Install dependencies
    pnpm install

    # Copy environment files
    cp .env.example .env
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env

    # Run database migrations
    cd backend
    pnpm typeorm migration:run
    cd ..

    print_success "Project setup complete"
}

# Setup VSCode extensions
setup_vscode() {
    print_step "Setting up VSCode extensions..."
    
    if command -v code &> /dev/null; then
        code --install-extension dbaeumer.vscode-eslint
        code --install-extension esbenp.prettier-vscode
        code --install-extension ms-vscode.vscode-typescript-tslint-plugin
        print_success "VSCode extensions installed"
    else
        print_error "VSCode not found, skipping extension installation"
    fi
}

# Main setup
main() {
    print_step "Starting Mario Uomo development environment setup..."

    # Check prerequisites
    check_command "git" || exit 1
    check_command "brew" || exit 1

    # Run setup steps
    setup_node
    setup_pnpm
    setup_postgres
    setup_redis
    setup_project
    setup_vscode

    print_step "Setup complete! 🎉"
    echo -e "\nNext steps:"
    echo "1. Review the environment variables in .env files"
    echo "2. Start the backend: cd backend && pnpm dev"
    echo "3. Start the frontend: cd frontend && pnpm dev"
    echo "4. Visit http://localhost:3000 to see the application"
}

# Run main setup
main
