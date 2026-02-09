"""Configuration settings for the RAG backend."""

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Google Gemini API
    gemini_api_key: str

    # Qdrant
    qdrant_url: str
    qdrant_api_key: str
    qdrant_collection_name: str = "textbook_content"

    # Database
    database_url: str

    # Firebase
    firebase_project_id: str = ""
    firebase_private_key: str = ""
    firebase_client_email: str = ""

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Embedding settings (Gemini embedding model)
    embedding_model: str = "models/text-embedding-004"
    embedding_dimensions: int = 768

    # Chat settings (Gemini model - using 2.5 flash for better quota)
    chat_model: str = "models/gemini-2.5-flash"
    max_context_chunks: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
