"""Chat service orchestrating scope validation, context building, LLM execution, and logging."""

import asyncio
from pathlib import Path
from uuid import UUID

from pydantic import BaseModel

from app.api.schemas.chat import ChatResponse
from app.db.repositories.chat import ChatMessageRepository
from app.db.repositories.verdicts import VerdictContext, VerdictRepository
from app.errors import NotFoundError, RateLimitedError
from app.llm.provider import get_llm_provider
from app.llm.redaction import redact_secrets
from app.security.rate_limit import check_chat_rate_limits
from app.services.access_service import AccessService
from app.services.chat_classifier import REFUSAL_MESSAGE, classify_question
from app.services.faq_service import match_faq, sanitize_reply

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "llm" / "prompts"


class ChatCompletionResponse(BaseModel):
    """Structured response from LLM for chat completions."""

    reply: str


class ChatService:
    """Service handling the SupplyShield help assistant workflow."""

    def __init__(
        self,
        access_service: AccessService | None = None,
        verdict_repo: VerdictRepository | None = None,
        chat_repo: ChatMessageRepository | None = None,
    ) -> None:
        self.access_service = access_service or AccessService()
        self.verdict_repo = verdict_repo or VerdictRepository()
        self.chat_repo = chat_repo or ChatMessageRepository()

    async def handle_chat(
        self,
        *,
        user_id: UUID,
        message: str,
        verdict_id: UUID | None = None,
    ) -> ChatResponse:
        """Process inbound chat message through security controls, classifier, and LLM."""
        # 1. Rate limiting: 20 per 10m, 200 per day
        allowed, retry_after = await check_chat_rate_limits(str(user_id))
        if not allowed:
            raise RateLimitedError(
                "You have sent a lot of questions. Try again in a few minutes.",
                retry_after=retry_after,
            )

        # 2. Authorization: verify repo access if verdict_id provided
        verdict_ctx: VerdictContext | None = None
        if verdict_id is not None:
            verdict_ctx = await self.verdict_repo.get_by_id(verdict_id)
            if verdict_ctx is None:
                raise NotFoundError("Resource not found")

            has_access = await self.access_service.require_repo_access(
                user_id, verdict_ctx.repo_id
            )
            if not has_access:
                # Return NOT_FOUND so verdict existence is not revealed
                raise NotFoundError("Resource not found")

        # 3. Scope classification: refuse off-topic / prompt injections before LLM
        if not classify_question(message):
            await self.chat_repo.log_message(
                user_id=user_id,
                source="refused",
                message=message,
                verdict_id=verdict_id,
            )
            return ChatResponse(
                reply=REFUSAL_MESSAGE,
                source="refused",
                ai_status="ok",
            )

        # 4. Context assembly
        system_prompt = self._load_system_prompt()
        user_prompt = self._build_user_prompt(message, verdict_ctx)

        # Redact secrets from context
        system_prompt = redact_secrets(system_prompt)
        user_prompt = redact_secrets(user_prompt)

        # 5. LLM Call with 8s timeout and FAQ Fallback
        provider = get_llm_provider()
        reply: str
        source: str
        ai_status: str

        if provider is None:
            ai_status = "disabled"
            source = "faq"
            reply = match_faq(message)
        else:
            try:
                result = await asyncio.wait_for(
                    provider.complete_json(
                        system=system_prompt,
                        user=user_prompt,
                        schema=ChatCompletionResponse,
                        max_output_tokens=1024,
                    ),
                    timeout=8.0,
                )
                reply = result.reply
                source = "llm"
                ai_status = "ok"
            except Exception:
                ai_status = "unavailable"
                source = "faq"
                reply = match_faq(message)

        # 6. Sanitize output (plain text, strip HTML/markdown links, cap 1200 chars)
        sanitized_reply = sanitize_reply(reply)

        # 7. Audit logging
        await self.chat_repo.log_message(
            user_id=user_id,
            source=source,
            message=message,
            verdict_id=verdict_id,
        )

        return ChatResponse(
            reply=sanitized_reply,
            source=source,  # type: ignore[arg-type]
            ai_status=ai_status,  # type: ignore[arg-type]
        )

    def _load_system_prompt(self) -> str:
        sys_path = PROMPTS_DIR / "chat_system.txt"
        faq_path = PROMPTS_DIR / "faq.md"

        sys_text = sys_path.read_text(encoding="utf-8") if sys_path.exists() else ""
        faq_text = faq_path.read_text(encoding="utf-8") if faq_path.exists() else ""

        return f"{sys_text}\n\nKNOWLEDGE BASE FAQ:\n{faq_text}"

    def _build_user_prompt(
        self,
        message: str,
        verdict: VerdictContext | None,
    ) -> str:
        prompt_parts: list[str] = []

        if verdict is not None:
            findings_summary = "\n".join(
                f"- Rule: {f.get('rule', 'unknown')}, File: {f.get('file', 'unknown')}, Message: {f.get('message', '')}"
                for f in verdict.findings
            )
            prompt_parts.append(
                f"CURRENT VERDICT CONTEXT (Safe fields):\n"
                f"- Score: {verdict.score}/100\n"
                f"- Level: {verdict.level}\n"
                f"- Floor Applied: {verdict.floor_applied or 'None'}\n"
                f"- AI Status: {verdict.ai_status}\n"
                f"- Findings:\n{findings_summary or 'None'}\n"
            )

        prompt_parts.append(
            f"<user_message untrusted=\"true\">\n{message}\n</user_message>"
        )
        return "\n\n".join(prompt_parts)

