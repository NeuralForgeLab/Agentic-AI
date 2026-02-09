# Phase III Implementation Plan: AI-Powered Todo Chatbot

**Phase**: III - AI-Powered Todo Chatbot  
**Status**: Planning  
**Created**: 2026-01-19

---

## 1. Architecture Overview

### 1.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                     │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Traditional UI  │  │  Chat Interface  │                │
│  │  (Existing)      │  │  (New)           │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                            │
└───────────┼─────────────────────┼────────────────────────────┘
            │                     │
            │  REST API          │  Chat API
            │                     │
┌───────────┼─────────────────────┼────────────────────────────┐
│           ▼                     ▼                            │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Task Routes     │  │  Chat Routes     │                │
│  │  (Existing)      │  │  (New)           │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                            │
│           │                     ▼                            │
│           │            ┌──────────────────┐                 │
│           │            │  Gemini Service  │                 │
│           │            │  (New)           │                 │
│           │            └────────┬─────────┘                 │
│           │                     │                            │
│           │                     ▼                            │
│           │            ┌──────────────────┐                 │
│           │            │  Function Router │                 │
│           │            │  (New)           │                 │
│           │            └────────┬─────────┘                 │
│           │                     │                            │
│           ▼                     ▼                            │
│  ┌──────────────────────────────────────┐                  │
│  │      Task Service (Existing)         │                  │
│  └────────────────┬─────────────────────┘                  │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────┐                  │
│  │    PostgreSQL Database (Neon)        │                  │
│  │  - tasks (existing)                  │                  │
│  │  - users (existing)                  │                  │
│  │  - chat_messages (new)               │                  │
│  │  - conversations (new)               │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
│                   Backend (FastAPI)                         │
└──────────────────────────────────────────────────────────────┘
                          │
                          │  API Calls
                          ▼
               ┌──────────────────────┐
               │  Google Gemini API   │
               │  (gemini-1.5-flash)  │
               └──────────────────────┘
```

### 1.2 Technology Stack Additions

| Component | Technology | Purpose |
|-----------|------------|---------|
| AI Model | Google Gemini 1.5 Flash | Natural language understanding |
| Python SDK | google-generativeai | Gemini API integration |
| Function Calling | Gemini Native | Task operations via AI |
| Context Management | In-memory + DB | Conversation history |

---

## 2. Backend Implementation

### 2.1 New Database Models

**File**: `backend/app/models/chat.py`

```python
from datetime import datetime
from typing import Optional
from uuid import uuid4
from sqlmodel import Field, SQLModel


class ChatMessage(SQLModel, table=True):
    """Individual chat message in a conversation."""
    __tablename__ = "chat_messages"
    
    id: int = Field(default=None, primary_key=True)
    conversation_id: str = Field(index=True)
    user_id: str = Field(index=True)
    role: str  # "user" or "assistant"
    content: str
    actions: Optional[str] = None  # JSON string of actions taken
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Conversation(SQLModel, table=True):
    """Conversation thread between user and AI."""
    __tablename__ = "conversations"
    
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    title: Optional[str] = Field(default="New Conversation")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### 2.2 Gemini Service

**File**: `backend/app/services/gemini_service.py`

