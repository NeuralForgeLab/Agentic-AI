# 02 - Agent with Tools (Function Calling)

## Concept

**Tool Use** extends an agent's capabilities by allowing it to call external functions. The agent decides when and which tool to use based on user input.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   User Input                     │
│            "What is 15 divided by 3?"           │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                    Agent                         │
│         (Analyzes and selects tool)             │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                 Tool Selection                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Addition │ │Subtraction│ │ Division │ ◄──────│
│  └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              Tool Execution                      │
│           division(15, 3) → 5.0                 │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              Response: "5.0"                     │
└─────────────────────────────────────────────────┘
```

## Two Approaches

### 1. LangChain Tools (`langchain_tools.py`)

Uses LangChain's `Tool` wrapper class:

```python
from langchain.agents import Tool

tools = [
    Tool(
        name="Addition",
        func=lambda x: addition(*map(float, x.split())),
        description="Add two numbers. Input format: 'a b'"
    )
]
```

### 2. OpenAI-Style Tools (`openai_tools.py`)

Uses JSON schema definition:

```python
math_tools = [
    {
        "name": "addition",
        "description": "Add two numbers",
        "parameters": {
            "type": "object",
            "properties": {
                "a": {"type": "number"},
                "b": {"type": "number"}
            },
            "required": ["a", "b"]
        }
    }
]
```

## Key Components

| Component | Description |
|-----------|-------------|
| Tool Function | Python function that performs the action |
| Tool Schema | JSON definition of tool name, description, parameters |
| Agent | Decides which tool to call based on context |

## Running the Examples

```bash
# LangChain approach
chainlit run langchain_tools.py

# OpenAI SDK approach
chainlit run openai_tools.py
```

## Use Cases

- Calculator bots
- Data retrieval agents
- API integration
- Database queries
- File operations
