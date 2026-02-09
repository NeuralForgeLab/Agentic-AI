# Task: T3-005 - Chat API routes
# From: specs/phase3-ai-chatbot/plan.md §2.4, specs/phase3-ai-chatbot/spec.md §3
"""
Chat API routes with JWT authentication for AI chatbot.
"""

import json
from datetime import datetime
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..auth import verify_token, verify_user_access
from ..config import get_settings
from ..database import get_session
from ..models import ChatMessage, Conversation
from ..schemas import (
    ActionResult,
    ChatMessageResponse,
    ChatRequest,
    ChatResponse,
    ConversationListResponse,
    ConversationMessagesResponse,
    ConversationResponse,
)
from ..services import FunctionRouter, GeminiService

router = APIRouter(prefix="/users/{user_id}/chat", tags=["chat"])


def get_gemini_service() -> GeminiService:
    """Get Gemini service instance."""
    settings = get_settings()
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI chat service not configured. Please set GEMINI_API_KEY.",
        )
    return GeminiService()


@router.post("", response_model=ChatResponse)
async def send_message(
    user_id: str,
    chat_request: ChatRequest,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """
    Send a message to the AI chatbot and get a response.

    The AI can perform task operations via function calling.
    """
    verify_user_access(token_user_id, user_id)

    # Get or create conversation
    conversation_id = chat_request.conversation_id
    if conversation_id:
        conversation = session.get(Conversation, conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )
        if conversation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Conversation belongs to another user",
            )
    else:
        # Create new conversation
        conversation = Conversation(
            user_id=user_id,
            title=chat_request.message[:50]
            + ("..." if len(chat_request.message) > 50 else ""),
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        conversation_id = conversation.id

    # Get conversation history
    statement = (
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at)
    )
    history_messages = session.exec(statement).all()

    # Convert to format for Gemini
    conversation_history = [
        {"role": msg.role, "content": msg.content} for msg in history_messages
    ]

    # Initialize Gemini service
    gemini_service = get_gemini_service()

    # Process message with Gemini
    ai_response = gemini_service.process_message(
        user_message=chat_request.message,
        conversation_history=conversation_history,
    )

    # Execute any function calls
    actions = []
    if ai_response["function_calls"]:
        function_router = FunctionRouter(session, user_id)

        for fc in ai_response["function_calls"]:
            result = function_router.execute(fc["name"], fc["args"])
            actions.append(ActionResult(**result))

        # Generate summary response after function execution
        function_results = [action.model_dump() for action in actions]
        response_text = gemini_service.generate_response_with_results(
            user_message=chat_request.message,
            function_results=function_results,
            conversation_history=conversation_history,
        )
    else:
        response_text = ai_response["text"]

    # Save user message
    user_message = ChatMessage(
        conversation_id=conversation_id,
        user_id=user_id,
        role="user",
        content=chat_request.message,
    )
    session.add(user_message)

    # Save assistant message
    assistant_message = ChatMessage(
        conversation_id=conversation_id,
        user_id=user_id,
        role="assistant",
        content=response_text,
        actions=json.dumps([a.model_dump() for a in actions]) if actions else None,
    )
    session.add(assistant_message)

    # Update conversation timestamp
    conversation.updated_at = datetime.utcnow()
    session.add(conversation)

    session.commit()

    return ChatResponse(
        message=response_text,
        actions=actions,
        conversation_id=conversation_id,
    )


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    user_id: str,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """
    List all conversations for a user.
    """
    verify_user_access(token_user_id, user_id)

    statement = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )
    conversations = session.exec(statement).all()

    return ConversationListResponse(
        conversations=[
            ConversationResponse.model_validate(conv) for conv in conversations
        ],
        total=len(conversations),
    )


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=ConversationMessagesResponse,
)
async def get_conversation_messages(
    user_id: str,
    conversation_id: str,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """
    Get all messages in a conversation.
    """
    verify_user_access(token_user_id, user_id)

    # Verify conversation exists and belongs to user
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    if conversation.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conversation belongs to another user",
        )

    # Get messages
    statement = (
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at)
    )
    messages = session.exec(statement).all()

    return ConversationMessagesResponse(
        conversation_id=conversation_id,
        messages=[
            ChatMessageResponse(
                id=msg.id,
                role=msg.role,
                content=msg.content,
                actions=json.loads(msg.actions) if msg.actions else None,
                created_at=msg.created_at,
            )
            for msg in messages
        ],
    )


@router.delete(
    "/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_conversation(
    user_id: str,
    conversation_id: str,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """
    Delete a conversation and all its messages.
    """
    verify_user_access(token_user_id, user_id)

    # Verify conversation exists and belongs to user
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    if conversation.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conversation belongs to another user",
        )

    # Delete all messages in conversation
    statement = select(ChatMessage).where(
        ChatMessage.conversation_id == conversation_id
    )
    messages = session.exec(statement).all()
    for msg in messages:
        session.delete(msg)

    # Delete conversation
    session.delete(conversation)
    session.commit()

    return None
