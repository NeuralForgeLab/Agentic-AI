"""History API routes for managing chat sessions."""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from app.models.schemas import (
    SessionResponse,
    SessionListResponse,
    SessionMessagesResponse,
    MessageResponse,
)
from app.services.history_service import get_history_service
from app.services.auth_service import firebase_auth

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/sessions", response_model=SessionListResponse)
async def list_sessions(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: dict = Depends(firebase_auth),
):
    """List all chat sessions for the authenticated user."""
    history_service = get_history_service()

    sessions, total = await history_service.list_sessions(
        user_id=user["uid"], limit=limit, offset=offset
    )

    return SessionListResponse(sessions=sessions, total=total)


@router.get("/sessions/{session_id}", response_model=SessionMessagesResponse)
async def get_session_messages(session_id: str, user: dict = Depends(firebase_auth)):
    """Get all messages for a specific session."""
    history_service = get_history_service()

    # Verify session exists and belongs to user
    session = await history_service.get_session(session_id, user["uid"])
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await history_service.get_session_messages(session_id, user["uid"])

    return SessionMessagesResponse(session_id=session_id, messages=messages)


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, user: dict = Depends(firebase_auth)):
    """Delete a chat session and all its messages."""
    history_service = get_history_service()

    deleted = await history_service.delete_session(session_id, user["uid"])

    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"status": "deleted", "session_id": session_id}


@router.patch("/sessions/{session_id}")
async def update_session(
    session_id: str,
    title: str = Query(..., min_length=1, max_length=255),
    user: dict = Depends(firebase_auth),
):
    """Update a session's title."""
    history_service = get_history_service()

    updated = await history_service.update_session_title(
        session_id=session_id, user_id=user["uid"], title=title
    )

    if not updated:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"status": "updated", "session_id": session_id, "title": title}
