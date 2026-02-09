# Task: T3-003 - Gemini service (Enhanced)
# Advanced task management with priority, due dates, categories
"""
Service for interacting with Google Gemini AI API.
"""

import json
from typing import Optional

import google.generativeai as genai
from google.generativeai.types import HarmBlockThreshold, HarmCategory

from ..config import get_settings

# Function declarations for Gemini - Enhanced with advanced fields
FUNCTION_DECLARATIONS = [
    {
        "name": "create_task",
        "description": "Create a new task for the user with optional advanced fields",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "The title of the task (required)",
                },
                "description": {
                    "type": "string",
                    "description": "Optional description of the task",
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high", "urgent"],
                    "description": "Priority level of the task",
                },
                "due_date": {
                    "type": "string",
                    "description": "Due date in ISO format (YYYY-MM-DDTHH:MM:SS). Can also be relative like 'tomorrow', 'next week'",
                },
                "category": {
                    "type": "string",
                    "description": "Category for the task (e.g., 'Work', 'Personal', 'Shopping')",
                },
                "estimated_minutes": {
                    "type": "integer",
                    "description": "Estimated time in minutes to complete the task",
                },
            },
            "required": ["title"],
        },
    },
    {
        "name": "list_tasks",
        "description": "List all tasks for the user, optionally filtered by status, priority, or category",
        "parameters": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": [
                        "all",
                        "todo",
                        "in_progress",
                        "completed",
                        "overdue",
                        "due_today",
                    ],
                    "description": "Filter tasks by status",
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high", "urgent"],
                    "description": "Filter tasks by priority",
                },
                "category": {
                    "type": "string",
                    "description": "Filter tasks by category name",
                },
            },
        },
    },
    {
        "name": "update_task",
        "description": "Update an existing task's fields",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "The ID of the task to update",
                },
                "title": {"type": "string", "description": "New title for the task"},
                "description": {
                    "type": "string",
                    "description": "New description for the task",
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high", "urgent"],
                    "description": "New priority level",
                },
                "due_date": {
                    "type": "string",
                    "description": "New due date in ISO format",
                },
                "category": {
                    "type": "string",
                    "description": "New category for the task",
                },
                "status": {
                    "type": "string",
                    "enum": ["todo", "in_progress", "completed", "cancelled"],
                    "description": "New status for the task",
                },
            },
            "required": ["task_id"],
        },
    },
    {
        "name": "delete_task",
        "description": "Delete a task by its ID",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "The ID of the task to delete",
                }
            },
            "required": ["task_id"],
        },
    },
    {
        "name": "toggle_task",
        "description": "Toggle a task's completion status (mark as complete or incomplete)",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "The ID of the task to toggle",
                }
            },
            "required": ["task_id"],
        },
    },
    {
        "name": "set_task_priority",
        "description": "Set the priority level of a task",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "The ID of the task",
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high", "urgent"],
                    "description": "The priority level to set",
                },
            },
            "required": ["task_id", "priority"],
        },
    },
    {
        "name": "set_task_due_date",
        "description": "Set or update the due date for a task",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "The ID of the task",
                },
                "due_date": {
                    "type": "string",
                    "description": "The due date in ISO format (YYYY-MM-DDTHH:MM:SS)",
                },
            },
            "required": ["task_id", "due_date"],
        },
    },
]

SYSTEM_PROMPT = """You are a helpful AI assistant for an advanced Todo application. Your job is to help users manage their tasks through natural conversation.

You have access to the following functions to manage tasks:
- create_task: Create a new task with title, description, priority, due date, category, and estimated time
- list_tasks: List tasks filtered by status (all, todo, in_progress, completed, overdue, due_today), priority, or category
- update_task: Update any field of a task
- delete_task: Delete a task
- toggle_task: Mark a task as complete or incomplete
- set_task_priority: Set a task's priority (low, medium, high, urgent)
- set_task_due_date: Set or update a task's due date

Guidelines:
1. Be helpful and conversational
2. Use functions when the user wants to perform task operations
3. Confirm actions after they're performed
4. If a user's intent is unclear, ask for clarification
5. Be concise but friendly
6. When listing tasks, summarize the results nicely including priority and due dates
7. When creating tasks, extract as much information as possible (priority, due date, category)
8. For delete operations, confirm before deleting if the user hasn't already confirmed
9. Understand relative dates like "tomorrow", "next Monday", "in 3 days"
10. Recognize priority keywords: "urgent", "important", "high priority", "low priority"
11. Recognize category hints from context (work tasks, shopping, personal, etc.)

Examples of user requests you should handle:
- "Add an urgent task to call the client by tomorrow" -> use create_task with priority="urgent" and appropriate due_date
- "Show me my overdue tasks" -> use list_tasks with status="overdue"
- "What high priority tasks do I have?" -> use list_tasks with priority="high"
- "Mark task 3 as in progress" -> use update_task with status="in_progress"
- "Set task 5 to urgent" -> use set_task_priority
- "Move the deadline for task 2 to next Friday" -> use set_task_due_date
- "Show me my work tasks" -> use list_tasks with category="Work"
- "Add a shopping task to buy milk" -> use create_task with category="Shopping"
"""


