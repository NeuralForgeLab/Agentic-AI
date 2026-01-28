"""Embedding service for generating vector embeddings via Google Gemini."""

from typing import List, Optional

import google.generativeai as genai

from app.config import get_settings


class EmbeddingService:
    """Service for generating text embeddings using Google Gemini."""

    def __init__(self):
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)
        self.model = settings.embedding_model
        self.dimensions = settings.embedding_dimensions

    async def get_embedding(self, text: str) -> List[float]:
        """Get embedding for a single text."""
        result = genai.embed_content(
            model=self.model,
            content=text,
            task_type="retrieval_document",
        )
        return result["embedding"]

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings for multiple texts."""
        if not texts:
            return []

        embeddings = []
        # Process in batches of 100 (Gemini batch limit)
        batch_size = 100
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            result = genai.embed_content(
                model=self.model,
                content=batch,
                task_type="retrieval_document",
            )
            # Result contains 'embedding' for single text or list for multiple
            if isinstance(result["embedding"][0], list):
                embeddings.extend(result["embedding"])
            else:
                embeddings.append(result["embedding"])

        return embeddings


# Singleton instance
_embedding_service: Optional[EmbeddingService] = None


def get_embedding_service() -> EmbeddingService:
    """Get the embedding service singleton."""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service
