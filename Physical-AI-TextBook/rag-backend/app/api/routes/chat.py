"""Chat API routes."""

import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse

from app.models.schemas import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatStreamChunk,
    SourceReference,
)
from app.services.auth_service import firebase_auth
from app.services.chat_service import get_chat_service
from app.services.history_service import get_history_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/simple")
async def simple_chat(request: ChatMessageRequest):
    """Simple chat endpoint without history/database - for testing."""
    chat_service = get_chat_service()

    # Determine locale
    locale = "ur" if request.page_context and "/ur/" in request.page_context else "en"
    if request.locale:
        locale = request.locale

    # Generate RAG response without history
    response_content, sources = await chat_service.generate_response(
        message=request.message,
        history=[],
        selected_text=request.selected_text,
        page_context=request.page_context,
        locale=locale,
    )

    return {
        "content": response_content,
        "sources": sources,
    }


@router.post("", response_model=ChatMessageResponse)
async def send_message(
    request: ChatMessageRequest, user: dict = Depends(firebase_auth)
):
    """Send a chat message and get a RAG response."""
    chat_service = get_chat_service()
    history_service = get_history_service()

    user_id = user["uid"]

    # Get or create session
    if request.session_id:
        session = await history_service.get_session(request.session_id, user_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        session_id = request.session_id
    else:
        # Create new session with first message as title
        title = (
            request.message[:50] + "..."
            if len(request.message) > 50
            else request.message
        )
        session = await history_service.create_session(user_id, title)
        session_id = str(session.id)

    # Get conversation history
    history = await history_service.get_session_history_for_chat(session_id)

    # Determine locale from page context
    locale = "ur" if request.page_context and "/ur/" in request.page_context else "en"

    # Save user message
    user_message = await history_service.add_message(
        session_id=session_id,
        role="user",
        content=request.message,
        selected_text=request.selected_text,
        page_context=request.page_context,
    )

    # Generate RAG response
    response_content, sources = await chat_service.generate_response(
        message=request.message,
        history=history,
        selected_text=request.selected_text,
        page_context=request.page_context,
        locale=locale,
    )

    # Save assistant message
    assistant_message = await history_service.add_message(
        session_id=session_id,
        role="assistant",
        content=response_content,
        sources=sources,
    )

    return ChatMessageResponse(
        id=str(assistant_message.id),
        session_id=session_id,
        role="assistant",
        content=response_content,
        sources=sources,
        created_at=assistant_message.created_at,
    )


@router.post("/stream")
async def send_message_stream(
    request: ChatMessageRequest, user: dict = Depends(firebase_auth)
):
    """Send a chat message and get a streaming RAG response."""
    chat_service = get_chat_service()
    history_service = get_history_service()

    user_id = user["uid"]

    # Get or create session
    if request.session_id:
        session = await history_service.get_session(request.session_id, user_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        session_id = request.session_id
    else:
        title = (
            request.message[:50] + "..."
            if len(request.message) > 50
            else request.message
        )
        session = await history_service.create_session(user_id, title)
        session_id = str(session.id)

    # Get conversation history
    history = await history_service.get_session_history_for_chat(session_id)

    # Determine locale
    locale = "ur" if request.page_context and "/ur/" in request.page_context else "en"

    # Save user message
    await history_service.add_message(
        session_id=session_id,
        role="user",
        content=request.message,
        selected_text=request.selected_text,
        page_context=request.page_context,
    )

    async def event_generator():
        full_content = ""
        sources = []

        try:
            async for chunk_type, chunk_data in chat_service.generate_response_stream(
                message=request.message,
                history=history,
                selected_text=request.selected_text,
                page_context=request.page_context,
                locale=locale,
            ):
                if chunk_type == "sources":
                    sources = chunk_data
                    yield {
                        "event": "sources",
                        "data": json.dumps(
                            {
                                "sources": [s.model_dump() for s in sources],
                                "session_id": session_id,
                            }
                        ),
                    }
                elif chunk_type == "content":
                    full_content += chunk_data
                    yield {
                        "event": "content",
                        "data": json.dumps({"content": chunk_data}),
                    }
                elif chunk_type == "done":
                    # Save the complete assistant message
                    message = await history_service.add_message(
                        session_id=session_id,
                        role="assistant",
                        content=full_content,
                        sources=sources,
                    )
                    yield {
                        "event": "done",
                        "data": json.dumps(
                            {"message_id": str(message.id), "session_id": session_id}
                        ),
                    }
        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())
