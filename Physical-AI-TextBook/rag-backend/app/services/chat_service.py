"""Chat service for RAG-powered conversations using Google Gemini."""

from typing import AsyncGenerator, List, Optional

import google.generativeai as genai

from app.config import get_settings
from app.models.schemas import SourceReference
from app.services.embedding_service import get_embedding_service
from app.services.vector_service import get_vector_service

SYSTEM_PROMPT = """You are a helpful AI assistant for the Physical AI Textbook. Your role is to help students learn about robotics, ROS2, simulation, Isaac Sim, VLA models, and humanoid robotics.

Guidelines:
- Answer questions based on the provided context from the textbook
- If the context doesn't contain relevant information, say so honestly
- Be educational and explain concepts clearly
- Use examples when helpful
- If asked about code, provide clear explanations and examples
- Keep responses concise but thorough
- Reference specific chapters or sections when relevant

Context from the textbook:
{context}

{selected_text_section}"""

SELECTED_TEXT_TEMPLATE = """
The user has highlighted the following text and is asking about it:
---
{selected_text}
---
"""


class ChatService:
    """Service for RAG-powered chat conversations using Gemini."""

    def __init__(self):
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)
        self.model_name = settings.chat_model
        self.max_context_chunks = settings.max_context_chunks
        self.embedding_service = get_embedding_service()
        self.vector_service = get_vector_service()

    async def get_relevant_context(
        self, query: str, chapter: Optional[str] = None, locale: str = "en"
    ) -> tuple[str, List[SourceReference]]:
        """Retrieve relevant context from vector database."""
        # Get query embedding
        query_embedding = await self.embedding_service.get_embedding(query)

        # Search for relevant chunks
        results = await self.vector_service.search(
            query_vector=query_embedding,
            limit=self.max_context_chunks,
            chapter=chapter,
            locale=locale,
        )

        if not results:
            return "", []

        # Build context string
        context_parts = []
        sources = []

        for i, result in enumerate(results, 1):
            context_parts.append(f"[{i}] {result['content']}")
            sources.append(
                SourceReference(
                    chapter=result["chapter"],
                    section=result["section"],
                    content=result["content"][:200] + "..."
                    if len(result["content"]) > 200
                    else result["content"],
                    score=result["score"],
                    url=result.get("url"),
                )
            )

        context = "\n\n".join(context_parts)
        return context, sources

    def _build_chat_history(self, history: List[dict]) -> List[dict]:
        """Convert history to Gemini format."""
        gemini_history = []
        for msg in history[-10:]:
            role = "user" if msg["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg["content"]]})
        return gemini_history

    async def generate_response(
        self,
        message: str,
        history: List[dict],
        selected_text: Optional[str] = None,
        page_context: Optional[str] = None,
        locale: str = "en",
    ) -> tuple[str, List[SourceReference]]:
        """Generate a RAG response for a chat message."""
        # Get relevant context
        context, sources = await self.get_relevant_context(
            query=message, chapter=page_context, locale=locale
        )

        # Build selected text section if provided
        selected_text_section = ""
        if selected_text:
            selected_text_section = SELECTED_TEXT_TEMPLATE.format(
                selected_text=selected_text
            )

        # Build system prompt with context
        system_instruction = SYSTEM_PROMPT.format(
            context=context
            if context
            else "No relevant context found in the textbook.",
            selected_text_section=selected_text_section,
        )

        # Create model with system instruction
        model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_instruction,
        )

        # Build chat history
        gemini_history = self._build_chat_history(history)

        # Start chat with history
        chat = model.start_chat(history=gemini_history)

        # Generate response
        response = chat.send_message(message)

        return response.text, sources

    async def generate_response_stream(
        self,
        message: str,
        history: List[dict],
        selected_text: Optional[str] = None,
        page_context: Optional[str] = None,
        locale: str = "en",
    ) -> AsyncGenerator[tuple[str, Optional[List[SourceReference]]], None]:
        """Generate a streaming RAG response."""
        # Get relevant context
        context, sources = await self.get_relevant_context(
            query=message, chapter=page_context, locale=locale
        )

        # Yield sources first
        yield ("sources", sources)

        # Build selected text section if provided
        selected_text_section = ""
        if selected_text:
            selected_text_section = SELECTED_TEXT_TEMPLATE.format(
                selected_text=selected_text
            )

        # Build system prompt with context
        system_instruction = SYSTEM_PROMPT.format(
            context=context
            if context
            else "No relevant context found in the textbook.",
            selected_text_section=selected_text_section,
        )

        # Create model with system instruction
        model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_instruction,
        )

        # Build chat history
        gemini_history = self._build_chat_history(history)

        # Start chat with history
        chat = model.start_chat(history=gemini_history)

        # Generate streaming response
        response = chat.send_message(message, stream=True)

        for chunk in response:
            if chunk.text:
                yield ("content", chunk.text)

        yield ("done", None)


# Singleton instance
_chat_service: Optional[ChatService] = None


def get_chat_service() -> ChatService:
    """Get the chat service singleton."""
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service
