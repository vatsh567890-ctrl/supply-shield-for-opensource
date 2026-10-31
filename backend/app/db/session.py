"""SQLAlchemy asynchronous engine and session factory."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker


def create_engine_and_session_factory() -> tuple[object, async_sessionmaker[AsyncSession]]:
    """Create async engine and session factory.

    Implemented in Phase 1.
    """
    raise NotImplementedError("Engine and session factory are implemented in Phase 1")


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide scoped async database session.

    Implemented in Phase 1.
    """
    raise NotImplementedError("Database session provider is implemented in Phase 1")
    yield None
