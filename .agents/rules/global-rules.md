---
trigger: always_on
---

## Tech Stack

This project uses the following technology stack:

- **Runtime**: Node.js
- **Language**: TypeScript
- **Web Framework**: Fastify
- **ORM**: Sequelize
- **Database**: As configured in environment variables
- **Authentication**: JWT (JSON Web Tokens)
- **Authorization**: Node-Casbin for RBAC (Role-Based Access Control)

## Code Organization

### File Structure

```
src/
├── controllers/     # Business logic
├── routes/          # Route definitions
├── schemas/         # Validation schemas
├── middlewares/     # Custom middleware
├── models/          # Database models
├── lib/             # Utilities and helpers
├── services/        # Third-party integrations
└── assets/          # Static assets (locales, etc.)
```

### Naming Conventions

- Files: `kebab-case.ts` or `PascalCase.model.ts`
- Classes: `PascalCase`
- Functions/Methods: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `PascalCase` or `IPascalCase`

## Environment Variables

### Configuration

- Store sensitive data in `.env` file
- Use `process.env.VARIABLE_NAME` to access
- Provide defaults in code when appropriate
- Document all variables in `.env.example`

### Required Variables

- `NODE_ENV`: Environment (development, production, test)
- `PORT`: Server port
- `DB_*`: Database connection details
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: Token expiration time

## General Rules

- Always follow the established file structure
- Use the defined naming conventions consistently
- Never commit sensitive data (passwords, tokens, API keys) to version control
- Keep environment-specific configurations in `.env` files
- Document all environment variables in `.env.example`
