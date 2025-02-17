# Mario Uomo E-commerce Platform

A modern, enterprise-grade e-commerce platform built with NestJS and Next.js, emphasizing security, scalability, and comprehensive monitoring.

## Project Structure

```
mariouomo/
├── backend/                 # NestJS application
│   ├── src/                # Source code
│   │   ├── modules/       # Feature modules
│   │   ├── common/        # Shared utilities
│   │   └── config/        # Configuration
│   ├── test/              # Test files
│   ├── package.json       # Dependencies
│   └── tsconfig.json      # TypeScript config
├── frontend/              # Next.js application
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Next.js pages
│   │   └── styles/       # CSS/SCSS files
│   ├── public/           # Static assets
│   ├── package.json      # Dependencies
│   └── tsconfig.json     # TypeScript config
├── shared/               # Shared code
│   └── types/           # TypeScript types
└── docker/              # Docker configuration
    ├── docker-compose.yml
    └── Dockerfile
```

## Prerequisites

- Node.js >= 18
- PostgreSQL (via Supabase)
- Docker & Docker Compose
- pnpm (recommended) or npm

## Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd mariouomo
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   pnpm install

   # Install frontend dependencies
   cd ../frontend
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env

   # Frontend
   cp frontend/.env.example frontend/.env
   ```

4. **Start development servers**
   ```bash
   # Start all services with Docker
   docker-compose up

   # Or start services individually
   # Backend
   cd backend
   pnpm run start:dev

   # Frontend
   cd frontend
   pnpm run dev
   ```

## Development Guidelines

Please refer to our documentation for detailed guidelines:
- [Implementation Plan](./implementationplan.md)
- [Database Implementation](./dbplan/dbimplementation.md)
- [Project Rules](./rules.md)

## Key Features

- 🔐 Secure authentication and authorization
- 📦 Product management
- 🛒 Order processing
- 💳 Payment integration
- 📊 Analytics and reporting
- 🚚 Shipping integration
- 👥 User management
- 🎁 Discounts and promotions

## Testing

```bash
# Run backend tests
cd backend
pnpm run test

# Run frontend tests
cd frontend
pnpm run test
```

## Deployment

Deployment is handled through our CI/CD pipeline. See [deployment documentation] for details.

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

[License details to be added]
