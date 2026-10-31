# Backend Engineering Standards

1. **Thin Routers**: FastAPI routers stay thin and delegate all business logic to service classes. Routers only handle request parsing, dependency injection, and HTTP status mapping.
2. **Business Logic in Services**: All domain logic, workflow orchestration, and cross-cutting rules reside exclusively in `services/`.
3. **Repository Pattern**: Repositories in `db/repositories/` are the only layer that touches SQLAlchemy sessions and models directly.
4. **Strict Schema Contracts**: Every request body and response payload must have an explicit Pydantic schema with `extra="forbid"`.
5. **Standardized Error Handling**: Errors must use `AppError` subclasses with stable, documented error codes. Never return raw stack traces, database schema details, or internal paths.
6. **Migrations Only**: All database schema changes go through Alembic migrations only.
