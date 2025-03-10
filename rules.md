# Mario Uomo E-commerce Platform Development Guidelines

You are working on an enterprise-grade e-commerce platform built with NestJS and Next.js. This platform emphasizes security, scalability, and comprehensive monitoring. Your code should reflect these priorities while maintaining clean architecture and following established patterns.

## Comments
- make sure to ALWAYS include comments in your code; it makes your code more readable and maintainable
- Any new junior dev should be able to read and understand the codebase.

## Core Development Principles

### Code Quality Standards
- Write all code and documentation in English.
- Document every function, class, and module with JSDoc comments.
- Keep functions focused and small (maximum 20 lines).
- Maintain a single responsibility per file.
- Follow SOLID principles religiously.

### Naming Conventions
- Use PascalCase for classes and interfaces (e.g., `ProductService`, `OrderInterface`).
- Use camelCase for variables, functions, and methods (e.g., `fetchOrder`, `userProfile`).
- Use kebab-case for files and directories (e.g., `order-service.ts`, `product-types/`).
- Use UPPERCASE for environment variables (e.g., `DATABASE_URL`, `API_KEY`).
- Prefix boolean variables with verbs:
  - `isLoading`, `hasPermission`, `canEdit`
  - Never use ambiguous names like `active` or `valid`
- Use complete words over abbreviations except for:
  - Standard terms: API, URL, JWT
  - Common parameters: req, res, err, ctx

### TypeScript Usage
- Never use `any` - create proper types instead.
- Leverage TypeScript features:
  - Use `interface` for object shapes
  - Use `type` for unions and complex types
  - Use `enum` only for truly finite sets
- Make all data immutable by default:
  - Use `readonly` for properties
  - Use `as const` for literal values
- Define explicit return types for all functions

### Function Design
- Keep functions pure and predictable
- Use early returns to reduce nesting
- Implement proper error handling:
  - Use discriminated unions for error states
  - Throw exceptions for unexpected errors
  - Handle expected errors gracefully
- Use parameter objects for functions with more than 3 parameters
- Return objects instead of multiple values

## Architecture Guidelines

### Backend (NestJS)
- Organize code into focused modules:
  - One module per domain concept
  - One service per significant operation
  - Controllers should be thin
- Implement proper request validation:
  - Use DTOs with class-validator
  - Validate at controller level
  - Transform data at service level
- Handle authentication and authorization:
  - Use JWT with HTTP-only cookies
  - Implement RBAC via guards
  - Log all access attempts

### Frontend (Next.js)
- Follow React best practices:
  - Use functional components
  - Implement proper error boundaries
  - Keep components small and focused
- Manage state effectively:
  - Use React Context for global state
  - Implement proper loading states
  - Handle errors gracefully
- Optimize performance:
  - Use proper image optimization
  - Implement code splitting
  - Cache appropriately

### Database Design
- Follow strict security practices:
  - Implement RLS for all tables
  - Use parameterized queries only
  - Never store sensitive data in plain text
- Optimize for performance:
  - Create proper indexes
  - Use materialized views for reports
  - Implement efficient pagination
- Maintain data integrity:
  - Use foreign key constraints
  - Implement proper cascading
  - Use transactions appropriately

## Testing Requirements

### Unit Testing
- Write tests for all business logic
- Follow Arrange-Act-Assert pattern
- Name test variables descriptively:
  - `expectedResult`
  - `mockUserData`
  - `actualOutput`
- Test both success and error cases

### Integration Testing
- Test all API endpoints
- Verify database operations
- Test authentication flows
- Validate error handling

### E2E Testing
- Test critical user journeys
- Verify payment flows
- Test admin operations
- Validate security measures

## Monitoring and Logging

### Application Monitoring
- Log all significant operations
- Track performance metrics
- Monitor error rates
- Implement proper tracing

### Security Monitoring
- Log all authentication attempts
- Track authorization failures
- Monitor for suspicious patterns
- Implement rate limiting

## Development Workflow

### Version Control
- Write meaningful commit messages
- Use feature branches
- Implement proper CI/CD
- Review code thoroughly

### Documentation
- Keep documentation up-to-date
- Document all APIs
- Maintain architecture diagrams
- Document security measures