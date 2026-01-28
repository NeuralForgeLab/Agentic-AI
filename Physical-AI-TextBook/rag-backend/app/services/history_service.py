"""History service for managing chat sessions and messages."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from app.models.database import ChatSession, ChatMessage, get_db_session
from app.models.schemas import (
    SourceReference,
    SessionResponse,
    MessageResponse,
)


class HistoryService:
    """Service for managing chat history in the database."""

    async def create_session(
        self, user_id: str, title: Optional[str] = None
    ) -> ChatSession:
        """Create a new chat session."""
        async with get_db_session() as session:
            chat_session = ChatSession(user_id=user_id, title=title or "New Chat")
            session.add(chat_session)
            await session.flush()
            await session.refresh(chat_session)
            return chat_session

    async def get_session(self, session_id: str, user_id: str) -> Optional[ChatSession]:
        """Get a session by ID for a specific user."""
        async with get_db_session() as session:
            result = await session.execute(
                select(ChatSession)
                .where(ChatSession.id == UUID(session_id))
                .where(ChatSession.user_id == user_id)
            )
            return result.scalar_one_or_none()

    async def list_sessions(
        self, user_id: str, limit: int = 20, offset: int = 0
    ) -> tuple[List[SessionResponse], int]:
        """List all sessions for a user."""
        async with get_db_session() as session:
            # Get total count
            count_result = await session.execute(
                select(func.count(ChatSession.id)).where(ChatSession.user_id == user_id)
            )
            total = count_result.scalar()

            # Get sessions with message count
            result = await session.execute(
                select(ChatSession, func.count(ChatMessage.id).label("message_count"))
                .outerjoin(ChatMessage)
                .where(ChatSession.user_id == user_id)
                .group_by(ChatSession.id)
                .order_by(desc(ChatSession.updated_at))
                .limit(limit)
                .offset(offset)
            )

            sessions = []
            for row in result:
                chat_session = row[0]
                message_count = row[1]
                sessions.append(
                    SessionResponse(
                        id=str(chat_session.id),
                        title=chat_session.title,
                        created_at=chat_session.created_at,
                        updated_at=chat_session.updated_at,
                        message_count=message_count,
                    )
                )

            return sessions, total

    async def delete_session(self, session_id: str, user_id: str) -> bool:
        """Delete a session and all its messages."""
        async with get_db_session() as session:
            result = await session.execute(
                select(ChatSession)
                .where(ChatSession.id == UUID(session_id))
                .where(ChatSession.user_id == user_id)
            )
            chat_session = result.scalar_one_or_none()

            if chat_session:
                await session.delete(chat_session)
                return True
            return False

    async def update_session_title(
        self, session_id: str, user_id: str, title: str
    ) -> bool:
        """Update a session's title."""
        async with get_db_session() as session:
            result = await session.execute(
                select(ChatSession)
                .where(ChatSession.id == UUID(session_id))
                .where(ChatSession.user_id == user_id)
            )
            chat_session = result.scalar_one_or_none()

            if chat_session:
                chat_session.title = title
                chat_session.updated_at = datetime.utcnow()
                return True
            return False

    async def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        sources: Optional[List[SourceReference]] = None,
        selected_text: Optional[str] = None,
        page_context: Optional[str] = None,
    ) -> ChatMessage:
        """Add a message to a session."""
        async with get_db_session() as session:
            # Update session's updated_at
            result = await session.execute(
                select(ChatSession).where(ChatSession.id == UUID(session_id))
            )
            chat_session = result.scalar_one_or_none()
            if chat_session:
                chat_session.updated_at = datetime.utcnow()

            # Create message
            sources_json = None
            if sources:
                sources_json = [s.model_dump() for s in sources]

            message = ChatMessage(
                session_id=UUID(session_id),
                role=role,
                content=content,
                sources=sources_json,
                selected_text=selected_text,
                page_context=page_context,
            )
            session.add(message)
            await session.flush()
            await session.refresh(message)
            return message

    async def get_session_messages(
        self, session_id: str, user_id: str
    ) -> List[MessageResponse]:
        """Get all messages for a session."""
        async with get_db_session() as session:
            # Verify session belongs to user
            session_result = await session.execute(
                select(ChatSession)
                .where(ChatSession.id == UUID(session_id))
                .where(ChatSession.user_id == user_id)
            )
            if not session_result.scalar_one_or_none():
                return []

            # Get messages
            result = await session.execute(
                select(ChatMessage)
                .where(ChatMessage.session_id == UUID(session_id))
                .order_by(ChatMessage.created_at)
            )

            messages = []
            for msg in result.scalars():
                sources = []
                if msg.sources:
                    sources = [SourceReference(**s) for s in msg.sources]

                messages.append(
                    MessageResponse(
                        id=str(msg.id),
                        role=msg.role,
                        content=msg.content,
                        sources=sources,
                        selected_text=msg.selected_text,
                        page_context=msg.page_context,
                        created_at=msg.created_at,
                    )
                )

            return messages

    async def get_session_history_for_chat(self, session_id: str) -> List[dict]:
        """Get message history in format suitable for chat completion."""
        async with get_db_session() as session:
            result = await session.execute(
                select(ChatMessage)
                .where(ChatMessage.session_id == UUID(session_id))
                .order_by(ChatMessage.created_at)
            )

            return [
                {"role": msg.role, "content": msg.content} for msg in result.scalars()
            ]


# Singleton instance
_history_service: Optional[HistoryService] = None


def get_history_service() -> HistoryService:
    """Get the history service singleton."""
    global _history_service
    if _history_service is None:
        _history_service = HistoryService()
    return _history_service
