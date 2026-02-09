# Task: T2-001, T3-006 - Configuration settings
# From: specs/phase2-web/plan.md §7, specs/phase3-ai-chatbot/plan.md §2.5
"""
Application configuration using Pydantic Settings.
"""

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "postgresql://localhost/todo"

    # Authentication - Better Auth URL for JWKS verification
    better_auth_url: str = "http://localhost:3000"
    better_auth_secret: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "EdDSA"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    # App
    app_name: str = "Todo API"
    debug: bool = False

    # Gemini AI Configuration (T3-006)
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-1.5-flash"
    gemini_max_tokens: int = 1024
    gemini_temperature: float = 0.7

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