```python
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from ..config import get_settings

settings = get_settings()


class GeminiService:
    """Service for interacting with Google Gemini API."""
    
    def __init__(self):
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            system_instruction=self._get_system_prompt()
        )
        self._setup_functions()
    
    def _get_system_prompt(self) -> str:
        """Return the system prompt for the AI assistant."""
        return """You are a helpful AI assistant for a Todo application.
        
Your role is to help users manage their tasks through natural language.

You have access to these functions:
- create_task: Create a new task
- list_tasks: View tasks  
- update_task: Modify tasks
- delete_task: Remove tasks
- toggle_task: Mark complete/incomplete

Guidelines:
1. Be concise and friendly
2. Confirm destructive actions
3. Ask for clarification if unclear
4. Extract task details from natural language
5. Provide helpful suggestions

Always respond naturally and conversationally."""
    
    def _setup_functions(self):
        """Define function schemas for Gemini function calling."""
        self.functions = [
            {
                "name": "create_task",
                "description": "Create a new task for the user",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "The task title"
                        },
                        "description": {
                            "type": "string",
                            "description": "Optional task description"
                        }
                    },
                    "required": ["title"]
                }
            },
            {
                "name": "list_tasks",
                "description": "List user's tasks",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "status": {
                            "type": "string",
                            "enum": ["all", "active", "completed"],
                            "description": "Filter tasks by status"
                        }
                    }
                }
            },
            {
                "name": "update_task",
                "description": "Update an existing task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "integer",
                            "description": "The task ID to update"
                        },
                        "title": {
                            "type": "string",
                            "description": "New title"
                        },
                        "description": {
                            "type": "string",
                            "description": "New description"
                        }
                    },
                    "required": ["task_id"]
                }
            },
            {
                "name": "delete_task",
                "description": "Delete a task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "integer",
                            "description": "The task ID to delete"
                        }
                    },
                    "required": ["task_id"]
                }
            },
            {
                "name": "toggle_task",
                "description": "Toggle task completion status",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "integer",
                            "description": "The task ID to toggle"
                        }
                    },
                    "required": ["task_id"]
                }
            }
        ]
    
    async def process_message(
        self,
        message: str,
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Process user message and return AI response with actions.
        
        Args:
            message: User's message
            conversation_history: Previous messages
        
        Returns:
            Dict with 'response' and 'function_calls'
        """
        # Build conversation context
        chat = self.model.start_chat(history=conversation_history)
        
        # Send message with function calling enabled
        response = chat.send_message(
            message,
            tools=self.functions
        )
        
        # Parse response
        result = {
            "response": response.text if response.text else "",
            "function_calls": []
        }
        
        # Extract function calls if any
        if response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'function_call'):
                    result["function_calls"].append({
                        "name": part.function_call.name,
                        "args": dict(part.function_call.args)
                    })
        
        return result
```

### 2.3 Function Router

**File**: `backend/app/services/function_router.py`

```python
from typing import Dict, Any, List
from sqlmodel import Session
from ..models import Task
from ..schemas import TaskCreate, TaskUpdate


class FunctionRouter:
    """Routes AI function calls to actual task operations."""
    
    def __init__(self, session: Session, user_id: str):
        self.session = session
        self.user_id = user_id
    
    async def execute(
        self,
        function_name: str,
        arguments: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a function call and return result."""
        
        handlers = {
            "create_task": self._create_task,
            "list_tasks": self._list_tasks,
            "update_task": self._update_task,
            "delete_task": self._delete_task,
            "toggle_task": self._toggle_task
        }
        
        handler = handlers.get(function_name)
        if not handler:
            return {"error": f"Unknown function: {function_name}"}
        
        return await handler(**arguments)
    
    async def _create_task(
        self,
        title: str,
        description: str = ""
    ) -> Dict[str, Any]:
        """Create a new task."""
        task = Task(
            user_id=self.user_id,
            title=title,
            description=description
        )
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        
        return {
            "type": "task_created",
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed
            }
        }
    
    async def _list_tasks(
        self,
        status: str = "all"
    ) -> Dict[str, Any]:
        """List tasks with optional filter."""
        from sqlmodel import select
        
        query = select(Task).where(Task.user_id == self.user_id)
        
        if status == "active":
            query = query.where(Task.completed == False)
        elif status == "completed":
            query = query.where(Task.completed == True)
        
        tasks = self.session.exec(query).all()
        
        return {
            "type": "tasks_listed",
            "tasks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "description": t.description,
                    "completed": t.completed
                }
                for t in tasks
            ],
            "count": len(tasks)
        }
    
    async def _update_task(
        self,
        task_id: int,
        title: str = None,
        description: str = None
    ) -> Dict[str, Any]:
        """Update a task."""
        task = self.session.get(Task, task_id)
        
        if not task or task.user_id != self.user_id:
            return {"error": "Task not found"}
        
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        
        self.session.commit()
        self.session.refresh(task)
        
        return {
            "type": "task_updated",
            "task": {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed
            }
        }
    
    async def _delete_task(self, task_id: int) -> Dict[str, Any]:
        """Delete a task."""
        task = self.session.get(Task, task_id)
        
        if not task or task.user_id != self.user_id:
            return {"error": "Task not found"}
        
        self.session.delete(task)
        self.session.commit()
        
        return {
            "type": "task_deleted",
            "task_id": task_id
        }
    
    async def _toggle_task(self, task_id: int) -> Dict[str, Any]:
        """Toggle task completion."""
        task = self.session.get(Task, task_id)
        
        if not task or task.user_id != self.user_id:
            return {"error": "Task not found"}
        
        task.completed = not task.completed
        self.session.commit()
        self.session.refresh(task)
        
        return {
            "type": "task_toggled",
            "task": {
                "id": task.id,
                "title": task.title,
                "completed": task.completed
            }
        }
```

