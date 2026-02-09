# 01 - Basic Agent

## Concept

A **Basic Agent** is the fundamental building block of Agentic AI. It consists of:

- **Name**: Identifier for the agent
- **Instructions**: System prompt that defines the agent's behavior and personality
- **Model**: The LLM that powers the agent's responses

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   User Input                     │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                    Agent                         │
│  ┌─────────────────────────────────────────┐    │
│  │  Name: "Travel Guide"                   │    │
│  │  Instructions: "You are a helpful..."   │    │
│  │  Model: Gemini 2.0 Flash                │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                   Response                       │
└─────────────────────────────────────────────────┘
```

## Key Components

| Component | Description |
|-----------|-------------|
| `Agent` | Core class that defines agent behavior |
| `Runner` | Executes the agent with user input |
| `AsyncOpenAI` | Client for API communication |
| `OpenAIChatCompletionsModel` | Model wrapper |

## Code Example

```python
from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel

# Create LLM client
client = AsyncOpenAI(api_key=API_KEY, base_url=BASE_URL)

# Create model
model = OpenAIChatCompletionsModel(model="gemini-2.0-flash", openai_client=client)

# Define agent
agent = Agent(
    name="Travel Guide",
    instructions="You are a helpful Travel Guide.",
    model=model
)

# Run agent
result = Runner.run_sync(agent, "What are the best places to visit in Paris?")
print(result.final_output)
```

## Running the Example

1. Create a `.env` file with your API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

2. Install dependencies:
   ```bash
   pip install openai-agents chainlit python-dotenv
   ```

3. Run with Chainlit:
   ```bash
   chainlit run main.py
   ```

## Use Cases

- Customer support chatbots
- Virtual assistants
- FAQ bots
- Simple conversational agents
