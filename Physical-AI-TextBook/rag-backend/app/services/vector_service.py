"""Vector database service for Qdrant operations."""

import uuid
from typing import Any, Dict, List, Optional

from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import Distance, PointStruct, VectorParams

from app.config import get_settings


class VectorService:
    """Service for interacting with Qdrant vector database."""

    def __init__(self):
        settings = get_settings()
        self.client = QdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key,
        )
        self.collection_name = settings.qdrant_collection_name
        self.vector_size = settings.embedding_dimensions

    async def ensure_collection(self, recreate: bool = False) -> bool:
        """Ensure the collection exists, create if not."""
        try:
            collections = self.client.get_collections()
            existing = [c.name for c in collections.collections]

            # Delete and recreate if requested
            if recreate and self.collection_name in existing:
                print(f"Deleting existing collection: {self.collection_name}")
                self.client.delete_collection(self.collection_name)
                existing.remove(self.collection_name)

            if self.collection_name not in existing:
                print(f"Creating collection with vector size: {self.vector_size}")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.vector_size, distance=Distance.COSINE
                    ),
                )
                # Create payload indexes for filtering
                self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name="chapter",
                    field_schema=models.PayloadSchemaType.KEYWORD,
                )
                self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name="locale",
                    field_schema=models.PayloadSchemaType.KEYWORD,
                )
            return True
        except Exception as e:
            print(f"Error ensuring collection: {e}")
            return False

    async def upsert_vectors(
        self,
        vectors: List[List[float]],
        payloads: List[Dict[str, Any]],
        ids: Optional[List[str]] = None,
    ) -> bool:
        """Upsert vectors with their metadata."""
        try:
            if ids is None:
                ids = [str(uuid.uuid4()) for _ in vectors]

            points = [
                PointStruct(id=id_, vector=vector, payload=payload)
                for id_, vector, payload in zip(ids, vectors, payloads)
            ]

            self.client.upsert(collection_name=self.collection_name, points=points)
            return True
        except Exception as e:
            print(f"Error upserting vectors: {e}")
            return False

    async def search(
        self,
        query_vector: List[float],
        limit: int = 5,
        chapter: Optional[str] = None,
        locale: str = "en",
    ) -> List[Dict[str, Any]]:
        """Search for similar vectors."""
        try:
            # Build filter conditions
            filter_conditions = [
                models.FieldCondition(
                    key="locale", match=models.MatchValue(value=locale)
                )
            ]

            if chapter:
                filter_conditions.append(
                    models.FieldCondition(
                        key="chapter", match=models.MatchValue(value=chapter)
                    )
                )

            search_filter = (
                models.Filter(must=filter_conditions) if filter_conditions else None
            )

            results = self.client.query_points(
                collection_name=self.collection_name,
                query=query_vector,
                query_filter=search_filter,
                limit=limit,
                with_payload=True,
            ).points

            return [
                {
                    "id": str(result.id),
                    "score": result.score,
                    "chapter": result.payload.get("chapter", ""),
                    "section": result.payload.get("section", ""),
                    "content": result.payload.get("content", ""),
                    "url": result.payload.get("url", ""),
                    "locale": result.payload.get("locale", "en"),
                }
                for result in results
            ]
        except Exception as e:
            print(f"Error searching vectors: {e}")
            return []

    async def delete_by_chapter(self, chapter: str) -> bool:
        """Delete all vectors for a specific chapter."""
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.FilterSelector(
                    filter=models.Filter(
                        must=[
                            models.FieldCondition(
                                key="chapter", match=models.MatchValue(value=chapter)
                            )
                        ]
                    )
                ),
            )
            return True
        except Exception as e:
            print(f"Error deleting vectors: {e}")
            return False

    async def get_collection_info(self) -> Dict[str, Any]:
        """Get collection statistics."""
        try:
            info = self.client.get_collection(self.collection_name)
            # Handle both old and new Qdrant API versions
            vectors_count = getattr(info, "vectors_count", None)
            if vectors_count is None:
                vectors_count = getattr(info, "points_count", 0)
            points_count = getattr(info, "points_count", vectors_count)
            status = (
                getattr(info.status, "value", str(info.status))
                if info.status
                else "unknown"
            )
            return {
                "vectors_count": vectors_count,
                "points_count": points_count,
                "status": status,
            }
        except Exception as e:
            print(f"Error getting collection info: {e}")
            return {}


# Singleton instance
_vector_service: Optional[VectorService] = None


def get_vector_service() -> VectorService:
    """Get the vector service singleton."""
    global _vector_service
    if _vector_service is None:
        _vector_service = VectorService()
    return _vector_service
