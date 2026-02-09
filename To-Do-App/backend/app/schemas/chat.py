# Task: T3-005 - Pydantic schemas for Chat
# From: specs/phase3-ai-chatbot/plan.md §2.4
"""
Pydantic schemas for Chat API request/response validation.
"""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Schema for sending a chat message."""

    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = Field(None)


class ActionResult(BaseModel):
    """Schema for a single action performed by the AI."""

    type: str
    task: Optional[dict] = None
    task_id: Optional[int] = None
    tasks: Optional[list] = None
    total: Optional[int] = None
    completed: Optional[int] = None
    message: Optional[str] = None


class ChatResponse(BaseModel):
    """Schema for chat response."""

    message: str
    actions: list[ActionResult] = Field(default_factory=list)
    conversation_id: str


class ChatMessageResponse(BaseModel):
    """Schema for a single chat message in history."""

    id: int
    role: str
    content: str
    actions: Optional[list[Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    """Schema for conversation metadata."""

    id: str
    title: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    """Schema for list of conversations."""

    conversations: list[ConversationResponse]
    total: int


class ConversationMessagesResponse(BaseModel):
    """Schema for conversation messages history."""

    conversation_id: str
    messages: list[ChatMessageResponse]
