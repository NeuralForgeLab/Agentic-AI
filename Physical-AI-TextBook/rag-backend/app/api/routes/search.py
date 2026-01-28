"""Search API routes for vector search."""

from fastapi import APIRouter, Depends, Query
from typing import Optional

from app.models.schemas import SearchRequest, SearchResponse, SearchResult
from app.services.embedding_service import get_embedding_service
from app.services.vector_service import get_vector_service
from app.services.auth_service import firebase_auth_optional

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SearchResponse)
async def semantic_search(
    request: SearchRequest, user: dict = Depends(firebase_auth_optional)
):
    """Perform semantic search on the textbook content."""
    embedding_service = get_embedding_service()
    vector_service = get_vector_service()

    # Generate query embedding
    query_embedding = await embedding_service.get_embedding(request.query)

    # Search vector database
    results = await vector_service.search(
        query_vector=query_embedding,
        limit=request.limit,
        chapter=request.chapter,
        locale="en",  # Default to English for search
    )

    search_results = [
        SearchResult(
            chapter=r["chapter"],
            section=r["section"],
            content=r["content"],
            score=r["score"],
            url=r.get("url"),
        )
        for r in results
    ]

    return SearchResponse(results=search_results, query=request.query)


@router.get("", response_model=SearchResponse)
async def search_get(
    q: str = Query(..., min_length=1, max_length=1000, description="Search query"),
    chapter: Optional[str] = Query(None, description="Filter by chapter"),
    limit: int = Query(5, ge=1, le=20, description="Number of results"),
    user: dict = Depends(firebase_auth_optional),
):
    """Perform semantic search via GET request."""
    request = SearchRequest(query=q, chapter=chapter, limit=limit)
    return await semantic_search(request, user)
