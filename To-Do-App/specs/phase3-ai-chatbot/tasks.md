# Phase III Tasks: AI-Powered Todo Chatbot

## Task Overview

| Task ID | Description | Status | Dependencies |
|---------|-------------|--------|--------------|
| T3-001 | Install Gemini SDK and update requirements | pending | - |
| T3-002 | Create chat database models | pending | T3-001 |
| T3-003 | Implement Gemini service | pending | T3-001 |
| T3-004 | Implement function router | pending | T3-003 |
| T3-005 | Create chat API routes | pending | T3-004 |
| T3-006 | Update backend configuration for Gemini | pending | T3-001 |
| T3-007 | Create ChatInterface component | pending | T3-005 |
| T3-008 | Create ChatMessage component | pending | - |
| T3-009 | Create ChatInput component | pending | - |
| T3-010 | Integrate chat into dashboard | pending | T3-007, T3-008, T3-009 |
| T3-011 | Add database migration for chat tables | pending | T3-002 |
| T3-012 | Write tests for Gemini integration | pending | T3-005 |
| T3-013 | Update README for Phase III | pending | T3-010 |

---

## Detailed Tasks

### T3-001: Install Gemini SDK and Update Requirements
**From**: plan.md §2.6
**Priority**: High
**Estimate**: Small

**Description**: Add Google Generative AI SDK to backend dependencies.

**Preconditions**: Phase II completed

**Acceptance Criteria**:
- [ ] `google-generativeai==0.3.2` added to requirements.txt
- [ ] Package installs without errors
- [ ] Can import `google.generativeai` in Python

**Artifacts to Modify**:
- Update: `backend/requirements.txt`

**Commands**:
```bash
cd backend
pip install google-generativeai==0.3.2
pip freeze | grep google-generativeai >> requirements.txt
```

---

### T3-002: Create Chat Database Models
**From**: plan.md §2.1, spec.md §7
**Priority**: High
**Estimate**: Small

**Description**: Create SQLModel classes for chat messages and conversations.

**Preconditions**: T3-001 completed

**Acceptance Criteria**:
- [ ] ChatMessage model with all fields
- [ ] Conversation model with all fields
- [ ] Proper indexes on user_id and conversation_id
- [ ] Models importable from models package

**Artifacts to Modify**:
- Create: `backend/app/models/chat.py`
- Update: `backend/app/models/__init__.py`

**Code Reference**:
```python
class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"
    id: int = Field(default=None, primary_key=True)
    conversation_id: str = Field(index=True)
    user_id: str = Field(index=True)
    role: str  # "user" or "assistant"
    content: str
    actions: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    title: Optional[str] = Field(default="New Conversation")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

### T3-003: Implement Gemini Service
**From**: plan.md §2.2, spec.md §5.1
**Priority**: High
**Estimate**: Large

**Description**: Create service class for interacting with Google Gemini API.

**Preconditions**: T3-001 completed

**Acceptance Criteria**:
- [ ] GeminiService class initializes API client
- [ ] Configures model with system prompt
- [ ] Defines all 5 function schemas (create, list, update, delete, toggle)
- [ ] process_message() method handles conversation
- [ ] Returns structured response with function calls
- [ ] Error handling for API failures

**Artifacts to Modify**:
- Create: `backend/app/services/gemini_service.py`
- Create: `backend/app/services/__init__.py` (if not exists)

**Test Cases**:
- API initialization with valid key
- Process simple message
- Process message with function call
- Handle API error gracefully

---

### T3-004: Implement Function Router
**From**: plan.md §2.3, spec.md §5.1
**Priority**: High
**Estimate**: Medium

**Description**: Create router to execute AI function calls on actual task operations.

**Preconditions**: T3-003 completed

**Acceptance Criteria**:
- [ ] FunctionRouter class with session and user_id
- [ ] execute() method routes to correct handler
- [ ] All 5 functions implemented (create, list, update, delete, toggle)
- [ ] Proper error handling for invalid tasks
- [ ] User isolation enforced
- [ ] Returns structured action results

**Artifacts to Modify**:
- Create: `backend/app/services/function_router.py`

**Test Cases**:
- Execute create_task function
- Execute list_tasks with filter
- Execute update_task
- Execute delete_task
- Execute toggle_task
- Handle non-existent task
- Enforce user isolation

---

### T3-005: Create Chat API Routes
**From**: plan.md §2.4, spec.md §3
**Priority**: High
**Estimate**: Large

**Description**: Implement FastAPI routes for chat functionality.

**Preconditions**: T3-003, T3-004 completed

**Acceptance Criteria**:
- [ ] POST /api/users/{user_id}/chat endpoint
- [ ] GET /api/users/{user_id}/chat/conversations endpoint
- [ ] GET /api/users/{user_id}/chat/conversations/{id}/messages endpoint
- [ ] JWT authentication on all endpoints
- [ ] Saves messages to database
- [ ] Executes function calls via FunctionRouter
- [ ] Returns structured ChatResponse

**Artifacts to Modify**:
- Create: `backend/app/routes/chat.py`
- Update: `backend/app/main.py` (register router)

**API Contract**:
```json
POST /api/users/{user_id}/chat
Request: {
  "message": "Add a task to buy groceries",
  "conversation_id": "uuid-or-null"
}

