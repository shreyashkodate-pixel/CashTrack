# CashTrack — Software Requirements Specification (SRS)

**Scope:** Version 1 → Version 3 (Core Expense Tracker → Better Expense Management → Analytics & Budget)
**Document Type:** Software Requirements Specification
**Product:** CashTrack
**Status:** Draft for Implementation
**Version:** 1.1 (covers CashTrack V1, V2, V3 — updated to match approved repo structure)
**Source documents:** `docs/PRODUCT_ROADMAP.md`, `docs/design.md`, `Agents.md`

> This SRS is intentionally scoped to V1–V3 only. No authentication, multi-user,
> income/accounts, mobile, AI, or performance-hardening work is included here —
> those belong to later SRS documents (V4+) per the roadmap's incremental philosophy.
> Everything in this document must remain re-openable and additive: V4's SRS should
> be able to extend this schema, this API, and this frontend without rewriting them.

---

## 0. Changelog (v1.0 → v1.1)

| Change | Reason |
|---|---|
| Product/package renamed `pennypilot` → **`cashtrack`** everywhere | Approved product name |
| Repo tree updated to the exact approved structure (see §5) | Structure was handed down as-is; SRS now documents it rather than inventing an alternative one |
| Backend package convention switched from **feature-packaged** to **layer-packaged** (`controller/`, `service/`, `repository/`, `entity/`, `dto/`, `mapper/`, `enums/`, `exception/`, `config/`) | Matches the approved structure |
| Categories changed from a fixed enum to a user-managed entity with full CRUD operations | User request: category of the expense will be added and edited by the user |
| Config format changed from `application.yml` → **`application.properties`** | Matches approved structure |
| Frontend changed from TypeScript/TanStack Router/Query/Tailwind/shadcn → **plain JavaScript (JSX), React Router, Context + custom hooks + a services layer, and hand-written CSS driven by `variables.css`/`components.css`** | Matches approved structure exactly |
| Flyway migrations moved from `backend/src/main/resources/db/migration` → **top-level `database/migrations/`** | Matches approved structure; Flyway now points at an external filesystem location |
| Added **Postman collection** (`postman/`) as an explicit API-contract deliverable, in addition to OpenAPI/Swagger | Matches approved structure |
| Added `.github/workflows/ci.yml`, per-project `README.md` files, `.dockerignore` files | Matches approved structure |

---

## 1. Document Control

| Field | Value |
|---|---|
| Applies to | CashTrack V1, V2, V3 |
| Depends on | `docs/PRODUCT_ROADMAP.md` §5–7, `docs/design.md` (scoped subset, see §11), `Agents.md` (all rules) |
| Out of scope | Auth, RBAC, Income, Accounts, Payment Methods, Mobile, Files, Notifications, AI, RAG, Agents, Performance/Security hardening cycles (V4–V14) |
| Config philosophy | 100% environment-variable driven — no hardcoded hosts, ports, credentials, or business data anywhere in source |
| IDE / tooling target | Google Antigravity |

---

## 2. Purpose & Scope

### 2.1 Purpose

Define the complete, implementable requirements — architecture, database, API, and
frontend — needed to build and deploy CashTrack V1 through V3 as three consecutive,
independently shippable, production-verified releases, per `PRODUCT_ROADMAP.md` §2 and §4.

### 2.2 In-Scope Functional Capabilities

| Version | Capability | Roadmap Reference |
|---|---|---|
| V1 | Expense CRUD, Category CRUD, basic filter (category/date), basic summary (total, count) | §5 |
| V2 | Search, multi-field filtering, sorting, pagination | §6 |
| V3 | Spending analytics (daily/weekly/monthly/category/total/average/highest/lowest), budget CRUD, budget utilization tracking | §7 |

### 2.3 Explicitly Out of Scope (deferred to V4+)

Income, Accounts, Payment Methods, Transactions-linking, Authentication, RBAC,
multi-user data isolation, dark/light theme toggle exposure, mobile app, recurring
transactions, file attachments, notifications, caching/queues, VAPT, AI features,
RAG, agent/tool-calling. A single implicit user context is assumed for V1–V3 (no
`user_id` column anywhere yet — see §8.6 for the forward-compatible note).

---

## 3. Assumptions & Constraints

