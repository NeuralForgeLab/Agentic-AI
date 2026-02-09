# 05 - Guardrails

## Concept

**Guardrails** validate user input before processing, blocking inappropriate or off-topic requests. This example combines Guardrails + Triage + Handoffs.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   User Input                     │
│         "What's the weather today?"             │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              Guardrail Agent                     │
│                                                  │
│   Check: Is this travel-related?                │
│   Output: {                                     │
│     is_travel_question: false,                  │
│     reasoning: "Weather is not travel..."       │
│   }                                             │
└─────────────────────┬───────────────────────────┘
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
     ┌────────────┐      ┌────────────┐
     │  BLOCKED   │      │  ALLOWED   │
     │            │      │            │
     │ tripwire   │      │ Continue   │
     │ triggered  │      │ to Triage  │
     └────────────┘      └─────┬──────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Triage Agent     │
                    │   Route to Agent    │
                    └─────────────────────┘
```

## Key Components

| Component | Description |
|-----------|-------------|
| `InputGuardrail` | Wrapper for guardrail function |
| `GuardrailFunctionOutput` | Result with `tripwire_triggered` flag |
| `InputGuardrailTripwireTriggered` | Exception when blocked |
| Guardrail Agent | Validates input against criteria |

## Code Example

```python
from agents import InputGuardrail, GuardrailFunctionOutput

# Guardrail function
async def travel_guardrail(ctx, agent, input_data):
    result = await Runner.run(guardrail_agent, input_data)
    output = result.final_output_as(TravelOutput)

    if not output.is_travel_question:
        return GuardrailFunctionOutput(
            output_info=output,
            tripwire_triggered=True  # ◄── Block request
        )

    return GuardrailFunctionOutput(
        output_info=output,
        tripwire_triggered=False  # ◄── Allow request
    )

# Agent with guardrail
triage_agent = Agent(
    name="Triage Agent",
    instructions="...",
    input_guardrails=[InputGuardrail(guardrail_function=travel_guardrail)],
    model=llm_model
)
```

## Guardrail Flow

```
                    ┌─────────────────┐
                    │  User Input     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Guardrail      │
                    │  Agent          │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐          ┌─────────────────┐
    │ tripwire=True   │          │ tripwire=False  │
    │                 │          │                 │
    │ "Not allowed"   │          │ Continue flow   │
    │  message        │          │ ───────────►    │
    └─────────────────┘          └─────────────────┘
```

## Running the Example

```bash
chainlit run main.py
```

Try asking:
- "Find me a hotel in Dubai" → Allowed (travel-related)
- "What is 2+2?" → Blocked (not travel-related)

## Use Cases

- Content moderation
- Topic restriction
- Security validation
- Access control
- Compliance filtering
