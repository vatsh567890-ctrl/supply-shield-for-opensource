"""Master API router aggregating all route handlers."""

from fastapi import APIRouter

from app.api.routes import analyses, auth, chat, health, me, repos, verdicts, webhooks

api_router = APIRouter()

# Health and readiness
api_router.include_router(health.router)

# Authentication and user context
api_router.include_router(auth.router)
api_router.include_router(me.router)

# AI Chatbot
api_router.include_router(chat.router)

# Core domain endpoints
api_router.include_router(repos.router)
api_router.include_router(analyses.router)
api_router.include_router(verdicts.router)

# Inbound webhooks
api_router.include_router(webhooks.router)
