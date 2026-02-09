"""
03 - Multi-Agent Handoffs
Demonstrates sequential agent pipeline: Manager -> Web Developer -> Mobile App Developer
"""

import os
from dotenv import load_dotenv
import chainlit as cl
from agents import (
    Agent,
    Runner,
    AsyncOpenAI,
    OpenAIChatCompletionsModel,
    set_tracing_disabled
)

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

set_tracing_disabled(disabled=True)

# Initialize Gemini API client
external_client: AsyncOpenAI = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

llm_model: OpenAIChatCompletionsModel = OpenAIChatCompletionsModel(
    model="gemini-2.0-flash",
    openai_client=external_client
)

# --- Define Specialized Agents ---

manager_agent = Agent(
    name="Manager",
    instructions="You are the project manager. Refine the client request into a clear software requirement specification.",
    model=llm_model
)

web_dev_agent = Agent(
    name="Web Developer",
    handoff_description="Expert in building websites",
    instructions="Take the refined requirement from the Manager and propose a web application solution (structure, features, stack).",
    model=llm_model
)

mobile_dev_agent = Agent(
    name="Mobile App Developer",
    handoff_description="Expert in mobile app development",
    instructions="Take the website solution from the Web Developer and extend it into a mobile app solution (features, design, stack). Provide the final output.",
    model=llm_model
)

# --- Sequential Handoff Workflow ---

@cl.on_chat_start
async def on_chat_start():
    await cl.Message(content="Hello! Give me a project request, and I'll pass it through:\n\n**Manager -> Web Developer -> Mobile App Developer**").send()

@cl.on_message
async def on_message(message: cl.Message):
    user_input = message.content

    # Step 1: Manager processes the input
    await cl.Message(content="**Manager** is refining your request...").send()
    manager_result = await Runner.run(manager_agent, user_input)

    # Step 2: Web Developer gets the refined requirement
    await cl.Message(content="**Web Developer** is working on the refined plan...").send()
    web_result = await Runner.run(web_dev_agent, manager_result.final_output)

    # Step 3: Mobile App Developer produces final output
    await cl.Message(content="**Mobile App Developer** is finalizing the solution...").send()
    mobile_result = await Runner.run(mobile_dev_agent, web_result.final_output)

    # Step 4: Show final output
    await cl.Message(content=f"**Final Output:**\n\n{mobile_result.final_output}").send()
