---
trigger: manual
---

# Planning Rules — Backend Implementation Plans

Rules for generating, structuring, and validating **phase-wise backend planning documents** in `planning/`. Every plan must be detailed enough for implementation without ambiguity.

## Planning Philosophy

- **One Phase = One Document**: Each phase gets its own `planning/phase-{N}-{short-kebab-description}.md`. A phase is a coherent, shippable unit.
- **Plan Before Code**: Never start coding without a completed plan. The plan is the single source of truth — fix the plan first, then code. Keep plans updated when implementation reveals design changes.
- **Completeness Over Brevity**: The implementer should ask zero clarifying questions. Cover every endpoint, model field, migration column, and validation rule. If something is deferred, state so explicitly (e.g. "Deferred to Phase N").

## Planning Document Structure

Every phase document **must** include these sections in order:

### Title & Phase Number

`# Phase {N} — {Descriptive Title}`

### Objectives

- 3–6 bullets of what this phase achieves from a product/feature perspective in user-facing language.

### Dependencies

- List prior phases that must be complete, mentioning specific artifacts depended upon.
- If none: "None (foundation phase)."

### Backend Scope

This is the **core** of the document with these subsections:

#### Database Tables & Schema

For every new/modified table, provide a full column specification table with columns: Column, Type (with length), Constraints (PK, FK, NOT NULL, UNIQUE, DEFAULT), Notes.

Schema rules:

- Always include `id` (UUID, PK, UUIDv4), `created_at`, `updated_at`, `deleted_at` (soft-delete/paranoid).
- FKs: specify referenced table/column and ON DELETE/ON UPDATE behavior.
- **No ENUMs**: Create master/lookup tables (e.g. `regions`, `statuses`) with `id`, `code` (unique), `name`, `sort_order`, timestamps. Main tables reference via FK. Document seed data. For "Other" dropdown: add `other` code row + optional `_other` text column on main table.
- List all indexes (unique, composite, performance) and Sequelize associations (type, foreignKey, alias).

#### API Endpoints

For every endpoint document: method, full path (`/api/v1/...`), auth/middleware, request body/params/query, validation rules (type, constraints per field), business logic (numbered steps with branching), success response (status code + `ApiResponse` format), all error responses (status code, error class, description).

Endpoint rules:

- Group by resource. Specify full route path with version prefix.
- Auth & authz: state exact middleware and allowed roles.
- Validation: define every field's type, constraints, rules. Reference `src/schemas/common.schemas.ts` where applicable.
- Responses: always use `ApiResponse.success()`, `.created()`, `.paginated()`, or error classes — never raw objects.
- List endpoints: specify filterable/sortable fields using `BaseModel.parseFilters()` pattern.

#### Services & Integrations

- List services introduced/used (email, file upload, AI, etc.).
- For each: purpose, interface (methods/signatures), dependencies (env vars, external APIs), stub capability.

#### Middleware

- Document new middleware (file upload, rate limiting, etc.) and where applied (global, per-route, per-group).

#### Master Tables & Constants

- List all lookup tables: name, columns, seed rows. Main tables reference via FK.
- List constants in `src/lib/constants.ts`. No ENUMs — use master tables.

### Key Files to Add or Change

Table with columns: Action (`Add`/`Update`/`Migration`/`Delete`), Path, Description. Every file touched must appear — including migrations (with `YYYYMMDDHHMMSS` prefix) and tests.

### Acceptance Criteria

- Verifiable, independently testable statements covering: functionality, security, data integrity, error handling, API contract compliance.
- Reference specific status codes, response shapes, edge cases.

## Planning README (`planning/README.md`)

Must contain: project overview (one paragraph), phase list table (number, link, summary), dependency flow diagram (Mermaid), usage instructions, existing boilerplate reference. Update when phases are added.

## Database Design Rules

### Naming

- Tables: `snake_case`, plural (e.g. `users`, `project_documents`).
- Columns: `snake_case` (e.g. `created_at`).
- FKs: `{referenced_table_singular}_id` (e.g. `user_id`).
- Join tables: `{table1}_{table2}` alphabetically.

### Standard Columns

Every table: `id` (UUID, PK, UUIDv4), `created_at` (TIMESTAMP, NOT NULL), `updated_at` (TIMESTAMP, NOT NULL), `deleted_at` (TIMESTAMP, nullable/paranoid).

### Relationships

- Define both sides of associations. Always specify `foreignKey` and `as` explicitly.
- Document ON DELETE behavior in schema table.

### Indexes

- On all FK columns, WHERE/ORDER BY columns, UNIQUE constraints.
- Document composite indexes for composite filters.

### Master Tables (No ENUMs)

- Create lookup tables for category/dropdown values with `id`, `code`, `name`, `sort_order`, timestamps.
- Main table FK references master (ON DELETE RESTRICT or SET NULL). Document seed data.
- "Other" option: `other` code row + optional `_other` text column.

### Migrations

