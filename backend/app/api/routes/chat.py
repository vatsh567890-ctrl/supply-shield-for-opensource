"""AI Help Chatbot route handling."""

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
    and when ALLOW_MOCK_AUTH is False. The mock session cookie is never
    a valid database session.

    Real sessions must be looked up in the session store. Until Phase 2
    is built, real sessions are rejected with UNAUTHENTICATED.
    """
    settings = get_settings()
    session_cookie = request.cookies.get("ss_session")
    demo_cookie = request.cookies.get("ss_demo")

    if not session_cookie and demo_cookie != "1":
        raise UnauthenticatedError("Authentication required")

    # Handle mock dev session tokens
    is_mock_cookie = (session_cookie == "mock-dev-session") or (demo_cookie == "1")
    if is_mock_cookie:
        # Strictly reject mock session unless in development with mock auth enabled
        if settings.APP_ENV != "development" or not settings.ALLOW_MOCK_AUTH:
            raise UnauthenticatedError("Invalid or expired session")
        return MOCK_USER_ID

    # Real database sessions must be looked up in the session store.
    # Until Phase 2 is built, all real sessions are rejected with UNAUTHENTICATED.
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