1. Single-user, unauthenticated system for V1–V3 (auth arrives in V5). No fake/simulated login.
2. All configuration is supplied via environment variables, consumed through
   `application.properties` placeholders (`${VAR:default}`) — never a literal value
   for anything environment-specific. No `.env` is ever committed (`Agents.md` #5) —
   only `.env.example` is tracked, on both `backend/` and `frontend/`.
3. No secrets exist yet in V1–V3, but the configuration mechanism is already
   secret-safe so V5 can drop credentials in without rework (`Agents.md` #3).
4. Architecture, once approved via this SRS, is not to be changed without an
   explicit SRS revision (`Agents.md` #1).
5. `docs/design.md` is written at V6 UI maturity. This SRS scopes down which parts
   of it apply now, and how they're implemented given the approved (plain-CSS,
   plain-JS) frontend stack — see §11.
6. Categories are a user-managed resource (database table) requiring full CRUD operations in V1. Users can add, edit, and delete their own categories.

---

## 4. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Backend language/runtime | Java 21 (LTS) | |
| Backend framework | Spring Boot 3.3.x | `spring-boot-starter-web`, `-validation`, `-actuator` |
| ORM | Spring Data JPA (Hibernate) | Repository pattern, no raw JDBC |
| Database | PostgreSQL 16 | |
| Migrations | Flyway (`flyway-core`, `flyway-database-postgresql`) | Versioned SQL, external `database/migrations/` folder (§7.6) — no `ddl-auto: update` anywhere |
| API docs | springdoc-openapi (`springdoc-openapi-starter-webmvc-ui`) | Auto-generated OpenAPI 3 + Swagger UI, exported and mirrored into `postman/` |
| API contract testing | Postman/Newman | `postman/CashTrack.postman_collection.json` + `.postman_environment.json`, runnable in CI |
| Object mapping | MapStruct | Entity ↔ DTO mapping |
| Boilerplate reduction | Lombok | |
| Build tool | Maven | |
| Backend testing | JUnit 5, Mockito, Testcontainers (Postgres) | Integration tests run against a real containerized Postgres |
| Frontend framework | React 18 (JavaScript / JSX — no TypeScript) | |
| Frontend build tool | Vite | |
| Frontend routing | React Router | Declarative routes in `App.jsx` for `Dashboard`, `Expenses`, `Analytics`, `Budgets`, `NotFound` |
| Frontend data/state | Custom hooks (`hooks/`) + a thin services layer (`services/`) over `fetch`, with `context/AppContext.jsx` for cross-cutting UI state (toasts, locale/currency) | No TanStack Query/Router in this stack — matches approved structure |
| Styling | Plain CSS: `styles/variables.css` (design tokens) + `styles/components.css` (component classes) + `styles/index.css` (resets/globals) | No Tailwind, no CVA, no Radix/shadcn — see §11 for how `design.md` maps onto this |
| Charts (V3) | Recharts | |
| Forms & validation | Native controlled components + a small validation helper in `utils/`; mirrors backend Bean Validation rules | |
| Containerization | Docker + Docker Compose | Build context = repo root, so `backend/Dockerfile` can also `COPY` `database/migrations/` (§7.6) |
| CI | GitHub Actions (`.github/workflows/ci.yml`) | Build → Test → Lint → Dependency scan → Postman/Newman contract check → Package |

---

## 5. Repository & Folder Structure (approved)

```text
cashtrack/
│
├── README.md
├── .gitignore
│
├── docs/
│   ├── PRODUCT_ROADMAP.md
│   ├── design.md
│   └── SRS.md
│
├── backend/
│   │
│   ├── pom.xml
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env
│   ├── .env.example
│   ├── README.md
│   │
│   └── src/
│       │
│       ├── main/
│       │   │
│       │   ├── java/
│       │   │   └── com/
│       │   │       └── cashtrack/
│       │   │           └── backend/
│       │   │               │
│       │   │               ├── CashTrackApplication.java
│       │   │               │
│       │   │               ├── config/
│       │   │               │   ├── OpenApiConfig.java
│       │   │               │   └── WebConfig.java                     # CORS from env
│       │   │               │
│       │   │               ├── controller/
│       │   │               │   ├── ExpenseController.java
│       │   │               │   ├── CategoryController.java
│       │   │               │   ├── BudgetController.java               # V3
│       │   │               │   └── AnalyticsController.java            # V3
│       │   │               │
│       │   │               ├── dto/
│       │   │               │   ├── request/
│       │   │               │   │   ├── CreateExpenseRequest.java
│       │   │               │   │   ├── UpdateExpenseRequest.java
│       │   │               │   │   ├── CreateCategoryRequest.java
│       │   │               │   │   ├── UpdateCategoryRequest.java
│       │   │               │   │   ├── CreateBudgetRequest.java        # V3
│       │   │               │   │   └── UpdateBudgetRequest.java        # V3
│       │   │               │   │
│       │   │               │   └── response/
│       │   │               │       ├── ExpenseResponse.java
│       │   │               │       ├── ExpenseSummaryResponse.java
│       │   │               │       ├── CategoryResponse.java
│       │   │               │       ├── PageResponse.java               # V2, generic envelope
│       │   │               │       ├── BudgetResponse.java             # V3
│       │   │               │       ├── BudgetUtilizationResponse.java  # V3
│       │   │               │       ├── SpendingSummaryResponse.java    # V3
│       │   │               │       ├── PeriodSpendingResponse.java     # V3
│       │   │               │       └── CategoryBreakdownResponse.java  # V3
│       │   │               │
│       │   │               ├── entity/
│       │   │               │   ├── Expense.java
│       │   │               │   ├── Category.java
│       │   │               │   └── Budget.java                        # V3
│       │   │               │
│       │   │               ├── exception/
│       │   │               │   ├── GlobalExceptionHandler.java
│       │   │               │   ├── ResourceNotFoundException.java
│       │   │               │   ├── DuplicateBudgetPeriodException.java # V3
│       │   │               │   └── ErrorResponse.java
│       │   │               │
│       │   │               ├── mapper/
│       │   │               │   ├── ExpenseMapper.java
│       │   │               │   ├── CategoryMapper.java
│       │   │               │   └── BudgetMapper.java                  # V3
│       │   │               │
│       │   │               ├── repository/
│       │   │               │   ├── ExpenseRepository.java
│       │   │               │   ├── ExpenseSpecification.java          # V2, search/filter
│       │   │               │   ├── CategoryRepository.java
│       │   │               │   └── BudgetRepository.java              # V3
│       │   │               │
│       │   │               └── service/
│       │   │                   ├── ExpenseService.java
│       │   │                   ├── CategoryService.java
│       │   │                   ├── AnalyticsService.java              # V3
│       │   │                   └── BudgetService.java                 # V3
│       │   │
│       │   └── resources/
│       │       └── application.properties
│       │
│       └── test/
│           │
│           └── java/
│               └── com/
│                   └── cashtrack/
│                       └── backend/
│                           ├── controller/
│                           │   ├── ExpenseControllerTest.java
│                           │   ├── CategoryControllerTest.java
│                           │   ├── BudgetControllerTest.java           # V3
│                           │   └── AnalyticsControllerTest.java        # V3
│                           │
│                           ├── service/
│                           │   ├── ExpenseServiceTest.java
│                           │   ├── CategoryServiceTest.java
│                           │   ├── BudgetServiceTest.java              # V3
│                           │   └── AnalyticsServiceTest.java           # V3
│                           │
│                           └── repository/
│                               ├── ExpenseRepositoryTest.java
│                               ├── CategoryRepositoryTest.java
│                               └── BudgetRepositoryTest.java           # V3
│
│
├── frontend/
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── index.html
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env
│   ├── .env.example
│   ├── README.md
│   │
│   └── src/
│       │
│       ├── assets/
│       │   └── images/
│       │
│       ├── components/
│       │   ├── common/
│       │   │   ├── Button.jsx
│       │   │   ├── Card.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Loader.jsx
│       │   │   ├── ErrorMessage.jsx
│       │   │   ├── EmptyState.jsx
│       │   │   ├── Toast.jsx
│       │   │   ├── Input.jsx
│       │   │   ├── Select.jsx
│       │   │   ├── Table.jsx                                          # V2, sortable/paginated
│       │   │   └── ProgressBar.jsx                                    # V3, budget utilization
│       │   │
│       │   ├── expense/
│       │   │   ├── ExpenseForm.jsx
│       │   │   ├── ExpenseTable.jsx
│       │   │   ├── ExpenseCard.jsx
│       │   │   └── ExpenseFilters.jsx                                 # V2
│       │   │
│       │   ├── budget/                                                # V3
│       │   │   ├── BudgetForm.jsx
│       │   │   ├── BudgetCard.jsx
│       │   │   └── BudgetProgress.jsx
│       │   │
│       │   ├── category/
│       │   │   ├── CategoryForm.jsx
│       │   │   └── CategoryCard.jsx
│       │   │
│       │   └── analytics/                                             # V3
│       │       ├── SpendingChart.jsx
│       │       ├── CategoryBreakdownChart.jsx
│       │       └── SummaryStats.jsx
│       │
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Expenses.jsx
│       │   ├── Categories.jsx
│       │   ├── Analytics.jsx                                          # V3
│       │   ├── Budgets.jsx                                            # V3
│       │   └── NotFound.jsx
│       │
│       ├── layouts/
│       │   └── MainLayout.jsx
│       │
│       ├── services/
│       │   ├── api.js                                                 # fetch wrapper, reads VITE_API_BASE_URL
│       │   ├── expenseService.js
│       │   ├── categoryService.js
│       │   ├── budgetService.js                                       # V3
│       │   └── analyticsService.js                                    # V3
│       │
│       ├── hooks/
│       │   ├── useExpenses.js
│       │   ├── useCategories.js
│       │   ├── useBudgets.js                                          # V3
│       │   └── useAnalytics.js                                        # V3
│       │
│       ├── context/
│       │   └── AppContext.jsx                                         # toasts, locale/currency, global UI state
│       │
│       ├── utils/
│       │   ├── formatCurrency.js
│       │   ├── formatDate.js
│       │   └── validators.js
│       │
│       ├── constants/
│       │   └── placeholderConstants.js
│       │
│       ├── styles/
│       │   ├── index.css
│       │   ├── variables.css                                          # design.md §1 tokens as CSS custom properties
│       │   └── components.css                                        # component classes (Button, Card, Table, etc.)
│       │
│       ├── App.jsx
│       └── main.jsx
│
│
├── database/
│   │
│   ├── README.md
│   └── migrations/
│       ├── V1__initial_schema.sql
│       ├── V2__add_expense_search_indexes.sql                         # V2
│       └── V3__create_budgets_table.sql                               # V3
│
│
├── postman/
│   │
│   ├── CashTrack.postman_collection.json
│   └── CashTrack.postman_environment.json
│
│
└── .github/
    │
    └── workflows/
        └── ci.yml
```

---

## 6. Environment Variables & Configuration

Per `Agents.md` #4/#5, every environment-specific or sensitive value is externalized.
`.env` is gitignored on both `backend/` and `frontend/`; only `.env.example` is committed.

### 6.1 Backend (`backend/.env.example`)

```dotenv
# --- Server ---
SERVER_PORT=8080

# --- Database ---
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cashtrack
DB_USERNAME=cashtrack_app
DB_PASSWORD=changeme
DB_SCHEMA=public

# --- Flyway (external migrations folder — see §7.6) ---
MIGRATIONS_PATH=../database/migrations
FLYWAY_BASELINE_ON_MIGRATE=true

# --- CORS ---
CORS_ALLOWED_ORIGINS=http://localhost:5173

# --- Logging ---
LOG_LEVEL_ROOT=INFO
LOG_LEVEL_APP=DEBUG
```

`backend/src/main/resources/application.properties` (only literal values are safe
local dev defaults):

```properties
server.port=${SERVER_PORT:8080}
spring.application.name=cashtrack-backend

spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:cashtrack}
spring.datasource.username=${DB_USERNAME:cashtrack_app}
spring.datasource.password=${DB_PASSWORD:changeme}

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.default_schema=${DB_SCHEMA:public}
spring.jpa.open-in-view=false

spring.flyway.enabled=true
spring.flyway.locations=filesystem:${MIGRATIONS_PATH:../database/migrations}
spring.flyway.baseline-on-migrate=${FLYWAY_BASELINE_ON_MIGRATE:true}

cashtrack.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173}

logging.level.root=${LOG_LEVEL_ROOT:INFO}
logging.level.com.cashtrack=${LOG_LEVEL_APP:DEBUG}
```

> Schema truth lives entirely in `database/migrations/` — Hibernate is set to
> `validate`, never `update`, so the JPA entity model and the SQL migrations
> cannot silently drift apart.

### 6.2 Frontend (`frontend/.env.example`)

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_ENV=development
VITE_DEFAULT_CURRENCY=INR
VITE_DEFAULT_LOCALE=en-IN
```

`utils/formatCurrency.js` and `utils/formatDate.js` read these two values once and
export formatting helpers — no component ever hardcodes a currency symbol or date
format, satisfying `Agents.md` #9 and `design.md`'s "no hardcoded business data"
non-negotiable.

### 6.3 Docker Compose (dev parity)

Build context is the **repo root** (not `backend/`), so the backend image can also
pull in the top-level `database/migrations/` folder:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: ${DB_NAME:-cashtrack}
      POSTGRES_USER: ${DB_USERNAME:-cashtrack_app}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
    ports: ["5432:5432"]
    volumes: [db_data:/var/lib/postgresql/data]

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    env_file: ./backend/.env
    environment:
      MIGRATIONS_PATH: /app/migrations
    depends_on: [db]
    ports: ["8080:8080"]

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    env_file: ./frontend/.env
    ports: ["5173:5173"]

volumes:
  db_data:
```

`backend/Dockerfile` (relevant excerpt) copies the external migrations folder into
the image so `MIGRATIONS_PATH=/app/migrations` resolves inside the container:

```dockerfile
# build context = repo root
COPY backend/pom.xml .
COPY backend/src ./src
COPY database/migrations /app/migrations
```

---

## 7. Database Design

### 7.1 Entity-Relationship Overview (V1–V3)

```text
expenses (many) ── categories (many-to-one)
budgets  (many) ── categories (nullable, many-to-one; NULL = overall budget)
```

Categories are a user-managed database table in V1. Users can add, edit, and delete their own categories.

No `user_id` column exists yet anywhere. This is intentional so V5 can add ownership
via an additive migration without restructuring the schema above it.

### 7.2 Table: `categories`

| Column | Type | Constraints |
|---|---|---|
| `id` | `BIGINT` (identity) | PK |
| `name` | `VARCHAR(100)` | NOT NULL, UNIQUE |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT `now()` |

### 7.3 Table: `expenses`

| Column | Type | Constraints |
|---|---|---|
| `id` | `BIGINT` (identity) | PK |
| `title` | `VARCHAR(120)` | NOT NULL |
| `amount` | `NUMERIC(12,2)` | NOT NULL, CHECK (`amount > 0`) |
| `category_id` | `BIGINT` | NOT NULL, FK to `categories` |
| `expense_date` | `DATE` | NOT NULL |
| `description` | `TEXT` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT `now()`, auto-updated by trigger |

### 7.4 Table: `budgets` (V3)

| Column | Type | Constraints |
|---|---|---|
| `id` | `BIGINT` (identity) | PK |
| `category_id` | `BIGINT` | NULL, FK to `categories` (NULL = overall budget) |
| `period_month` | `DATE` | NOT NULL — normalized to first-of-month, e.g. `2026-08-01` |
| `amount` | `NUMERIC(12,2)` | NOT NULL, CHECK (`amount > 0`) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT `now()` |
| — | — | UNIQUE (`category_id`, `period_month`) — Postgres treats two `NULL`s as distinct, so a second "overall" budget for the same month is prevented at the **service layer** (`BudgetService`), not by this constraint alone |

### 7.5 Migration Files (`database/migrations/`)

| File | Version | Purpose |
|---|---|---|
| `V1__initial_schema.sql` | V1 | `CREATE TABLE categories`, `CREATE TABLE expenses`, checks, `updated_at` trigger |
| `V2__add_expense_search_indexes.sql` | V2 | Indexes for filter/sort/search (§7.7) |
| `V3__create_budgets_table.sql` | V3 | `CREATE TABLE budgets`, checks, unique constraint |

Migrations are strictly forward-only and additive — no destructive rewrites of
earlier migration files once merged (`Agents.md` #1, roadmap §20 "production-safe
changes").

### 7.6 Flyway location (external folder)

Because `database/migrations/` lives **outside** `backend/`, Flyway is configured
via `spring.flyway.locations=filesystem:${MIGRATIONS_PATH}` (§6.1) rather than the
default `classpath:db/migration`. Locally, `MIGRATIONS_PATH` defaults to
`../database/migrations` (relative to `backend/`); in Docker, it's copied into the
image and pointed at `/app/migrations` (§6.3). This keeps the SQL migration history
visible and reviewable at the repo root, independent of the backend module, and
directly usable by any future service that needs the same schema.

### 7.7 Indexes (introduced in V2, per roadmap §6 "Database Changes")

```sql
CREATE INDEX idx_expenses_category_id   ON expenses (category_id);
CREATE INDEX idx_expenses_expense_date  ON expenses (expense_date);
CREATE INDEX idx_expenses_amount        ON expenses (amount);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_expenses_title_trgm    ON expenses USING gin (title gin_trgm_ops);
```

The trigram index supports case-insensitive partial-match search on `title`
(roadmap §6 "Search expenses by title") without a full-text search engine.

---

## 8. API Design

### 8.1 Standards

- Base path: `/api/v1`
- JSON request/response bodies only; `Content-Type: application/json`
- DTO-based — entities are never serialized directly to clients (`PRODUCT_ROADMAP.md` §5)
- Standard HTTP status codes: `200`, `201`, `204`, `400`, `404`, `409`, `500`
- All list endpoints return a consistent page envelope (§8.2)
- All errors return a consistent error envelope (§8.3)
- OpenAPI 3 spec auto-generated via springdoc; **the Postman collection in
  `postman/` is the canonical, versioned, manually-curated contract** used for
  local testing and CI contract checks, and is updated in the same PR as any
  endpoint change

### 8.2 Standard Page Response

```json
{
  "content": [ /* items */ ],
  "page": 0,
  "size": 20,
  "totalElements": 143,
  "totalPages": 8,
  "sortBy": "expenseDate",
  "sortDir": "DESC"
}
```

### 8.3 Standard Error Response (`ErrorResponse`)

```json
{
  "timestamp": "2026-08-22T10:15:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/expenses",
  "validationErrors": [
    { "field": "amount", "message": "must be greater than 0" }
  ]
}
```

### 8.4 Categories

Categories are managed via full CRUD endpoints at `/api/v1/categories`. `GET /api/v1/expenses` (and its create/update DTOs) accept/return a `categoryId` referring to the user-managed categories. The frontend's `useCategories` hook populates the `Select` used in `ExpenseForm.jsx` and `ExpenseFilters.jsx` dynamically from the backend.

### 8.5 Endpoint Catalog

#### Categories (V1)

| Method | Path | Description | Introduced |
|---|---|---|---|
| GET | `/api/v1/categories` | List categories | V1 |
| GET | `/api/v1/categories/{id}` | Get one category | V1 |
| POST | `/api/v1/categories` | Create category | V1 |
| PUT | `/api/v1/categories/{id}` | Update category | V1 |
| DELETE | `/api/v1/categories/{id}` | Delete category | V1 |

#### Expenses (V1 base, V2 extended)

| Method | Path | Description | Introduced |
|---|---|---|---|
| GET | `/api/v1/expenses` | List expenses | V1 |
| GET | `/api/v1/expenses/{id}` | Get one expense | V1 |
| POST | `/api/v1/expenses` | Create expense | V1 |
| PUT | `/api/v1/expenses/{id}` | Update expense | V1 |
| DELETE | `/api/v1/expenses/{id}` | Delete expense | V1 |
| GET | `/api/v1/expenses/summary` | Total amount + count (optionally filtered by category/date) | V1 |

**V2 query parameters added to `GET /api/v1/expenses`:**

| Param | Type | Example |
|---|---|---|
| `search` | string | `search=coffee` (matches title, trigram) |
| `categoryId` | number | `categoryId=1` |
| `dateFrom` / `dateTo` | date (ISO) | `dateFrom=2026-08-01&dateTo=2026-08-31` |
| `amountMin` / `amountMax` | decimal | `amountMin=100&amountMax=5000` |
| `sortBy` | enum | `expenseDate` \| `amount` \| `title` |
| `sortDir` | enum | `ASC` \| `DESC` |
| `page` / `size` | int | `page=0&size=20` |

Implemented server-side via `ExpenseSpecification` (Spring Data JPA `Specification`
composition) — never string-concatenated queries.

#### Analytics (V3)

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/analytics/summary` | Total, average, highest, lowest expense for a period |
| GET | `/api/v1/analytics/daily` | Spending grouped by day |
| GET | `/api/v1/analytics/weekly` | Spending grouped by ISO week |
| GET | `/api/v1/analytics/monthly` | Spending grouped by month |
| GET | `/api/v1/analytics/category-breakdown` | Total per category for a given period |

All accept optional `dateFrom`/`dateTo`; default range is the current month.

#### Budgets (V3)

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/budgets` | List budgets (optionally by `periodMonth`) |
| GET | `/api/v1/budgets/{id}` | Get one budget |
| POST | `/api/v1/budgets` | Create budget (409 via `DuplicateBudgetPeriodException` if `categoryId`+`periodMonth` — including "overall", i.e. `categoryId=null` — already exists) |
| PUT | `/api/v1/budgets/{id}` | Update budget |
| DELETE | `/api/v1/budgets/{id}` | Delete budget |
| GET | `/api/v1/budgets/utilization?periodMonth=2026-08-01` | Budget vs. actual spend, with `utilizationPercent` per budget (overall + per-category) |

### 8.6 Sample DTOs

```json
// CreateExpenseRequest
{
  "title": "Dinner with friends",
  "amount": 650.00,
  "categoryId": 1,
  "expenseDate": "2026-08-21",
  "description": "Optional note"
}
```

```json
// BudgetUtilizationResponse item
{
  "budgetId": 4,
  "category": null,
  "periodMonth": "2026-08-01",
  "budgetAmount": 50000.00,
  "spentAmount": 38500.00,
  "remainingAmount": 11500.00,
  "utilizationPercent": 77.0
}
```

---

## 9. Frontend Application Design

### 9.1 Routes (`App.jsx`, React Router)

| Route | Version | Page component | Purpose |
|---|---|---|---|
| `/` | V1 | `Dashboard.jsx` | Summary cards + recent expenses |
| `/expenses` | V1→V2 | `Expenses.jsx` | Expense list; gains search/filter/sort/pagination in V2 |
| `/analytics` | V3 | `Analytics.jsx` | Charts: daily/weekly/monthly, category breakdown |
| `/budgets` | V3 | `Budgets.jsx` | Budget CRUD + utilization progress cards |
| `*` | V1 | `NotFound.jsx` | 404 fallback |

`layouts/MainLayout.jsx` wraps every route with the shared shell (nav + page frame).

### 9.2 State & Data Flow

```text
services/*.js (fetch wrapper over VITE_API_BASE_URL)
      ↓
hooks/use*.js (loading/error/data state, re-fetch triggers)
      ↓
pages/*.jsx (compose hooks + presentational components)
      ↓
components/** (props only — no component fetches directly, no component holds
                literal business data)
```

`context/AppContext.jsx` holds only cross-cutting UI concerns (toast queue,
resolved currency/locale from env) — not server data. Server data always flows
through the hooks/services layers above, never through context, so it stays
consistent with `design.md`'s "components accept props only" principle even
without TanStack Query.

### 9.3 Component Reuse Mapping

| Roadmap feature | Components used |
|---|---|
| Expense list (V1) | `Table.jsx` (from V2 onward; simple list markup in V1), `EmptyState.jsx`, `Loader.jsx` |
| Search/filter (V2) | `Input.jsx`, `Select.jsx`, `ExpenseFilters.jsx` |
| Sorting/pagination (V2) | `Table.jsx` sortable headers + pagination controls |
| Add/Edit expense | `Modal.jsx`, `Input.jsx`, `Select.jsx`, `Button.jsx`, `ExpenseForm.jsx` |
| Summary cards | `Card.jsx` (metric-style usage) |
| Analytics charts (V3) | Recharts inside `Card.jsx`, `SpendingChart.jsx`, `CategoryBreakdownChart.jsx` |
| Budget progress (V3) | `Card.jsx` + `ProgressBar.jsx`, `BudgetProgress.jsx` |
| All async/error paths | `Loader.jsx`, `EmptyState.jsx`, `ErrorMessage.jsx` |
| Transient feedback | `Toast.jsx`, dispatched via `AppContext.jsx` |

---

## 10. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Validation | Bean Validation (`@NotNull`, `@Positive`, `@Size`) on all request DTOs; mirrored checks in `utils/validators.js` |
| Error handling | `GlobalExceptionHandler` returns the standard `ErrorResponse`; no raw stack traces to clients |
| Logging | SLF4J, level controlled by env var, never hardcoded |
| Accessibility | WCAG AA per `design.md` §4 — applies from V1, not deferred, even without Radix primitives (native semantic HTML + `aria-*` attributes in hand-written components) |
| Responsiveness | Mobile/tablet/desktop breakpoints per `design.md` §1.3/§2, implemented as plain CSS media queries in `components.css` |
| API documentation | Swagger UI at `/swagger-ui.html` (non-prod only, env-gated); Postman collection kept in lockstep |
| Testing | Unit tests (service layer) + integration tests (Testcontainers, controller layer) required before merge (`Agents.md` #10) |
| Currency/locale | No hardcoded currency symbols; sourced from `VITE_DEFAULT_CURRENCY`/`VITE_DEFAULT_LOCALE` (§6.2) |

---

## 11. Design System Scope Alignment (`docs/design.md` on the approved plain-CSS stack)

`design.md` specifies Tailwind v4 + CVA + Radix/shadcn. The **approved** frontend
structure (§5) instead uses plain CSS (`variables.css` + `components.css`) and
hand-written JSX components. This section is the translation layer: the design
*tokens and rules* in `design.md` still apply in full — only the *delivery
mechanism* changes.

| `design.md` concept | Approved-stack implementation |
|---|---|
| §1.1 Color tokens (`oklch` custom properties) | Defined verbatim as CSS custom properties in `styles/variables.css`, under `:root` and `.dark`. Same token names (`--background`, `--primary`, `--success`, etc.) |
| §1.2 Typography scale | CSS custom properties (`--font-size-*`, `--font-weight-*`) in `variables.css`; applied via classes in `components.css` (e.g. `.h1-page-title`, `.metric-value`) |
| §1.3 Spacing / §1.4 Radius / §1.5 Shadows / §1.6 Motion | Same: custom properties in `variables.css`, consumed by class rules in `components.css` |
| §2 Layout (Sidebar + Navbar shell) | `layouts/MainLayout.jsx`, simplified: omit account menu, notifications, environment badge (all depend on auth/multi-env concepts not introduced until V5/V9) |
| §3 Button | `components/common/Button.jsx` + `.btn`, `.btn-primary`, `.btn-secondary`, etc. in `components.css` — CVA variants become explicit CSS classes |
| §3 Card | `components/common/Card.jsx` + `.card`, `.card-metric` |
| §3 Input family | `components/common/Input.jsx` now; `Select.jsx` needed starting **V2** |
| §3 Table | `components/common/Table.jsx`; sortable/paginated behavior added in **V2** |
| §3 Modal | `components/common/Modal.jsx`, `sm`/`md` widths only for V1–V3 |
| §3 Toast | `components/common/Toast.jsx`, dispatched through `AppContext.jsx` |
| §3 Empty / Loading / Error State | `EmptyState.jsx`, `Loader.jsx`, `ErrorMessage.jsx` — required from V1 |
| §4 Accessibility & quality bar | Applies from V1 regardless of stack — semantic HTML + `aria-*` attributes stand in for Radix's built-in a11y |
| Dark/light theme toggle (roadmap V6) | Tokens for both themes exist in `variables.css` now (cheap, prevents rework); no toggle UI is built until V6 |

**Net effect:** `design.md` remains the single design source of truth. Nothing in
it needs to be rewritten — this table is the only artifact that changes as the
implementation stack or version scope evolves.

---

## 12. Testing Strategy

| Layer | Tooling | Coverage target |
|---|---|---|
| Repository/Service | JUnit 5 + Mockito | All service methods, including edge cases (invalid amount, duplicate budget period) |
| Controller (integration) | `@SpringBootTest` + Testcontainers Postgres | Full request/response cycle, validation errors, pagination envelope, filter combinations |
| Migration | `flyway validate` in CI, against `database/migrations/` | Every migration applies cleanly on a fresh DB |
| Frontend | Vitest + React Testing Library | Form validation, empty/loading/error state rendering, filter/sort/pagination interactions |
| API contract | Postman/Newman run in CI against `postman/CashTrack.postman_collection.json` | Catches accidental breaking changes between versions |

---

## 13. CI/CD & Git Workflow

Per `PRODUCT_ROADMAP.md` §19 and `Agents.md` #11–#13, `.github/workflows/ci.yml` runs:

```text
Push / PR
   ↓
Build (backend: mvn package, frontend: npm run build)
   ↓
Unit + Integration Tests (JUnit/Testcontainers, Vitest)
   ↓
Lint / Quality (ESLint on frontend, Checkstyle/Spotless on backend)
   ↓
Dependency Scan
   ↓
Flyway validate (against database/migrations/)
   ↓
Postman/Newman contract run
   ↓
Package (Docker images)
   ↓
Deploy → Production Smoke Test
```

- Feature branches only; no direct pushes to `main` (`Agents.md` #12)
- PRs required, with passing CI as a merge gate (`Agents.md` #13)
- `main` protected; releases tagged `v1.0.0`, `v2.0.0`, `v3.0.0` at each version boundary
- `docs/SRS.md`, `postman/*.json`, and any migration file are updated in the same
  PR as the change that requires them (`Agents.md` #14)

---

## 14. Acceptance Criteria

### V1 — Core Expense Tracker

- [ ] `categories` table exists after `V1__initial_schema.sql`
- [ ] Full Category CRUD works end-to-end through the deployed frontend
- [ ] Full expense CRUD works end-to-end through the deployed frontend
- [ ] Basic filter by category and date functions correctly
- [ ] `/expenses/summary` returns correct total and count
- [ ] All endpoints validated, documented in Swagger, and mirrored in the Postman collection
- [ ] Deployed and smoke-tested in a real environment

### V2 — Better Expense Management

- [ ] Search by title (trigram-based) returns correct partial matches
- [ ] Combined filter (category + date range + amount range) works via `ExpenseSpecification`
- [ ] Sorting by date/amount/title works both ascending and descending
- [ ] Pagination returns the correct `PageResponse` envelope and matches `Table.jsx` controls
- [ ] Indexes present and verified via `EXPLAIN ANALYZE` on representative queries
- [ ] Deployed and smoke-tested; V1 functionality remains fully intact

### V3 — Analytics & Budget

- [ ] Daily/weekly/monthly/category-wise/total/average/highest/lowest analytics all return correct aggregates
- [ ] Budget CRUD works; duplicate `(category, periodMonth)` — including two "overall" budgets for the same month — correctly returns `409`
- [ ] Budget utilization calculation (`spent / budget * 100`) matches roadmap §7 example (₹50,000 budget, ₹38,500 spent → 77%)
- [ ] `Analytics.jsx` and `Budgets.jsx` render using only the components in §9.3/§11
- [ ] Deployed and smoke-tested; V1 and V2 functionality remain fully intact

---

## 15. Traceability Matrix

| Roadmap Requirement | DB | API | UI |
|---|---|---|---|
| Expense CRUD (§5) | `expenses` | `/expenses*` | `Expenses.jsx`, `ExpenseForm.jsx`, `ExpenseTable.jsx` |
| Category CRUD (§5) | `categories` | `/categories*` | `Categories.jsx`, `CategoryForm.jsx` |
| Basic filter (§5) | indexes (V2) | `categoryId`, `dateFrom/To` params | `ExpenseFilters.jsx` |
| Basic summary (§5) | aggregate query | `/expenses/summary` | `Dashboard.jsx` summary cards |
| Search (§6) | `pg_trgm` index | `search` param | `ExpenseFilters.jsx` search input |
| Filter/Sort/Pagination (§6) | indexes | query params + page envelope | `ExpenseFilters.jsx`, `Table.jsx` |
| Analytics (§7) | aggregate queries over `expenses` | `/analytics/*` | `Analytics.jsx`, `SpendingChart.jsx`, `CategoryBreakdownChart.jsx` |
| Budget management (§7) | `budgets` | `/budgets*` | `Budgets.jsx`, `BudgetForm.jsx`, `BudgetProgress.jsx` |

---

## 16. Appendix

### 16.1 `database/migrations/V1__initial_schema.sql`

```sql
CREATE TABLE categories (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE expenses (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title         VARCHAR(120) NOT NULL,
    amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    category_id   BIGINT NOT NULL REFERENCES categories(id),
    expense_date  DATE NOT NULL,
    description   TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### 16.2 `database/migrations/V2__add_expense_search_indexes.sql`

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_expenses_category_id   ON expenses (category_id);
CREATE INDEX idx_expenses_expense_date  ON expenses (expense_date);
CREATE INDEX idx_expenses_amount        ON expenses (amount);
CREATE INDEX idx_expenses_title_trgm    ON expenses USING gin (title gin_trgm_ops);
```

### 16.3 `database/migrations/V3__create_budgets_table.sql`

```sql
CREATE TABLE budgets (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id   BIGINT REFERENCES categories(id),
    period_month  DATE NOT NULL,
    amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (category_id, period_month)
);

CREATE TRIGGER trg_budgets_updated_at
BEFORE UPDATE ON budgets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### 16.4 `.gitignore` essentials

```gitignore
.env
.env.*
!.env.example
target/
node_modules/
dist/
```
