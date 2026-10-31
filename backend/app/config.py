"""Application settings validated at startup via pydantic-settings."""

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """SupplyShield environment settings based strictly on Section 12."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="forbid",
    )

    APP_ENV: Literal["development", "production"] = "production"
    ALLOW_MOCK_AUTH: bool = False
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    DATABASE_URL: str = "postgresql+psycopg://supplyshield:supplyshield@localhost:5432/supplyshield"
    REDIS_URL: str = "redis://localhost:6379/0"
    SESSION_SECRET: str | None = None

    GITHUB_APP_ID: str = "0"
    GITHUB_APP_PRIVATE_KEY_PATH: str | None = None
    GITHUB_APP_PRIVATE_KEY: str | None = None
    GITHUB_APP_WEBHOOK_SECRET: str | None = None

    GITHUB_OAUTH_CLIENT_ID: str | None = None
    GITHUB_OAUTH_CLIENT_SECRET: str | None = None
    GITHUB_OAUTH_REDIRECT_URI: str = "http://localhost:3000/api/auth/github/callback"

    LLM_PROVIDER: Literal["gemini", "anthropic", "none"] = "none"
    LLM_API_KEY: str | None = None
    LLM_MODEL: str = "gemini-1.5-pro"
    LLM_MAX_INPUT_TOKENS: int = 60000

    ANALYSIS_MAX_FILES: int = 5000
    ANALYSIS_MAX_TOTAL_BYTES: int = 209715200  # 200 MB
    ANALYSIS_MAX_ARTIFACT_BYTES: int = 52428800  # 50 MB
    ANALYSIS_TIMEOUT_SECONDS: int = 240

    OSV_API_URL: str = "https://api.osv.dev"
    LOG_LEVEL: str = Field(default="INFO")
    CHAT_LOG_TEXT: bool = False
    NEXT_PUBLIC_USE_MOCKS: bool = False
    ML_MODE: Literal["off", "shadow", "active"] = "off"

    @field_validator("ML_MODE")
    @classmethod
    def validate_ml_mode(cls, v: str) -> str:
        if v == "active":
            raise ValueError(
                "ML_MODE 'active' is not permitted in this release; only 'off' and 'shadow' are supported."
            )
        return v


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings singleton."""
    return Settings()


def check_missing_config(settings: Settings | None = None) -> list[str]:
    """Identify required Section 12 configuration variables that are missing or empty.

    Returns variable names only, never revealing sensitive values.
    """
    s = settings or get_settings()
    missing: list[str] = []

    # Required core secrets & connections
    if not s.DATABASE_URL or not s.DATABASE_URL.strip():
        missing.append("DATABASE_URL")
    if not s.REDIS_URL or not s.REDIS_URL.strip():
        missing.append("REDIS_URL")
    if not s.SESSION_SECRET or not s.SESSION_SECRET.strip():
        missing.append("SESSION_SECRET")

    # GitHub App Integration
    if not s.GITHUB_APP_ID or not s.GITHUB_APP_ID.strip() or s.GITHUB_APP_ID == "0":
        missing.append("GITHUB_APP_ID")
    if not (s.GITHUB_APP_PRIVATE_KEY and s.GITHUB_APP_PRIVATE_KEY.strip()) and not (
        s.GITHUB_APP_PRIVATE_KEY_PATH and s.GITHUB_APP_PRIVATE_KEY_PATH.strip()
    ):
        missing.append("GITHUB_APP_PRIVATE_KEY")
    if not s.GITHUB_APP_WEBHOOK_SECRET or not s.GITHUB_APP_WEBHOOK_SECRET.strip():
        missing.append("GITHUB_APP_WEBHOOK_SECRET")

    # GitHub OAuth App
    if not s.GITHUB_OAUTH_CLIENT_ID or not s.GITHUB_OAUTH_CLIENT_ID.strip():
        missing.append("GITHUB_OAUTH_CLIENT_ID")
    if not s.GITHUB_OAUTH_CLIENT_SECRET or not s.GITHUB_OAUTH_CLIENT_SECRET.strip():
        missing.append("GITHUB_OAUTH_CLIENT_SECRET")
    if not s.GITHUB_OAUTH_REDIRECT_URI or not s.GITHUB_OAUTH_REDIRECT_URI.strip():
        missing.append("GITHUB_OAUTH_REDIRECT_URI")

    # LLM Provider
    if s.LLM_PROVIDER != "none" and (not s.LLM_API_KEY or not s.LLM_API_KEY.strip()):
        missing.append("LLM_API_KEY")

    return missing


def validate_startup_config(settings: Settings | None = None) -> None:
    """Validate application configuration at startup, enforcing secure-by-default rules.

    - In production: refuses to run if ALLOW_MOCK_AUTH is True.
    - In production: refuses to run if required secrets/configs are missing (names variables, never values).
    - In development: logs warnings naming any missing variables.
    """
    import logging

    s = settings or get_settings()

    # Rule 1: Fail closed on mock auth in production
    if s.APP_ENV == "production" and s.ALLOW_MOCK_AUTH:
        raise RuntimeError(
            "Startup refused: ALLOW_MOCK_AUTH=true is strictly forbidden when APP_ENV is production."
        )

    missing = check_missing_config(s)
    if missing:
        if s.APP_ENV == "production":
            raise RuntimeError(
                f"Missing required production configuration variables: {', '.join(missing)}"
            )
        logging.getLogger("app.config").warning(
            "Missing or empty Section 12 configuration variables: %s",
            ", ".join(missing),
        )
