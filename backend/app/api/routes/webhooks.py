"""GitHub webhook handler."""

from fastapi import APIRouter, Request, status

from app.api.schemas.webhooks import WebhookResponse

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/github", response_model=WebhookResponse, status_code=status.HTTP_202_ACCEPTED)
async def github_webhook(request: Request) -> WebhookResponse:
    """Handle incoming GitHub pull_request webhooks.

    Implemented in Phase 5.
    """
    raise NotImplementedError("GitHub webhook endpoint is implemented in Phase 5")
