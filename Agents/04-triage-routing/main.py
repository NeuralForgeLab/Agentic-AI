"""
04 - Triage / Routing Pattern
Demonstrates classification agent that routes to appropriate handler functions.
Uses Pydantic for structured output.
"""

import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
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

# ------------------ Gemini Client ------------------
external_client: AsyncOpenAI = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

llm_model: OpenAIChatCompletionsModel = OpenAIChatCompletionsModel(
    model="gemini-2.0-flash",
    openai_client=external_client
)

# ------------------ Math Functions ------------------
def addition(a: float, b: float) -> float:
    return a + b

def subtraction(a: float, b: float) -> float:
    return a - b

def division(a: float, b: float) -> float:
    if b == 0:
        return float("inf")
    return a / b

# ------------------ Pydantic Model for Classification ------------------
class MathCategory(BaseModel):
    category: str = Field(..., description="One of: Addition, Subtraction, Division")
    numbers: str = Field(..., description="Extract numbers in space separated format like 'a b'")
    reasoning: str = Field(..., description="Explanation of why this category was chosen")

# ------------------ Triage Agent ------------------
triage_agent = Agent(
    name="Math Classifier",
    instructions="""
    Decide which operation the user is asking for: Addition, Subtraction, or Division.
    Extract the two numbers from the input and return them space-separated in 'numbers'.
    Example: For 'What is 2 + 2?', output category=Addition, numbers='2 2'.
    """,
    output_type=MathCategory,
    model=llm_model
)

# ------------------ Chainlit ------------------
@cl.on_chat_start
async def on_chat_start():
    await cl.Message(content="Hello! Ask me a math question (e.g., 'What is 10 divided by 2?').").send()

@cl.on_message
async def on_message(message: cl.Message):
    # Step 1: Classify the request
    triage_result = await Runner.run(triage_agent, message.content)
    math_output = triage_result.final_output_as(MathCategory)

    category = math_output.category.lower()
    nums = list(map(float, math_output.numbers.split()))

    await cl.Message(content=f"**Classified as:** {math_output.category}\n**Reasoning:** {math_output.reasoning}").send()

    # Step 2: Route to correct function
    if "add" in category:
        result = addition(*nums)
        chosen = "Addition"
    elif "sub" in category:
        result = subtraction(*nums)
        chosen = "Subtraction"
    elif "div" in category:
        result = division(*nums)
        chosen = "Division"
    else:
        await cl.Message(content="Sorry, I couldn't understand the math operation.").send()
        return

    # Step 3: Respond
    await cl.Message(content=f"**{chosen} Result:** {result}").send()
