---
trigger: always_on
---

## TypeScript Best Practices

### Type Safety

- Use explicit types for parameters and return values. Avoid `any` — use `unknown` for dynamic data.
- Use interfaces for object shapes; types for unions/primitives. Leverage strict mode.

### Imports

- Use `.js` extensions in imports (ESM requirement). Example: `import { models } from '../db/models/index.js'`

### Request/Response Types

- Define interfaces for request bodies, params, query strings in `src/types/`.
- Use Fastify generics: `FastifyRequest<{ Body: T; Params: P }>`.

## Fastify Patterns

### Routes

- Define in `src/routes/`. Use async route plugins. Always include schema validation and `preHandler` for middleware.

```typescript
server.post('/', {
  schema: createUserSchema,
  preHandler: [authenticateMiddleware],
  handler: UsersController.create,
});
```

### Controllers

- Place in `src/controllers/`. Use static methods typed with Fastify generics.
- Sanitize sensitive data before responding. Keep controllers thin — delegate to services.

## Error Handling

- Use classes from `src/lib/errors.ts`: `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`, `TooManyRequestsError`, `InternalServerError`.
- All extend `AppError` with `statusCode`, `code`, optional `details`.
- Throw directly — no try-catch for operational errors. Global handler formats via `ApiResponse.error()`.
- Provide meaningful messages. Never expose internals in production.

## Response Formatting

- Use `ApiResponse` helpers from `src/lib/responses.ts` — never manually construct response objects.
- Methods: `.success(data, msg)`, `.created(data, msg)`, `.paginated(items, total, page, limit)`.
- Shape: `{ success, statusCode, message, data?, error?: { code, details? }, meta?: { page, limit, total, totalPages }, timestamp }`.

## Response Strings Management

### Overview

- Maintain all response/error strings in `src/lib/response-strings.ts`. Never hardcode strings in controllers/services/middleware.
- Export a single `RESPONSE_STRING` constant organized by category → module → message.

### Structure

- Top-level: categories (`VALIDATION`, `SUCCESS`). Second-level: domain modules (`USER`, `ROLE`). Leaf: static strings or factory functions for dynamic messages.

```typescript
export const RESPONSE_STRING = {
  VALIDATION: {
    USER: {
      NOT_FOUND: (id: unknown): string => `User ${id} not found.`,
      ALREADY_EXISTS: 'User already exists.',
      USER_CREATE: 'User Registered successfully',
      USER_LIST: 'User list fetched successfully',
      PERMISSION_DENIED: 'You do not have permission to access this resource.',
    },
  },
};
```

### Naming & Usage

- All keys: `UPPER_SNAKE_CASE`. Dynamic messages: arrow functions `(param) => string`.

```typescript
import { RESPONSE_STRING } from '../lib/response-strings.js';
return ApiResponse.success(data, RESPONSE_STRING.VALIDATION.USER.USER_LIST);
throw new NotFoundError(RESPONSE_STRING.VALIDATION.USER.NOT_FOUND(id));
```

### Rules

1. **Centralized**: Every user-facing string in `RESPONSE_STRING`. No inline strings in handlers.
2. **Grouped by domain**: Each module gets its own nested object.
3. **Dynamic vs static**: Factory functions for runtime values; plain strings for fixed messages.
4. **Consistent style**: Past tense for actions (`"created successfully"`), present for errors (`"not found"`).
5. **No duplicates**: Shared patterns go in a `COMMON` section.
6. **Alphabetical order**: Keys sorted within each module.
7. **Single source**: Update only `response-strings.ts` — all consumers reflect changes.

## Database Patterns (Sequelize)

### Model Usage

- All models extend `BaseModel` (filtering, sorting, pagination). Access via `models.ModelName` from `src/db/models/index.ts`.

### Query Filtering — `BaseModel.parseFilters()`

Operators: `__is`, `__con`, `__sw`, `__ew`, `__gte`, `__lte`, `__gt`, `__lt`, `__in` (comma-separated).

```typescript
const filters = models.User.parseFilters(query, true);
const { rows, count } = await models.User.findAndCountAll(filters);
```

### Sorting & Pagination & Attributes

- Sort: `?sort=name|created_at-` (pipe-separated, `-` = DESC). Paginate: `?page=0&size=10`. Attributes: `?attributes=id|name|email`.

### Soft Deletes

- Via `deleted_at` timestamp. `model.destroy()` for soft delete. `paranoid: false` to include deleted.

### Data Sanitization

- Always call `model.sanitize()` before responding (removes `password`, `password_hash`, etc.).

### Associations

- Define via `associate()`. Types: `hasOne`, `hasMany`, `belongsTo`, `belongsToMany`.
- Always specify `foreignKey` and `as`. Use `include` to eager load. `required: false` for LEFT JOIN.

## Authentication

### JWT Middleware

