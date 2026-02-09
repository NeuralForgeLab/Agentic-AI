"""
02 - Agent with Tools (OpenAI SDK Approach)
Demonstrates function calling using OpenAI-style JSON tool schemas.
"""

from dotenv import load_dotenv
import os
import chainlit as cl

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel, set_tracing_disabled

set_tracing_disabled(disabled=True)

# ------------------------
# 1. LLM Client
# ------------------------
external_client: AsyncOpenAI = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

# ------------------------
# 2. LLM Model
# ------------------------
llm_model: OpenAIChatCompletionsModel = OpenAIChatCompletionsModel(
    model="gemini-2.0-flash",
    openai_client=external_client
)

# ------------------------
# 3. Define Math Functions
# ------------------------
def addition(a: float, b: float) -> float:
    return a + b

def subtraction(a: float, b: float) -> float:
    return a - b

def division(a: float, b: float) -> float:
    return a / b if b != 0 else float("inf")

# ------------------------
# 4. Tool Schema (OpenAI Format)
# ------------------------
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
    },
    {
        "name": "subtraction",
        "description": "Subtract b from a",
        "parameters": {
            "type": "object",
            "properties": {
                "a": {"type": "number"},
                "b": {"type": "number"}
            },
            "required": ["a", "b"]
        }
    },
    {
        "name": "division",
        "description": "Divide a by b",
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

# ------------------------
# 5. Agent with Tools
# ------------------------
math_agent: Agent = Agent(
    name="MathAgent",
    instructions="You are a helpful math assistant. Use the provided tools to perform math operations.",
    model=llm_model,
    tools=math_tools
)

# ------------------------
# 6. Runner
# ------------------------
def run_agent(question: str):
    result = Runner.run_sync(math_agent, question)
    return result

# ------------------------
# 7. Chainlit Handler
# ------------------------
@cl.on_chat_start
async def on_chat_start():
    await cl.Message(content="Hello! I'm a Math Agent with Tools. Ask me to calculate anything!").send()

@cl.on_message
async def main(message: cl.Message):
    response = run_agent(message.content)
    await cl.Message(content=response.final_output).send()