Response: {
  "message": "I've created a task for you: Buy groceries",
  "actions": [{
    "type": "task_created",
    "task": { "id": 12, "title": "Buy groceries", "completed": false }
  }],
  "conversation_id": "uuid"
}
```

---

### T3-006: Update Backend Configuration for Gemini
**From**: plan.md §2.5
**Priority**: High
**Estimate**: Small

**Description**: Add Gemini-related configuration settings.

**Preconditions**: T3-001 completed

**Acceptance Criteria**:
- [ ] Settings class includes Gemini fields
- [ ] .env.example updated with Gemini variables
- [ ] Environment variables loaded correctly
- [ ] Validation for required fields

**Artifacts to Modify**:
- Update: `backend/app/config.py`
- Update: `backend/.env.example`
- Update: `backend/.env` (manually)

**Environment Variables**:
```bash
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=1024
GEMINI_TEMPERATURE=0.7
```

---

### T3-007: Create ChatInterface Component
**From**: plan.md §3.1, spec.md §4.1
**Priority**: High
**Estimate**: Medium

**Description**: Build main chat container component in React.

**Preconditions**: T3-005 completed (API ready)

**Acceptance Criteria**:
- [ ] ChatInterface component with messages state
- [ ] Fetches and displays conversation history
- [ ] Sends messages to backend API
- [ ] Handles loading states
- [ ] Auto-scrolls to latest message
- [ ] Creates new conversations
- [ ] Displays actions from AI responses

**Artifacts to Modify**:
- Create: `frontend/components/ChatInterface.tsx`

**Props**:
```typescript
interface ChatInterfaceProps {
  userId: string;
  token: string;
}
```

---

### T3-008: Create ChatMessage Component
**From**: plan.md §3.2
**Priority**: Medium
**Estimate**: Small

**Description**: Build individual message display component.

**Preconditions**: None (can be done in parallel)

**Acceptance Criteria**:
- [ ] Displays user and assistant messages differently
- [ ] Shows message content with proper formatting
- [ ] Displays action badges for task operations
- [ ] Responsive design
- [ ] Handles long messages gracefully

**Artifacts to Modify**:
- Create: `frontend/components/ChatMessage.tsx`

**Props**:
```typescript
interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
    actions?: any[];
  };
}
```

---

### T3-009: Create ChatInput Component
**From**: plan.md §3.3
**Priority**: Medium
**Estimate**: Small

**Description**: Build message input field with send button.

**Preconditions**: None (can be done in parallel)

**Acceptance Criteria**:
- [ ] Text input with placeholder
- [ ] Send button (disabled when empty/loading)
- [ ] Enter key submits message
- [ ] Input clears after sending
- [ ] Disabled state during loading

**Artifacts to Modify**:
- Create: `frontend/components/ChatInput.tsx`

**Props**:
```typescript
interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}
```

---

### T3-010: Integrate Chat into Dashboard
**From**: plan.md §3.4, spec.md §4.1
**Priority**: High
**Estimate**: Medium

**Description**: Add chat interface to existing dashboard page.

**Preconditions**: T3-007, T3-008, T3-009 completed

**Acceptance Criteria**:
- [ ] Dashboard shows both task list and chat
- [ ] Two-column layout on large screens
- [ ] Stacked layout on mobile
- [ ] Chat updates reflect in task list (optional: live sync)
- [ ] Proper spacing and styling
- [ ] JWT token passed to ChatInterface

**Artifacts to Modify**:
- Update: `frontend/app/dashboard/page.tsx`

**Layout**:
```
┌─────────────────────────────────────┐
│  Header (User, Logout)              │
├──────────────────┬──────────────────┤
│  Task List       │  Chat Interface  │
│  (Traditional)   │  (AI Assistant)  │
│                  │                  │
└──────────────────┴──────────────────┘
```

---

### T3-011: Add Database Migration for Chat Tables
**From**: plan.md §4.1
**Priority**: High
**Estimate**: Small

**Description**: Create migration script for chat tables.

**Preconditions**: T3-002 completed

**Acceptance Criteria**:
- [ ] Migration creates conversations table
- [ ] Migration creates chat_messages table
- [ ] Indexes created correctly
- [ ] Migration runs without errors
- [ ] Rollback works correctly

**Artifacts to Modify**:
- Create: `backend/migrations/003_add_chat_tables.py` (if using Alembic)
- OR: Tables auto-created by SQLModel on startup

**Manual Testing**:
```bash
# Check tables exist
psql $DATABASE_URL -c "\dt"