### 2.4 Chat API Routes

**File**: `backend/app/routes/chat.py`

```python
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel

from ..auth import verify_token, verify_user_access
from ..database import get_session
from ..models.chat import ChatMessage, Conversation
from ..services.gemini_service import GeminiService
from ..services.function_router import FunctionRouter

router = APIRouter(prefix="/users/{user_id}/chat", tags=["chat"])
gemini_service = GeminiService()


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    actions: List[dict]
    conversation_id: str


@router.post("", response_model=ChatResponse)
async def send_message(
    user_id: str,
    request: ChatRequest,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """
    Process a chat message and return AI response.
    """
    verify_user_access(token_user_id, user_id)
    
    # Get or create conversation
    conversation_id = request.conversation_id
    if not conversation_id:
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        conversation_id = conversation.id
    
    # Save user message
    user_msg = ChatMessage(
        conversation_id=conversation_id,
        user_id=user_id,
        role="user",
        content=request.message
    )
    session.add(user_msg)
    session.commit()
    
    # Get conversation history
    history_query = select(ChatMessage).where(
        ChatMessage.conversation_id == conversation_id
    ).order_by(ChatMessage.created_at)
    history = session.exec(history_query).all()
    
    # Convert to Gemini format
    gemini_history = [
        {
            "role": msg.role,
            "parts": [msg.content]
        }
        for msg in history[:-1]  # Exclude the just-added message
    ]
    
    # Process with Gemini
    ai_result = await gemini_service.process_message(
        request.message,
        gemini_history
    )
    
    # Execute function calls if any
    function_router = FunctionRouter(session, user_id)
    actions = []
    
    for func_call in ai_result.get("function_calls", []):
        result = await function_router.execute(
            func_call["name"],
            func_call["args"]
        )
        actions.append(result)
    
    # Save assistant response
    assistant_msg = ChatMessage(
        conversation_id=conversation_id,
        user_id=user_id,
        role="assistant",
        content=ai_result["response"],
        actions=str(actions) if actions else None
    )
    session.add(assistant_msg)
    session.commit()
    
    return ChatResponse(
        message=ai_result["response"],
        actions=actions,
        conversation_id=conversation_id
    )


@router.get("/conversations", response_model=List[Conversation])
async def list_conversations(
    user_id: str,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """List all conversations for a user."""
    verify_user_access(token_user_id, user_id)
    
    query = select(Conversation).where(
        Conversation.user_id == user_id
    ).order_by(Conversation.updated_at.desc())
    
    conversations = session.exec(query).all()
    return conversations


@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    user_id: str,
    conversation_id: str,
    token_user_id: Annotated[str, Depends(verify_token)],
    session: Annotated[Session, Depends(get_session)],
):
    """Get all messages in a conversation."""
    verify_user_access(token_user_id, user_id)
    
    query = select(ChatMessage).where(
        ChatMessage.conversation_id == conversation_id,
        ChatMessage.user_id == user_id
    ).order_by(ChatMessage.created_at)
    
    messages = session.exec(query).all()
    return messages
```

### 2.5 Configuration Updates

**File**: `backend/app/config.py` (additions)

```python
class Settings(BaseSettings):
    # ... existing settings ...
    
    # Gemini AI Configuration
    gemini_api_key: str = Field(..., env="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-1.5-flash", env="GEMINI_MODEL")
    gemini_max_tokens: int = Field(default=1024, env="GEMINI_MAX_TOKENS")
    gemini_temperature: float = Field(default=0.7, env="GEMINI_TEMPERATURE")
```

**File**: `backend/.env.example` (additions)

```bash
# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=1024
GEMINI_TEMPERATURE=0.7
```

### 2.6 Requirements Updates

**File**: `backend/requirements.txt` (additions)

```
google-generativeai==0.3.2
```

---

## 3. Frontend Implementation

### 3.1 Chat Interface Component

**File**: `frontend/components/ChatInterface.tsx`

