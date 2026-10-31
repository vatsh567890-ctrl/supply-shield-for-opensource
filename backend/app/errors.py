"""Application error hierarchy and response models.

Ensures stable error codes and safe messages with zero stack trace or internal leak.
"""

import logging
import uuid
from typing import Any

from fastapi import Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger("app.errors")


class AppError(Exception):
    """Base application error with stable code, safe message, and HTTP status."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class UnauthenticatedError(AppError):
    def __init__(self, message: str = "Authentication required") -> None:
        super().__init__("UNAUTHENTICATED", message, status.HTTP_401_UNAUTHORIZED)


class ForbiddenError(AppError):
    def __init__(self, message: str = "Access denied") -> None:
        super().__init__("FORBIDDEN", message, status.HTTP_403_FORBIDDEN)


class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found") -> None:
        super().__init__("NOT_FOUND", message, status.HTTP_404_NOT_FOUND)


class ValidationFailedError(AppError):
    def __init__(self, message: str = "Validation failed") -> None:
        super().__init__("VALIDATION_FAILED", message, status.HTTP_422_UNPROCESSABLE_ENTITY)


class RateLimitedError(AppError):
    def __init__(
        self,
        message: str = "Too many requests. Please try again later.",
        retry_after: int | None = None,
    ) -> None:
        super().__init__("RATE_LIMITED", message, status.HTTP_429_TOO_MANY_REQUESTS)
        self.retry_after = retry_after


class CsrfRejectedError(AppError):
    def __init__(self, message: str = "CSRF verification failed") -> None:
        super().__init__("CSRF_REJECTED", message, status.HTTP_403_FORBIDDEN)


class AppNotInstalledError(AppError):
    def __init__(self, message: str = "GitHub App is not installed on this repository.") -> None:
        super().__init__("APP_NOT_INSTALLED", message, status.HTTP_400_BAD_REQUEST)


class InvalidPrUrlError(AppError):
    def __init__(self, message: str = "Invalid GitHub PR URL format.") -> None:
        super().__init__("INVALID_PR_URL", message, status.HTTP_400_BAD_REQUEST)


class NotImplementedAppError(AppError):
    def __init__(self, message: str = "GitHub sign-in is not configured yet.") -> None:
        super().__init__("NOT_IMPLEMENTED", message, status.HTTP_501_NOT_IMPLEMENTED)


def _resolve_request_id(request: Request) -> str:
    """Ensure a valid UUID request_id exists on request.state and return it."""
    req_id = getattr(request.state, "request_id", None)
    if not req_id or req_id == "unknown":
        req_id = str(uuid.uuid4())
        request.state.request_id = req_id
    return str(req_id)


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """Format AppError into standard client response body."""
    request_id = _resolve_request_id(request)
    content = {
        "error": {
            "code": exc.code,
            "message": exc.message,
            "request_id": request_id,
        }
    }
    response = JSONResponse(status_code=exc.status_code, content=content)
    response.headers["X-Request-ID"] = request_id
    if hasattr(exc, "retry_after") and exc.retry_after is not None:
        response.headers["Retry-After"] = str(exc.retry_after)
    return response


async def not_implemented_exception_handler(
    request: Request, exc: NotImplementedError
) -> JSONResponse:
    """Handle NotImplementedError returning 501 NOT_IMPLEMENTED."""
    request_id = _resolve_request_id(request)
    message = str(exc) if str(exc) else "GitHub sign-in is not configured yet."
    content = {
        "error": {
            "code": "NOT_IMPLEMENTED",
            "message": message,
            "request_id": request_id,
        }
    }
    response = JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content=content,
    )
    response.headers["X-Request-ID"] = request_id
    return response


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Log full traceback server-side and mask unexpected server errors with a generic message."""
    request_id = _resolve_request_id(request)

    # Server-side full traceback logging tagged with request_id
    logger.error(
        "Unhandled exception occurred processing request [%s]: %s",
        request_id,
        str(exc),
        exc_info=True,
        extra={"request_id": request_id},
    )

    # Client gets safe generic response with request_id, zero traceback or internal text
    content = {
        "error": {
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred. Please try again later.",
            "request_id": request_id,
        }
    }
    response = JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=content,
    )
    response.headers["X-Request-ID"] = request_id
    return response
