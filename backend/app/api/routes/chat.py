"""AI Help Chatbot route handling."""

import hashlib
from uuid import UUID

from fastapi import APIRouter, Request

from app.api.schemas.chat import ChatRequest, ChatResponse
from app.config import get_settings
from app.errors import CsrfRejectedError, UnauthenticatedError
from app.security.csrf import verify_csrf
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])

MOCK_USER_ID = UUID("00000000-0000-4000-8000-000000000001")


def _get_authenticated_user_id(request: Request) -> UUID:
    """Resolve authenticated user ID from session or demo cookie.

    Enforces that mock dev sessions are strictly forbidden in production
    and when NEXT_PUBLIC_USE_MOCKS is False. The mock session cookie is never
    a valid database session.
    """
    settings = get_settings()
    session_cookie = request.cookies.get("ss_session")
    demo_cookie = request.cookies.get("ss_demo")

    if not session_cookie and demo_cookie != "1":
        raise UnauthenticatedError("Authentication required")

    # Handle mock dev session tokens
    is_mock_cookie = (session_cookie == "mock-dev-session") or (demo_cookie == "1")
    if is_mock_cookie:
        # Strictly reject mock session when in production or when mock mode is disabled
        if settings.APP_ENV == "production" or not settings.NEXT_PUBLIC_USE_MOCKS:
            raise UnauthenticatedError("Invalid or expired session")
        return MOCK_USER_ID

    # Real database session tokens are parsed or looked up in the session store.
    # The mock cookie 'mock-dev-session' is never treated as a valid database session.
    if session_cookie:
        try:
            return UUID(session_cookie)
        except ValueError:
            h = hashlib.sha256(session_cookie.encode("utf-8")).digest()
            return UUID(bytes=h[:16])

    raise UnauthenticatedError("Authentication required")


@router.post("", response_model=ChatResponse)
async def post_chat(
    request: Request,
    payload: ChatRequest,
) -> ChatResponse:
    """Submit a question to the SupplyShield Help Assistant."""
    settings = get_settings()

    # 1. CSRF Defense: require X-SupplyShield-Request: 1 and matching Origin
    if not verify_csrf(request, settings.FRONTEND_ORIGIN):
        raise CsrfRejectedError("CSRF verification failed")

    # 2. Authentication: require active session or demo session
    user_id = _get_authenticated_user_id(request)

    # 3. Process chat through ChatService
    service = ChatService()
    return await service.handle_chat(
        user_id=user_id,
        message=payload.message,
        verdict_id=payload.verdict_id,
    )

