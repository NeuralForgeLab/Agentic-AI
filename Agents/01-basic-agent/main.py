"""
01 - Basic Agent
A simple agent with LLM integration using OpenAI Agents SDK with Gemini.
"""

from dotenv import load_dotenv
import os
import chainlit as cl

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel, set_tracing_disabled

# Disable tracing
set_tracing_disabled(disabled=True)

# Initialize OpenAI-compatible Gemini client
external_client: AsyncOpenAI = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

# Specify the model
llm_model: OpenAIChatCompletionsModel = OpenAIChatCompletionsModel(
    model="gemini-2.0-flash",
    openai_client=external_client
)

# Define the agent
travel_agent: Agent = Agent(
    name="Travel Guide",
    instructions="You are a helpful Travel Guide. Help users plan their trips, suggest destinations, and provide travel tips.",
    model=llm_model
)

# Helper function to run the agent
def run_agent(user_input: str):
    result = Runner.run_sync(travel_agent, user_input)
    return result

# Chainlit handlers
@cl.on_chat_start
async def on_chat_start():
    await cl.Message(content="Hello! I'm your Travel Guide Agent. Ask me anything about travel!").send()

@cl.on_message
async def main(message: cl.Message):
    response = run_agent(message.content)
    await cl.Message(content=response.final_output).send()
