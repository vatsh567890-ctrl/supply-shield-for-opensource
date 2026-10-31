"""FastAPI application factory and middleware registration."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import get_settings, validate_startup_config
from app.errors import (
    AppError,
    app_error_handler,
    not_implemented_exception_handler,
    unhandled_exception_handler,
)
from app.logging import setup_logging
from app.security.request_id import RequestIdMiddleware
from app.security.security_headers import SecurityHeadersMiddleware


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context for startup and shutdown routines."""
    settings = get_settings()
    setup_logging(settings.LOG_LEVEL)

    validate_startup_config(settings)
    yield


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="SupplyShield API",
        description="Pre-merge security scanner for open-source PRs and dependency updates",
        version="0.1.0",
        lifespan=lifespan,
    )

    # CORS policy
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_ORIGIN],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # Security response headers
    app.add_middleware(SecurityHeadersMiddleware)

    # Request ID middleware (outermost: assigns/preserves UUID request_id and sets X-Request-ID header)
    app.add_middleware(RequestIdMiddleware)

    # Exception handlers
    app.add_exception_handler(AppError, app_error_handler)  # type: ignore[arg-type]
    app.add_exception_handler(NotImplementedError, not_implemented_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_exception_handler)

    # Master API router
    app.include_router(api_router)

    return app


app = create_app()
