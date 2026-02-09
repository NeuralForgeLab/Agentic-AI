# Phase III: AI-Powered Todo Chatbot - Implementation Guide

**Created**: 2026-01-19  
**AI Model**: Google Gemini 1.5 Flash  
**Status**: Ready for Implementation

---

## Quick Start

### What Was Done

✅ **Complete Specifications Created**:
1. `specs/phase3-ai-chatbot/spec.md` - Full requirements and features
2. `specs/phase3-ai-chatbot/plan.md` - Detailed architecture and implementation
3. `specs/phase3-ai-chatbot/tasks.md` - 13 actionable tasks with acceptance criteria
4. Updated `MILESTONES.md` with Phase III tracking
5. Updated `README.md` with Phase II documentation

### What's Next

🎯 **Ready to Implement**: All 13 tasks are defined and ready to execute

---

## Why Gemini Instead of OpenAI?

**Chosen**: Google Gemini 1.5 Flash

**Reasons**:
1. **Free Tier**: 60 requests/min, 1500/day (vs OpenAI's limited trial)
2. **Fast**: Optimized for quick responses (< 3s)
3. **Function Calling**: Native support for tool use
4. **Cost-Effective**: $0.00025 per 1K chars (vs OpenAI's $0.0015+)
5. **Google Integration**: Easy integration with Google Cloud
6. **Multimodal**: Future support for images/voice

**Alternative**: Gemini 1.5 Pro (if need more complex reasoning)

---

## Architecture Overview

```
Frontend (Next.js) → Chat UI → Backend (FastAPI) → Gemini API
                                      ↓
                                Function Router
                                      ↓
                               Task Operations
                                      ↓
                            PostgreSQL Database
```

### Key Components

**Backend (Python)**:
- `gemini_service.py` - Handles all Gemini API communication
- `function_router.py` - Routes AI function calls to task operations
- `chat.py` (routes) - REST API endpoints for chat

**Frontend (TypeScript/React)**:
- `ChatInterface.tsx` - Main chat container
- `ChatMessage.tsx` - Individual message display
- `ChatInput.tsx` - Message input field

**Database**:
- `conversations` - Chat session metadata
- `chat_messages` - Individual messages with actions

---

## Implementation Steps

### Step 1: Backend Setup (Tasks T3-001 to T3-006)

```bash
cd backend

# 1. Install Gemini SDK
pip install google-generativeai==0.3.2
echo "google-generativeai==0.3.2" >> requirements.txt

# 2. Get API Key from https://makersuite.google.com/app/apikey

# 3. Add to .env
echo "GEMINI_API_KEY=your-key-here" >> .env
echo "GEMINI_MODEL=gemini-1.5-flash" >> .env
```

**Files to Create**:
1. `backend/app/models/chat.py` - Database models
2. `backend/app/services/gemini_service.py` - AI integration
3. `backend/app/services/function_router.py` - Function calling
4. `backend/app/routes/chat.py` - API endpoints
5. Update `backend/app/config.py` - Add Gemini settings
6. Update `backend/app/main.py` - Register chat router

### Step 2: Frontend Setup (Tasks T3-007 to T3-010)

```bash
cd frontend
# No new dependencies needed
```

**Files to Create**:
1. `frontend/components/ChatInterface.tsx`
2. `frontend/components/ChatMessage.tsx`
3. `frontend/components/ChatInput.tsx`
4. Update `frontend/app/dashboard/page.tsx` - Add chat UI

### Step 3: Testing & Docs (Tasks T3-011 to T3-013)

- Database migration
- Unit tests
- Integration tests
- Update README

---

## Sample Code Snippets

### Backend: Gemini Service Initialization

```python
import google.generativeai as genai

genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction="You are a helpful AI assistant for a Todo app..."
)

# Define functions for AI
functions = [
    {
        "name": "create_task",
        "description": "Create a new task",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "description": {"type": "string"}
            },
            "required": ["title"]
        }
    },
    # ... more functions
]

# Process message
chat = model.start_chat(history=conversation_history)
response = chat.send_message(user_message, tools=functions)
```

### Frontend: Chat Interface

```typescript
const [messages, setMessages] = useState<Message[]>([]);

const sendMessage = async (text: string) => {
  // Add user message
  setMessages(prev => [...prev, { role: "user", content: text }]);
  
  // Send to API
  const response = await fetch(`/api/users/${userId}/chat`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: text, conversation_id })
  });
  
  const data = await response.json();
  
  // Add AI response
  setMessages(prev => [...prev, {
    role: "assistant",
    content: data.message,
    actions: data.actions
  }]);
};
```

---

## API Endpoints

### POST /api/users/{user_id}/chat

**Request**:
```json
{
  "message": "Add a task to buy groceries",
  "conversation_id": "uuid-or-null"
}
```

**Response**:
```json
{
  "message": "I've created a task: Buy groceries",
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
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### GET /api/users/{user_id}/chat/conversations

Lists all conversations for the user.

### GET /api/users/{user_id}/chat/conversations/{id}/messages

Gets all messages in a conversation.

---

## Function Calling

### How It Works

1. **User sends message**: "Add a task to buy milk"
2. **Gemini AI analyzes**: Determines intent is to create a task
3. **AI calls function**: `create_task(title="Buy milk")`
4. **Function Router**: Executes actual task creation in database
5. **Response returned**: Task created + confirmation message
6. **Frontend displays**: Both message and action badge

### Available Functions

1. **create_task**(title, description?)
2. **list_tasks**(status?)
3. **update_task**(task_id, title?, description?)
4. **delete_task**(task_id)
5. **toggle_task**(task_id)

---

## Example Conversations

### Create Task
```
User: "Remind me to call the dentist tomorrow"
AI: "I've created a reminder for you to call the dentist."
✅ Task #15 created: "Call the dentist"
```

### Query Tasks
```
User: "What do I need to do today?"
AI: "You have 3 tasks for today:
     1. Call the dentist (incomplete)
     2. Buy groceries (incomplete)
     3. Submit report (complete)"
```

### Update Task
```
User: "Change task 15 to 'Call dentist at 3pm'"
AI: "I've updated task #15 with the new title."
📝 Task #15 updated
```

### Delete Task
```
User: "Delete task 12"
AI: "Are you sure you want to delete 'Buy groceries'?"
User: "Yes"
AI: "Task #12 has been deleted."
🗑️ Task #12 deleted
```

### Multi-Turn Context
```
User: "Add a task to buy milk"
AI: "Task created: Buy milk"
✅ Task #20 created

User: "Make it high priority"
AI: "I've updated task #20 to high priority."
📝 Task #20 updated
```

---

## Testing Plan

### Unit Tests

```python
# test_gemini_service.py
def test_gemini_service_initialization():
    service = GeminiService()
    assert service.model is not None

def test_process_message_with_function_call():
    service = GeminiService()
    result = await service.process_message(
        "Create a task to buy milk",
        []
    )
    assert "function_calls" in result
    assert result["function_calls"][0]["name"] == "create_task"
```

### Integration Tests

```python
# test_chat_routes.py
def test_chat_endpoint(client, auth_token):
    response = client.post(
        "/api/users/test-user/chat",
        json={"message": "Add a task to test"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "actions" in data
    assert len(data["actions"]) > 0
```

### E2E Tests

1. User sends chat message
2. AI processes and calls function
3. Task is created in database
4. Response shows in chat
5. Task appears in traditional task list

---

## Security Considerations

### API Key Protection
- Store in `.env` file (never commit)
- Use environment variables
- Backend-only access (never expose to frontend)

### User Isolation
- JWT authentication on all endpoints
- Verify user_id matches token
- Function router enforces user ownership

### Rate Limiting
```python
# In chat.py
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@router.post("/chat")
@limiter.limit("60/minute")
async def send_message(...):
    ...
```

### Input Validation
- Sanitize user messages before sending to AI
- Validate AI responses before executing functions
- Prevent prompt injection attacks

---

## Cost Management

### Gemini API Pricing (2026)

**Free Tier**:
- 60 requests per minute
- 1,500 requests per day
- Perfect for development and testing

**Paid Tier**:
- Input: $0.00025 per 1K characters
- Output: $0.0005 per 1K characters

**Estimated Costs** (assuming 100 users, 10 messages/day each):
- Daily: 1,000 messages × 200 chars avg = 200K chars
- Cost: $0.05 per day = $1.50 per month
- Very affordable!

### Monitoring

```python
# Add to gemini_service.py
import logging

logger = logging.getLogger(__name__)

async def process_message(self, message, history):
    logger.info(f"Processing message: {len(message)} chars")
    response = await self._call_gemini(message)
    logger.info(f"Response: {len(response.text)} chars")
    return response
```

---

## Troubleshooting

### Common Issues

**1. "API Key Invalid"**
```
Solution: Check GEMINI_API_KEY in .env
Verify: curl test with your key
```

**2. "Rate Limit Exceeded"**
```
Solution: Implement request queuing
Or: Upgrade to paid tier
```

**3. "Function Not Called"**
```
Solution: Check function schema matches Gemini requirements
Debug: Log AI response before parsing
```

**4. "Chat Not Updating"**
```
Solution: Check WebSocket connection (if using)
Or: Verify API endpoint is reachable
```

---

## Deployment Checklist

- [ ] Gemini API key added to production `.env`
- [ ] Database migrated (conversations + chat_messages tables)
- [ ] Backend updated with new dependencies
- [ ] Frontend built and deployed
- [ ] Rate limiting configured
- [ ] Monitoring/logging set up
- [ ] Cost alerts configured
- [ ] Security audit completed

---

## Future Enhancements

### Phase III Extensions
- Voice input/output (Gemini multimodal)
- Image upload for tasks
- Natural language date/time parsing
- Smart task prioritization
- Productivity insights

### Phase IV Readiness
Once Phase III is complete, you'll be ready for:
- Containerization with Docker
- Kubernetes deployment
- Horizontal scaling
- Cloud deployment

---

## Resources

### Documentation
- Gemini API Docs: https://ai.google.dev/docs
- Function Calling Guide: https://ai.google.dev/docs/function_calling
- Python SDK: https://github.com/google/generative-ai-python

### Getting API Key
- Google AI Studio: https://makersuite.google.com/app/apikey

### Community
- GitHub Discussions: (add your repo link)
- Discord/Slack: (add community link)

---

## Summary

**What You Have**:
✅ Complete specifications (spec.md, plan.md, tasks.md)
✅ 13 well-defined tasks with acceptance criteria
✅ Architectural diagrams and component descriptions
✅ Code samples and implementation guidance
✅ Testing strategy
✅ Security considerations
✅ Cost estimates

**What To Do Next**:
1. Get Gemini API key from Google AI Studio
2. Start with Task T3-001 (Install SDK)
3. Follow tasks.md in order
4. Test each component as you build
5. Update MILESTONES.md as you progress

**Estimated Timeline**:
- Backend: 2-3 days
- Frontend: 1-2 days
- Testing: 1 day
- **Total**: ~5-7 days for complete Phase III

---

**Ready to build?** Start with `specs/phase3-ai-chatbot/tasks.md` and implement task T3-001!

**Questions?** All details are in the spec files. Read MILESTONES.md anytime to track progress.

**Good luck! 🚀**