```typescript
"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface Message {
  role: "user" | "assistant";
  content: string;
  actions?: any[];
}

interface ChatInterfaceProps {
  userId: string;
  token: string;
}

export default function ChatInterface({ userId, token }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message,
            conversation_id: conversationId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      // Set conversation ID if new
      if (!conversationId) {
        setConversationId(data.conversation_id);
      }

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          actions: data.actions,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <p className="text-sm text-gray-500">
          Ask me to manage your tasks naturally
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p>👋 Hi! I can help you manage your tasks.</p>
            <p className="text-sm mt-2">Try saying:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>"Add a task to buy groceries"</li>
              <li>"Show me my tasks"</li>
              <li>"Mark task #1 as complete"</li>
            </ul>
          </div>
        )}

        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-bounce">●</div>
            <div className="animate-bounce delay-100">●</div>
            <div className="animate-bounce delay-200">●</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}
```

### 3.2 Chat Message Component

**File**: `frontend/components/ChatMessage.tsx`

```typescript
interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
    actions?: any[];
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Show actions if any */}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-300 space-y-1">
            {message.actions.map((action, idx) => (
              <div key={idx} className="text-xs opacity-75">
                {action.type === "task_created" && (
                  <span>✅ Created: {action.task.title}</span>
                )}
                {action.type === "task_updated" && (
                  <span>📝 Updated: {action.task.title}</span>
                )}
                {action.type === "task_deleted" && (
                  <span>🗑️ Deleted task #{action.task_id}</span>
                )}
                {action.type === "task_toggled" && (
                  <span>
                    {action.task.completed ? "✅" : "⬜"} Toggled:{" "}
                    {action.task.title}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3.3 Chat Input Component

**File**: `frontend/components/ChatInput.tsx`

```typescript
import { useState, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

### 3.4 Dashboard Integration

**File**: `frontend/app/dashboard/page.tsx` (modifications)

Add chat interface to the dashboard:

```typescript
import ChatInterface from "@/components/ChatInterface";

// ... existing code ...

return (
  <div className="min-h-screen bg-gray-50">
    {/* ... existing header ... */}

    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Traditional Task Management */}
        <div>
          <TaskForm onSubmit={handleCreateTask} />
          <TaskList
            tasks={tasks}
            total={total}
            completed={completed}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </div>

        {/* Right: AI Chat Interface */}
        <div>
          <ChatInterface userId={session.user.id} token={token} />
        </div>
      </div>
    </main>
  </div>
);
```

---

## 4. Database Migration

### 4.1 Migration Script

**File**: `backend/migrations/003_add_chat_tables.py`

```python
"""Add chat tables for AI assistant."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

def upgrade():
    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_conversations_user_id', 'conversations', ['user_id'])
    
    # Create chat_messages table
    op.create_table(
        'chat_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('conversation_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('actions', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_chat_messages_conversation', 'chat_messages', ['conversation_id'])
    op.create_index('idx_chat_messages_user_id', 'chat_messages', ['user_id'])


def downgrade():
    op.drop_table('chat_messages')
    op.drop_table('conversations')
```

---

## 5. Testing Strategy

### 5.1 Unit Tests

**Test Gemini Service**:
- API initialization
- Message processing
- Function call parsing
- Error handling

**Test Function Router**:
- Each function execution
- Error cases
- User isolation

### 5.2 Integration Tests

**Test Chat Flow**:
- Send message → receive response
- Function calls → task operations
- Conversation history

### 5.3 E2E Tests

**User Scenarios**:
1. Create task via chat
2. List tasks via chat
3. Update task via chat
4. Delete task via chat
5. Multi-turn conversation

---

## 6. Deployment Considerations

### 6.1 Environment Variables

Ensure these are set in production:
- `GEMINI_API_KEY` - From Google AI Studio
- `GEMINI_MODEL` - Model name
- All existing Phase II variables

### 6.2 Rate Limiting

Implement rate limiting on chat endpoint:
- Per user: 60 requests/minute
- Per IP: 100 requests/minute

### 6.3 Cost Management

Monitor Gemini API usage:
- Track tokens per request
- Set monthly budget alerts
- Implement usage caps per user

---

## 7. Success Metrics

### 7.1 Technical Metrics
- API response time < 3s
- Function call success rate > 95%
- Error rate < 5%

### 7.2 User Metrics
- Chat adoption rate
- Messages per user
- Task operations via chat vs UI

---

**References**:
- Gemini SDK: https://github.com/google/generative-ai-python
- Function Calling: https://ai.google.dev/docs/function_calling
- Phase III Spec: `specs/phase3-ai-chatbot/spec.md`
