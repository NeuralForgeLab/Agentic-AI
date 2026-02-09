# 04 - Triage / Routing Pattern

## Concept

**Triage Routing** uses a classifier agent to analyze user input and route it to the appropriate handler (function or agent). Uses **Pydantic** for structured output.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   User Input                     │
│            "What is 10 plus 5?"                 │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              Triage Agent                        │
│         (Classifier with Pydantic)              │
│                                                  │
│   Output: {                                     │
│     category: "Addition",                       │
│     numbers: "10 5",                            │
│     reasoning: "User wants to add..."          │
│   }                                             │
└─────────────────────┬───────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
     ┌────────┐  ┌────────┐  ┌────────┐
     │Addition│  │Subtract│  │Division│
     │  10+5  │  │        │  │        │
     └───┬────┘  └────────┘  └────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│              Response: 15                        │
└─────────────────────────────────────────────────┘
```

## Structured Output with Pydantic

```python
from pydantic import BaseModel, Field

class MathCategory(BaseModel):
    category: str = Field(..., description="One of: Addition, Subtraction, Division")
    numbers: str = Field(..., description="Numbers in 'a b' format")
    reasoning: str = Field(..., description="Why this category was chosen")

# Agent with structured output
triage_agent = Agent(
    name="Math Classifier",
    instructions="Classify the math operation...",
    output_type=MathCategory,  # ◄── Pydantic model
    model=llm_model
)

# Extract typed output
result = await Runner.run(triage_agent, user_input)
output = result.final_output_as(MathCategory)
print(output.category)  # "Addition"
print(output.numbers)   # "10 5"
```

## Key Components

| Component | Description |
|-----------|-------------|
| Pydantic Model | Defines structure of classification output |
| `output_type` | Agent parameter for structured output |
| `final_output_as()` | Extracts typed result from agent |
| Routing Logic | if/else or match statements for routing |

## Routing Flow

```
User Input
    │
    ▼
┌─────────────┐
│   Triage    │──► Structured Output (Pydantic)
│   Agent     │
└─────────────┘
    │
    ├─── category == "Addition" ───► addition()
    ├─── category == "Subtraction" ─► subtraction()
    └─── category == "Division" ───► division()
```

## Running the Example

```bash
chainlit run main.py
```

## Use Cases

- Intent classification
- Support ticket routing
- Query categorization
- Multi-department helpdesks
- Command parsing