- One migration per logical change. Always include `up()` and `down()`.
- Never modify a run migration — create a new one.
- Add indexes in same migration as table creation when possible.

## API Design Rules

### RESTful Conventions

- Plural nouns: `/api/v1/users`. Versioned: `/api/v1/...`.
- HTTP methods: GET (read), POST (create), PATCH (partial update), DELETE (soft delete).
- Nested routes for sub-resources: `/api/v1/projects/:projectId/documents`.

### Request & Response

- JSON request bodies with Fastify JSON Schema validation.
- Always use `ApiResponse` helpers — never raw objects.
- Pagination: `page`/`size` query params; return `meta` with `page`, `limit`, `total`, `totalPages`.
- Filtering: `field__operator=value` per `BaseModel.parseFilters()`.
- Sorting: `sort=field1|field2-` (pipe-separated, `-` for DESC).

### Status Codes

`200` GET/PATCH success | `201` POST created | `204` DELETE success | `400` bad request | `401` unauthenticated | `403` forbidden | `404` not found | `409` conflict | `422` validation error | `429` rate limited | `500` internal error.

### Error Handling

For every endpoint list all error responses with: HTTP status, error class from `src/lib/errors.ts`, when it occurs, error `code` string.

### Authentication & Authorization

- Every endpoint: public, authenticated, or role-restricted (list roles explicitly).
- Middleware order: `authenticateMiddleware` → authorization.
- **Node-Casbin (RBAC)**: Document model (`src/assets/casbin/model.conf`), policy rules, per-endpoint (subject, resource, action), key files (model, policy, middleware calling `enforcer.enforce()`). Use consistent resource/action naming.

## Service & Business Logic Rules

- Complex logic in `src/services/`. Controllers stay thin.
- Document service method signatures in the plan.
- Multi-table operations: wrap in Sequelize transactions; document in plan.
- Document all side effects (email, S3, webhooks). Future-phase deps marked as "stub" with clear interface.

## Testing Requirements

- Define test file(s) per phase.
- List test cases per endpoint: happy path + all error cases + edge cases.
- Follow TDD: write tests first → implement → run until pass → coverage >= 80%.

## Cross-Phase Consistency

- Reuse boilerplate patterns: `ApiResponse`, `BaseModel.parseFilters()`, `authenticateMiddleware`, error classes, `.js` import extensions.
- No patterns contradicting `global-rules.mdc` or `code-standard-rules.mdc`.
- Document forward references (what's deferred to later phases).
- Document backward-compatible changes; if breaking, document migration path.
- New env vars: list in plan + add to `.env.example`.

## Common Mistakes to Avoid

| Mistake                              | Correct Approach                                       |
| ------------------------------------ | ------------------------------------------------------ |
| Vague schema: "add necessary fields" | Explicit column list with types, constraints, defaults |
| Missing FK/index definitions         | Specify FK refs, ON DELETE, indexes                    |
| Undocumented error cases             | List every error with status + class                   |
| No test plan                         | Test cases for every endpoint                          |
| Using ENUMs for categories           | Master tables + FK + `_other` column                   |
| No dependency declaration            | State required phases/artifacts                        |
| Mixing concerns across phases        | Keep each phase focused                                |
| Forgetting soft delete               | Include `deleted_at` + paranoid mode                   |
| Missing pagination on lists          | All lists: pagination, filtering, sorting              |
| Not specifying auth                  | Every endpoint states auth/role requirements           |

## Planning Checklist

- [ ] Title & objectives are clear.
- [ ] Dependencies on prior phases listed.
- [ ] Every table has full column spec (types, constraints, defaults, FKs, indexes, associations).
- [ ] Every endpoint has method, path, auth, request/response, validation, logic, errors.
- [ ] Services/integrations documented with interfaces and stub notes.
- [ ] Master tables (with seed data) and constants documented.
- [ ] Key files table lists every file (add/update/delete/migration/tests).
- [ ] Acceptance criteria are verifiable.
- [ ] Test cases listed for every endpoint.
- [ ] `planning/README.md` updated.
- [ ] New env vars documented.
- [ ] No contradiction with other rule files.

## Phase Document Skeleton

```markdown
# Phase {N} — {Title}

## Objectives

- ...

## Dependencies

- Phase {X} — {what is needed}

## Backend Scope

### 1. Database Schema

#### Table: `resource_name`

| Column | Type | Constraints        | Notes |
| ------ | ---- | ------------------ | ----- |
| id     | UUID | PK, default UUIDv4 |       |

**Indexes:** ...
**Associations:** ...

### 2. API Endpoints

#### `POST /api/v1/resources`

- **Auth**: ...
- **Body/Validation/Logic/Success/Errors**: ...

### 3. Services

### 4. Middleware

### 5. Master Tables & Constants

## Key Files

| Action | Path | Description |
| ------ | ---- | ----------- |

## Test Cases

### Tests for `POST /api/v1/resources`

- ...

## Acceptance Criteria

- [ ] ...
```