# Should show:
# - conversations
# - chat_messages
```

---

### T3-012: Write Tests for Gemini Integration
**From**: plan.md §5
**Priority**: Medium
**Estimate**: Medium

**Description**: Create unit and integration tests for AI features.

**Preconditions**: T3-005 completed

**Acceptance Criteria**:
- [ ] Unit tests for GeminiService
- [ ] Unit tests for FunctionRouter
- [ ] Integration test for chat endpoint
- [ ] Test function calling flow
- [ ] Test conversation history
- [ ] Mock Gemini API responses

**Artifacts to Modify**:
- Create: `backend/tests/test_gemini_service.py`
- Create: `backend/tests/test_function_router.py`
- Create: `backend/tests/test_chat_routes.py`

**Test Scenarios**:
1. Create task via chat
2. List tasks via chat
3. Update task via chat
4. Delete task via chat (with confirmation)
5. Multi-turn conversation
6. Invalid task ID handling
7. User isolation

---

### T3-013: Update README for Phase III
**From**: Deliverables
**Priority**: Low
**Estimate**: Small

**Description**: Document Phase III features and setup in README.

**Preconditions**: T3-010 completed

**Acceptance Criteria**:
- [ ] Phase III section added to README
- [ ] Gemini API setup instructions
- [ ] Environment variables documented
- [ ] Chat usage examples
- [ ] Example conversations shown
- [ ] Troubleshooting section

**Artifacts to Modify**:
- Update: `README.md`

**Content to Add**:
- How to get Gemini API key
- Example chat commands
- Screenshots (optional)
- Known limitations
- Cost considerations

---

## Implementation Order

```
         T3-001 (Install Gemini SDK)
            │
      ┌─────┼─────┬─────────┐
      │     │     │         │
      ▼     ▼     ▼         ▼
   T3-002  T3-003 T3-006  T3-008, T3-009 (parallel)
      │     │     │         │
      ▼     ▼     │         │
   T3-011  T3-004 │         │
            │     │         │
            ▼     │         │
          T3-005◄─┘         │
            │               │
            ▼               │
          T3-007◄───────────┘
            │
            ▼
          T3-010
            │
            ▼
          T3-012, T3-013 (parallel)
```

**Critical Path**: T3-001 → T3-003 → T3-004 → T3-005 → T3-007 → T3-010

**Can be done in parallel**:
- T3-002, T3-003, T3-006 (after T3-001)
- T3-008, T3-009 (any time)
- T3-012, T3-013 (at the end)

---

## Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Get API Key"
4. Create new project or select existing
5. Copy the API key
6. Add to `backend/.env`:
   ```bash
   GEMINI_API_KEY=your-api-key-here
   ```

---

## Testing Checklist

### Backend Testing
- [ ] Gemini service initializes
- [ ] Function schemas are valid
- [ ] Chat endpoint responds
- [ ] Function calls execute correctly
- [ ] User isolation enforced
- [ ] Conversation history saved
- [ ] Error handling works

### Frontend Testing
- [ ] Chat interface renders
- [ ] Messages display correctly
- [ ] User can send messages
- [ ] AI responses appear
- [ ] Actions badges show
- [ ] Responsive on mobile
- [ ] Loading states work

### E2E Testing
- [ ] Complete chat conversation
- [ ] Create task via chat → appears in list
- [ ] Update task via chat → list updates
- [ ] Delete task via chat → list updates
- [ ] Multi-turn context maintained
- [ ] Multiple conversations work

---

## Notes

- Gemini API key required from Google AI Studio
- Free tier: 60 requests/minute, 1500 requests/day
- Consider rate limiting for production
- Monitor API costs in production
- All Phase II functionality remains unchanged
- Chat is an additive feature

---

**References**:
- Phase III Spec: `specs/phase3-ai-chatbot/spec.md`
- Phase III Plan: `specs/phase3-ai-chatbot/plan.md`
- Gemini Documentation: https://ai.google.dev/docs
