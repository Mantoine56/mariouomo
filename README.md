# Mario Uomo E-commerce Platform

A modern, enterprise-grade e-commerce platform built with Next.js and Supabase, designed to replace Shopify's admin interface. This platform emphasizes security, scalability, and comprehensive monitoring while providing a superior user experience for store management.

## 🌟 Key Features

- 🏪 Multi-store management
- 🔐 Secure authentication with Supabase Auth
- 📦 Advanced product management with variants
- 🛒 Order processing and fulfillment
- 💳 Payment integration with Stripe
- 📊 Real-time analytics and reporting
- 🚚 Multi-carrier shipping integration
- 👥 Role-based user management
- 🎁 Discounts, promotions, and gift cards
- 🖼️ Media management with Supabase Storage
- 📱 Responsive admin dashboard
- 🔄 Real-time updates and notifications

## 📁 Project Structure

```
mariouomo/cbdash/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── common/        # Shared utilities
│   │   ├── config/       # Configuration files
│   │   └── modules/      # Feature modules
│   ├── test/             # Test files
│   └── package.json
├── frontend/              # Next.js Frontend
│   ├── app/              # Next.js 14 app directory
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/       # Page components
│   │   └── styles/      # CSS modules
│   └── package.json
├── docs/                 # Documentation
│   ├── api/             # API documentation
│   ├── modules/         # Module documentation
│   ├── database/         # Database documentation
│   │   ├── schema/      # Database schema documentation
│   │   ├── security/    # Security policies
│   │   ├── operations/  # Operational procedures
│   │   └── migrations/  # Database migrations
│   └── deployment/      # Deployment guides
├── dbplan/              # Database implementation
│   ├── dbschema.md     # Database schema
│   └── rlsplolicies.md # RLS policies
├── docker/             # Docker configuration
│   ├── Dockerfile
│   └── docker-compose.yml
├── scripts/            # Utility scripts
│   ├── backup_db.sh
│   └── setup.sh
└── shared/            # Shared code
    └── types/        # TypeScript types
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **State Management**: React Context + Zustand
- **API Integration**: Supabase Client + tRPC
- **Testing**: Jest + React Testing Library
- **Package Manager**: pnpm
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js >= 18
- pnpm >= 8.0.0
- Docker & Docker Compose
- Supabase Account
- Stripe Account (for payments)
- GitHub Account (for deployment)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Mantoine56/mariouomo.git
cd mariouomo/cbdash
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your Supabase and other credentials

# Start backend development server
pnpm run dev
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Configure environment variables in .env.local:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET

# Start frontend development server
pnpm run dev
```

### 4. Docker Setup (Optional)
```bash
# Start all services with Docker
docker-compose up -d
```

### 5. Database Setup
```bash
# Apply database migrations
pnpm run db:migrate

# Seed initial data (if needed)
pnpm run db:seed
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- API Documentation: `http://localhost:4000/api`

## 📚 Documentation

- [Implementation Plan](./implementationplan.md) - Detailed development roadmap
- [Database Schema](./dbplan/dbschema.md) - Database structure and relationships
- [API Documentation](./docs/api/openapi.yaml) - API endpoints and usage
- [Module Documentation](./docs/modules/) - Individual module documentation
- [Deployment Guide](./docs/deployment/README.md) - Deployment instructions

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run specific test suite
pnpm test:watch
```

## 🔄 Development Workflow

1. **Branch Naming**
   - Feature: `feature/feature-name`
   - Bug Fix: `fix/bug-name`
   - Documentation: `docs/topic-name`

2. **Commit Messages**
   Follow conventional commits:
   - feat: New feature
   - fix: Bug fix
   - docs: Documentation
   - style: Code style
   - refactor: Code refactoring
   - test: Testing
   - chore: Maintenance

3. **Pull Requests**
   - Create a detailed PR description
   - Link related issues
   - Add appropriate labels
   - Request reviews from team members

## 🔐 Security

- All endpoints are protected with Supabase RLS policies
- JWT-based authentication
- Role-based access control
- Regular security audits
- Rate limiting on API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👥 Team

- **Antoine Elias** - Project Lead
- [Add team members]

## 📞 Support

For support, please:
1. Check the [documentation](./docs)
2. Create an issue
3. Contact the development team

---

Built with ❤️ by the Mario Uomo team