class GeminiService:
    """Service for interacting with Google Gemini AI."""

    def __init__(self):
        """Initialize the Gemini service with API configuration."""
        settings = get_settings()

        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY not configured")

        genai.configure(api_key=settings.gemini_api_key)

        # Create the model with function calling capability
        self.model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            generation_config={
                "max_output_tokens": settings.gemini_max_tokens,
                "temperature": settings.gemini_temperature,
            },
            safety_settings={
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            },
            tools=[{"function_declarations": FUNCTION_DECLARATIONS}],
            system_instruction=SYSTEM_PROMPT,
        )

    def process_message(
        self, user_message: str, conversation_history: Optional[list] = None
    ) -> dict:
        """
        Process a user message and return AI response with optional function calls.

        Args:
            user_message: The user's message text
            conversation_history: List of previous messages in the conversation

        Returns:
            dict with keys:
                - text: The AI's text response (may be empty if function call)
                - function_calls: List of function calls to execute
        """
        # Build chat history
        history = []
        if conversation_history:
            for msg in conversation_history:
                role = "user" if msg["role"] == "user" else "model"
                history.append({"role": role, "parts": [msg["content"]]})

        # Start chat with history
        chat = self.model.start_chat(history=history)

        # Send message
        response = chat.send_message(user_message)

        # Parse response
        result = {"text": "", "function_calls": []}

        # Check for function calls
        for candidate in response.candidates:
            for part in candidate.content.parts:
                if hasattr(part, "function_call") and part.function_call:
                    fc = part.function_call
                    result["function_calls"].append(
                        {"name": fc.name, "args": dict(fc.args) if fc.args else {}}
                    )
                elif hasattr(part, "text") and part.text:
                    result["text"] += part.text

        return result

    def generate_response_with_results(
        self,
        user_message: str,
        function_results: list,
        conversation_history: Optional[list] = None,
    ) -> str:
        """
        Generate a follow-up response after function execution.

        Args:
            user_message: The original user message
            function_results: List of function execution results
            conversation_history: Previous conversation history

        Returns:
            AI's text response summarizing the actions taken
        """
        # Build context from function results
        results_summary = []
        for result in function_results:
            action_type = result.get("type", "unknown")
            if action_type == "task_created":
                task = result.get("task", {})
                details = [f"'{task.get('title')}'"]
                if task.get("priority") and task.get("priority") != "medium":
                    details.append(f"priority: {task.get('priority')}")
                if task.get("due_date"):
                    details.append(f"due: {task.get('due_date')}")
                if task.get("category"):
                    details.append(f"category: {task.get('category')}")
                results_summary.append(f"Created task: {', '.join(details)}")
            elif action_type == "tasks_listed":
                tasks = result.get("tasks", [])
                total = result.get("total", 0)
                completed = result.get("completed", 0)
                overdue = result.get("overdue", 0)
                info = f"Found {total} tasks ({completed} completed"
                if overdue > 0:
                    info += f", {overdue} overdue"
                info += ")"
                results_summary.append(info)
                # Include task details
                for task in tasks[:5]:  # Limit to 5 tasks
                    task_info = f"  - [{task.get('id')}] {task.get('title')}"
                    if task.get("priority") and task.get("priority") != "medium":
                        task_info += f" ({task.get('priority')})"
                    if task.get("due_date"):
                        task_info += f" - due: {task.get('due_date')[:10]}"
                    if task.get("completed"):
                        task_info += " ✓"
                    results_summary.append(task_info)
                if len(tasks) > 5:
                    results_summary.append(f"  ... and {len(tasks) - 5} more")
            elif action_type == "task_updated":
                task = result.get("task", {})
                results_summary.append(
                    f"Updated task {task.get('id')}: '{task.get('title')}'"
                )
            elif action_type == "task_deleted":
                task_id = result.get("task_id")
                results_summary.append(f"Deleted task {task_id}")
            elif action_type == "task_toggled":
                task = result.get("task", {})
                status = "completed" if task.get("completed") else "not completed"
                results_summary.append(f"Task {task.get('id')} marked as {status}")
            elif action_type == "priority_set":
                task = result.get("task", {})
                results_summary.append(
                    f"Set task {task.get('id')} priority to {task.get('priority')}"
                )
            elif action_type == "due_date_set":
                task = result.get("task", {})
                results_summary.append(
                    f"Set task {task.get('id')} due date to {task.get('due_date')[:10] if task.get('due_date') else 'none'}"
                )
            elif action_type == "error":
                results_summary.append(f"Error: {result.get('message')}")

        # Generate summary response
        summary_prompt = f"""Based on the user's request: "{user_message}"

The following actions were performed:
{chr(10).join(results_summary)}

Please provide a brief, friendly confirmation to the user about what was done. Include relevant details like priority, due dates, and categories when applicable."""

        # Use simple generation for summary
        response = self.model.generate_content(summary_prompt)

        if response.candidates and response.candidates[0].content.parts:
            return response.candidates[0].content.parts[0].text

        return "I've completed the requested actions."
