"""
02 - Agent with Tools (LangChain Approach)
Demonstrates function calling using LangChain's Tool wrapper.
"""

import os
from dotenv import load_dotenv
import chainlit as cl
from langchain.agents import initialize_agent, Tool
from langchain_openai import ChatOpenAI

load_dotenv()

gemini_key = os.getenv("GEMINI_API_KEY")
if not gemini_key:
    raise ValueError("GEMINI_API_KEY not found in .env")

os.environ["OPENAI_API_KEY"] = gemini_key
os.environ["OPENAI_BASE_URL"] = "https://generativelanguage.googleapis.com/v1beta/openai/"

# ------------------ Math Functions ------------------
def addition(a: float, b: float) -> float:
    """Add two numbers"""
    return a + b

def subtraction(a: float, b: float) -> float:
    """Subtract b from a"""
    return a - b

def division(a: float, b: float) -> float:
    """Divide a by b"""
    if b == 0:
        return "Error: Division by zero"
    return a / b

# Wrap functions as LangChain Tools
tools = [
    Tool(
        name="Addition",
        func=lambda x: addition(*map(float, x.split())),
        description="Add two numbers. Input format: 'a b'"
    ),
    Tool(
        name="Subtraction",
        func=lambda x: subtraction(*map(float, x.split())),
        description="Subtract two numbers. Input format: 'a b'"
    ),
    Tool(
        name="Division",
        func=lambda x: division(*map(float, x.split())),
        description="Divide two numbers. Input format: 'a b'"
    )
]

# ------------------ LLM + Agent ------------------
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

math_agent = initialize_agent(
    tools,
    llm,
    agent="zero-shot-react-description",
    verbose=True
)

# ------------------ Chainlit ------------------
@cl.on_chat_start
async def on_chat_start():
    await cl.Message(content="Hello! I'm a Math Agent. Ask me to add, subtract, or divide numbers!").send()

@cl.on_message
async def main(message: cl.Message):
    try:
        result = math_agent.run(message.content)
        await cl.Message(content=str(result)).send()
    except Exception as e:
        await cl.Message(content=f"Error: {e}").send()
