"""
Travel Chatbot Project
A complete travel assistant chatbot using Gemini API with Chainlit UI.
"""

from dotenv import load_dotenv
import os
import chainlit as cl
from google.generativeai import configure, GenerativeModel

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")

# Configure the Gemini API client
configure(api_key=GEMINI_API_KEY)

# Initialize the Gemini model
model = GenerativeModel("gemini-2.0-flash")

# System prompt for travel context
TRAVEL_SYSTEM_PROMPT = """You are an expert Travel Specialist Agent. Your role is to:
- Help users plan their trips and vacations
- Suggest destinations based on preferences
- Provide travel tips and recommendations
- Assist with itinerary planning
- Share information about local cuisines, attractions, and culture
- Advise on travel safety and best practices

Be friendly, informative, and helpful in all your responses."""


@cl.on_chat_start
async def on_chat_start():
    print("Chat session started")
    await cl.Message(
        content="Hello! I'm your **Travel Specialist Agent** powered by Gemini.\n\n"
                "I can help you with:\n"
                "- Trip planning and itineraries\n"
                "- Destination recommendations\n"
                "- Local food and attractions\n"
                "- Travel tips and advice\n\n"
                "Where would you like to go?"
    ).send()


@cl.on_message
async def main(message: cl.Message):
    # Combine system prompt with user message for context
    full_prompt = f"{TRAVEL_SYSTEM_PROMPT}\n\nUser: {message.content}"

    # Generate response using Gemini
    response = model.generate_content(full_prompt)

    # Send the response back to the user
    await cl.Message(content=response.text).send()
