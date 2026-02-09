# Phase III Specification: AI-Powered Todo Chatbot

**Phase**: III - AI-Powered Todo Chatbot  
**Status**: Planning  
**Created**: 2026-01-19  
**Last Updated**: 2026-01-19

---

## 1. Overview

### 1.1 Purpose
Transform the Todo application into an AI-powered conversational interface using **Google Gemini API**, enabling users to manage tasks through natural language interactions.

### 1.2 Scope
- Integrate Google Gemini AI for natural language understanding
- Add conversational interface to existing web application
- Maintain all Phase II functionality (authentication, CRUD operations)
- Support both traditional UI and chat interface

### 1.3 Goals
- **Natural Language Task Management**: Users can create, update, and delete tasks using conversational language
- **Context-Aware Responses**: AI understands task context and user intent
- **Smart Suggestions**: AI provides task recommendations and insights
- **Seamless Integration**: Chat interface works alongside existing UI

---

## 2. AI Integration Architecture

### 2.1 Gemini API Choice
**Selected Model**: Gemini 1.5 Flash (fast, cost-effective)

**Rationale**:
- Fast response times for chat interactions
- Cost-effective for high-volume usage
- Strong natural language understanding
- Function calling support for task operations
- Multimodal capabilities (future enhancement)

**Alternative**: Gemini 1.5 Pro (for complex reasoning scenarios)

### 2.2 API Configuration
```python
# Backend configuration
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=1024
GEMINI_TEMPERATURE=0.7
```

---

## 3. Features

### 3.1 Conversational Task Management

#### F3-001: Natural Language Task Creation
**Priority**: High

**Description**: Users can create tasks using natural language.

**Examples**:
- "Add a task to buy groceries tomorrow"
- "Remind me to call mom"
- "Create a task: finish the report by Friday"

**Acceptance Criteria**:
- AI extracts task title from user message
- AI extracts optional description and metadata
- Task is created in the database
- User receives confirmation message

#### F3-002: Task Queries
**Priority**: High

**Description**: Users can query tasks using natural language.

**Examples**:
- "What tasks do I have today?"
- "Show me incomplete tasks"
- "Do I have any high priority tasks?"

**Acceptance Criteria**:
- AI understands query intent
- Fetches relevant tasks from database
- Presents tasks in natural language format
- Handles edge cases (no tasks, empty queries)

#### F3-003: Task Updates
**Priority**: High

**Description**: Users can update tasks conversationally.

**Examples**:
- "Mark task #5 as complete"
- "Change the title of task 3 to 'Submit report'"
- "Update the deadline for grocery shopping"

**Acceptance Criteria**:
- AI identifies task by ID or description
- AI extracts update parameters
- Updates task in database
- Confirms changes to user

#### F3-004: Task Deletion
**Priority**: Medium

**Description**: Users can delete tasks through chat.

**Examples**:
- "Delete task #2"
- "Remove all completed tasks"
- "Delete the grocery shopping task"

**Acceptance Criteria**:
- AI identifies tasks to delete
- Requests confirmation for destructive actions
- Deletes from database
- Confirms deletion

#### F3-005: Smart Suggestions
**Priority**: Medium

**Description**: AI provides intelligent suggestions based on task context.

**Examples**:
- Suggest prioritization for overdue tasks
- Recommend task breakdowns for large tasks
- Suggest time estimates
- Offer productivity tips

**Acceptance Criteria**:
- AI analyzes task patterns
- Provides contextual recommendations
- Non-intrusive suggestions
- User can accept or ignore

#### F3-006: Context Awareness
**Priority**: Medium

**Description**: AI maintains conversation context.

**Examples**:
- User: "Add a task to buy milk"
- AI: "Task created: Buy milk"
- User: "Make it high priority"
- AI: "Updated task priority to high"

**Acceptance Criteria**:
- System maintains conversation history
- AI references previous messages
- Context resets appropriately
- Multi-turn conversations supported

---

## 4. User Interface

### 4.1 Chat Interface

**Layout**:
```
┌────────────────────────────────────────────┐
│  Dashboard Header (User, Logout)          │
├────────────────────────────────────────────┤
│                                            │
│  Traditional Task List (Left/Top)         │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│  Chat Interface (Right/Bottom)            │
│  ┌──────────────────────────────────┐    │
│  │ User: Add buy groceries          │    │
│  │ AI: Created task: Buy groceries  │    │
│  │ [Task #12 created]               │    │
│  └──────────────────────────────────┘    │
│  [ Type your message... ] [Send]         │
│                                            │
└────────────────────────────────────────────┘
```

### 4.2 Component Structure

**New Components**:
- `ChatInterface.tsx` - Main chat container
- `ChatMessage.tsx` - Individual message display
- `ChatInput.tsx` - Message input with send button
- `TaskAction.tsx` - Interactive task action cards

**Modified Components**:
- `dashboard/page.tsx` - Add chat interface
- `layout.tsx` - Include chat styles

---

## 5. Backend Architecture

### 5.1 Gemini Integration Service

**File**: `backend/app/services/gemini_service.py`

**Responsibilities**:
- Initialize Gemini API client
- Send prompts to Gemini
- Parse AI responses
- Handle function calling
- Manage conversation context

### 5.2 Chat API Routes

**File**: `backend/app/routes/chat.py`

**Endpoints**:

```http
POST /api/{user_id}/chat
Content-Type: application/json

{
  "message": "Add a task to buy groceries",
  "conversation_id": "uuid",
  "context": []
}

Response: 200 OK
{
  "message": "I've created a task for you: Buy groceries",
  "actions": [
    {
      "type": "task_created",
      "task": {
        "id": 12,
        "title": "Buy groceries",
        "completed": false
      }
    }
  ],
  "conversation_id": "uuid"
}
```

### 5.3 Function Calling

**Functions Available to AI**:

1. **create_task(title: str, description: str = "")**
   - Creates new task for user
   - Returns task object

2. **list_tasks(status: str = "all")**
   - Lists user tasks
   - Filters by status

3. **update_task(task_id: int, title: str = None, description: str = None)**
   - Updates task fields
   - Returns updated task

4. **delete_task(task_id: int)**
   - Deletes task
   - Returns success status

5. **toggle_task(task_id: int)**
   - Toggles completion status
   - Returns updated task

---

## 6. System Prompts

### 6.1 Main System Prompt

```
You are a helpful AI assistant for a Todo application. Your role is to help users manage their tasks through natural language conversations.

You have access to the following functions:
- create_task: Create a new task
- list_tasks: View tasks
- update_task: Modify existing tasks
- delete_task: Remove tasks
- toggle_task: Mark tasks complete/incomplete

Guidelines:
1. Be concise and friendly
2. Confirm actions before executing
3. Ask for clarification if intent is unclear
4. Provide helpful suggestions when appropriate
5. Use the user's language style
6. For destructive actions (delete), always confirm first

When the user asks to create a task, extract:
- Title (required)
- Description (optional)
- Any metadata (priority, deadline, etc.)

Always respond in a natural, conversational tone.
```

---

## 7. Data Models

### 7.1 Chat Message Model

```python
class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"
    
    id: int = Field(default=None, primary_key=True)
    conversation_id: str = Field(index=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    role: str  # "user" or "assistant"
    content: str
    actions: Optional[str] = None  # JSON of actions taken
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### 7.2 Conversation Model

```python
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"
    
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## 8. Security Considerations

### 8.1 API Key Management
- Store Gemini API key in environment variables
- Never expose key to frontend
- Use backend proxy for all AI requests

### 8.2 Rate Limiting
- Implement rate limiting on chat endpoint
- Prevent API abuse
- Set per-user message limits

### 8.3 Content Filtering
- Validate user input before sending to AI
- Sanitize AI responses
- Block malicious prompts

### 8.4 User Isolation
- Ensure AI only accesses user's own tasks
- Maintain JWT authentication
- Validate user_id in all requests

---

## 9. Error Handling

### 9.1 AI Service Errors
- **Gemini API Unavailable**: Show graceful error, fallback to traditional UI
- **Rate Limit Exceeded**: Inform user, suggest retry time
- **Invalid Response**: Log error, ask user to rephrase

### 9.2 Function Calling Errors
- **Task Not Found**: "I couldn't find that task. Can you provide the task ID?"
- **Invalid Parameters**: "I need more information. Can you be more specific?"
- **Database Error**: "I encountered an issue. Please try again."

---

## 10. Performance Requirements

### 10.1 Response Times
- Chat message processing: < 2 seconds
- AI response generation: < 3 seconds
- Function execution: < 1 second

### 10.2 Scalability
- Support 1000+ concurrent chat sessions
- Handle 10,000+ messages per day
- Efficient conversation context management

---

## 11. Testing Requirements

### 11.1 Unit Tests
- Gemini service initialization
- Function calling logic
- Response parsing
- Error handling

### 11.2 Integration Tests
- End-to-end chat flow
- Task operations via chat
- Multi-turn conversations
- Edge cases

### 11.3 User Acceptance Tests
- Create task via chat
- Query tasks naturally
- Update tasks conversationally
- Delete tasks with confirmation

---

## 12. Future Enhancements

### 12.1 Phase III Extensions
- Voice input/output (Gemini multimodal)
- Task scheduling and reminders
- Natural language date parsing
- Task categorization by AI
- Smart task prioritization
- Productivity analytics

### 12.2 Advanced Features
- Multi-language support
- Collaborative task management
- Calendar integration
- Email notifications
- Mobile app with chat

---

## 13. Success Criteria

### 13.1 Functional
- [x] Users can create tasks via chat
- [x] Users can query tasks via chat
- [x] Users can update tasks via chat
- [x] Users can delete tasks via chat
- [x] AI provides smart suggestions
- [x] Context-aware conversations

### 13.2 Non-Functional
- [x] Response time < 3 seconds
- [x] 99.5% uptime
- [x] Secure API key management
- [x] User-friendly error messages

---

## 14. Dependencies

### 14.1 External Services
- Google Gemini API (primary)
- Existing Neon PostgreSQL database
- Better Auth (existing)

### 14.2 Python Packages
- `google-generativeai` - Official Gemini SDK
- `pydantic` - Data validation (existing)
- `sqlmodel` - Database ORM (existing)
- `fastapi` - API framework (existing)

### 14.3 Frontend Packages
- `react` (existing)
- `next.js` (existing)
- No additional packages required

---

## 15. Migration Strategy

### 15.1 Database Migration
- Add chat_messages table
- Add conversations table
- No changes to existing task table

### 15.2 Backward Compatibility
- Traditional UI remains fully functional
- Chat is an additive feature
- Users can choose their preferred interface

---

**References**:
- Gemini API Documentation: https://ai.google.dev/docs
- Function Calling Guide: https://ai.google.dev/docs/function_calling
- Phase II Specification: `specs/phase2-web/spec.md`
