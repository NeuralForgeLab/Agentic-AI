"""Pydantic schemas for API request/response models."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# Chat Schemas
class ChatMessageRequest(BaseModel):
    """Request model for sending a chat message."""

    message: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[str] = None
    selected_text: Optional[str] = None
    page_context: Optional[str] = None
    locale: Optional[str] = "en"


class SourceReference(BaseModel):
    """A source reference from the RAG retrieval."""

    chapter: str
    section: str
    content: str
    score: float
    url: Optional[str] = None


class ChatMessageResponse(BaseModel):
    """Response model for a chat message."""

    id: str
    session_id: str
    role: str
    content: str
    sources: List[SourceReference] = []
    created_at: datetime


class ChatStreamChunk(BaseModel):
    """A streaming chunk from the chat response."""

    type: str  # "content", "sources", "done", "error"
    content: Optional[str] = None
    sources: Optional[List[SourceReference]] = None
    session_id: Optional[str] = None
    message_id: Optional[str] = None


# Session Schemas
class SessionCreate(BaseModel):
    """Request model for creating a new session."""

    title: Optional[str] = None


class SessionResponse(BaseModel):
    """Response model for a chat session."""

    id: str
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    message_count: int = 0


class SessionListResponse(BaseModel):
    """Response model for listing sessions."""

    sessions: List[SessionResponse]
    total: int


class MessageResponse(BaseModel):
    """Response model for a message in history."""

    id: str
    role: str
    content: str
    sources: List[SourceReference] = []
    selected_text: Optional[str] = None
    page_context: Optional[str] = None
    created_at: datetime


class SessionMessagesResponse(BaseModel):
    """Response model for session messages."""

    session_id: str
    messages: List[MessageResponse]


# Search Schemas
class SearchRequest(BaseModel):
    """Request model for semantic search."""

    query: str = Field(..., min_length=1, max_length=1000)
    chapter: Optional[str] = None
    limit: int = Field(default=5, ge=1, le=20)


class SearchResult(BaseModel):
    """A search result from vector search."""

    chapter: str
    section: str
    content: str
    score: float
    url: Optional[str] = None


class SearchResponse(BaseModel):
    """Response model for search results."""

    results: List[SearchResult]
    query: str


# Health Check
class HealthResponse(BaseModel):
    """Health check response."""

    """Health check response."""
    status: str
    version: str = "1.0.0"
