# Task: T3-002 - Chat database models
# From: specs/phase3-ai-chatbot/plan.md §2.1, specs/phase3-ai-chatbot/spec.md §7
"""
Chat database models for AI chatbot conversations.
"""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlmodel import Field, SQLModel


class Conversation(SQLModel, table=True):
    """
    Conversation model.

    Represents a chat conversation belonging to a user.
    """

    __tablename__ = "conversations"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(index=True, description="Owner's user ID")
    title: Optional[str] = Field(default="New Conversation", max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ChatMessage(SQLModel, table=True):
    """
    Chat message model.

    Represents a single message in a conversation.
    """

    __tablename__ = "chat_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: str = Field(index=True, description="Parent conversation ID")
    user_id: str = Field(index=True, description="Owner's user ID")
    role: str = Field(description="Message role: 'user' or 'assistant'")
    content: str = Field(description="Message content")
    actions: Optional[str] = Field(
        default=None, description="JSON string of actions performed by assistant"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