- `authenticateMiddleware` for protected routes (`request.user` available).
- `optionalAuthMiddleware` for optional auth. Format: `Authorization: Bearer <token>`.

### JWT Utilities

- `generateToken(payload)`, `verifyToken(token)`, `extractTokenFromHeader(header)`.

## Node-Casbin (RBAC)

### Setup

- Package: `casbin`. Singleton Enforcer in `src/lib/casbin.ts`.
- Model: `src/assets/casbin/model.conf` — `r = sub, obj, act`, `p = sub, obj, act`, `g = _, _`.
- Policy: CSV (`src/assets/casbin/policy.csv`) or DB adapter.

### Middleware Usage

- After auth, use `request.user.role` as subject, resource as object, operation as action.

```typescript
export function requirePermission(resource: string, action: string) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.user) throw new UnauthorizedError('Authentication required');
    const allowed = await (await getEnforcer()).enforce(request.user.role, resource, action);
    if (!allowed) throw new ForbiddenError('Insufficient permissions');
  };
}
```

### Enforcer API & Conventions

- `enforce(sub, obj, act)`, `getRolesForUser()`, `addPermissionForUser()`, `deletePermissionForUser()`.
- Load once via `newEnforcer(modelPath, policyPath)`. Define resources/actions in `src/lib/casbin-constants.ts`.
- Route pattern: `preHandler: [authenticateMiddleware, requirePermission('resource', 'action')]`.

## Request Validation

- Schemas in `src/schemas/` using JSON Schema. Validate body, params, querystring, headers.
- Reuse from `src/schemas/common.schemas.ts`: `emailSchema`, `uuidParamSchema`, `paginationSchema`.
- Validate at schema + model level. Use `additionalProperties: false`. Return specific error messages.

## API Design

- Methods: GET, POST, PUT, PATCH, DELETE. Plural nouns: `/users`. Nested: `/users/:id/posts`. Kebab-case. Version: `/api/v1/...`.
- Status: `200` GET/PUT/PATCH | `201` POST | `204` DELETE | `400` bad request | `401` unauth | `403` forbidden | `404` not found | `409` conflict | `422` validation | `429` rate limited | `500` internal.

## Database Migrations

- Always create migrations for schema changes — never modify existing. Naming: `YYYYMMDDHHMMSS-description.js`.
- Include `up` and `down`. Add indexes for FKs and queried fields. Use transactions. Test before production.

## Transaction Management

- Use transactions for multi-table ops. Handle rollback. Keep short.

```typescript
const transaction = await sequelize.transaction();
try {
  await models.User.create(data, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## Async/Await Patterns

- Always `async/await` over chains. Let errors propagate. `Promise.all()` for parallel ops. `Promise.allSettled()` when all results needed.

## Service Layer

- Complex logic in `src/services/`. Controllers stay thin. Services independently testable.

## Testing — Vitest

### Setup

- Config: `vitest.config.ts`. Globals enabled — don't import from `vitest`.
- Scripts: `test` (watch), `test:run` (CI), `test:ui` (interactive), `test:coverage` (v8). Run `test:run` before commits.

### TDD Workflow

1. Write tests first (CRUD, happy/error/edge paths, auth, sanitization).
2. Implement (migrations, models, controllers, routes, middleware).
3. Run `npm run test:run`. Fix, re-run. `test:coverage` — min 80%.

### Organization & Mocking

- Files: `*.test.ts`/`*.spec.ts` next to source or in `src/__tests__/`. Pattern: `should [behavior] when [condition]`.
- Use `vi.spyOn()`, `vi.mock()`, `vi.fn()`. `vi.restoreAllMocks()` in `afterEach`. `vi.useFakeTimers()`/`vi.useRealTimers()`.

### Best Practices

- Clean up test data. Mock external deps. Use fixtures. Prefer `toStrictEqual`. Use `async/await` with `resolves`/`rejects`.

## Middleware Composition

- Compose in `preHandler` array. Order: authentication → authorization → validation → handler. Single responsibility.

## Query Optimization

- Select only needed fields via `attributes`. Use `findAndCountAll` for pagination. Index filtered/sorted columns.

## Performance & Caching

- Indexes on queried fields. Pagination for large datasets. Avoid N+1 (use `include`). Redis for caching with TTLs.

## Security

- Never log sensitive data. Sanitize all input. Parameterized queries (Sequelize default).
- Schema validation. HTTPS in production. Secure headers. Rate limiting. Env vars for secrets.
- Passwords: bcrypt, 10-12 salt rounds, never plain text.

## Logging

- Levels: error, warn, info, debug. Stack traces for errors. No sensitive data in logs.

## Documentation

- JSDoc for functions/classes. Document "why" not "what". Keep current. OpenAPI/Swagger for endpoints.

## Code Reusability (DRY)

- Common logic in `src/lib/`. Reusable middleware. Base classes/mixins. Reuse `src/schemas/common.schemas.ts`.
