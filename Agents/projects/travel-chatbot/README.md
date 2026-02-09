# Travel Chatbot Project

A complete travel assistant chatbot built with Google Gemini and Chainlit.

## Features

- Trip planning and itinerary suggestions
- Destination recommendations
- Local food and attractions info
- Travel tips and advice

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 Chainlit UI                      │
│            (Web Chat Interface)                 │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│               Gemini 2.0 Flash                   │
│          (Google Generative AI)                 │
│                                                  │
│   System Prompt: Travel Specialist Agent        │
└─────────────────────────────────────────────────┘
```

## Setup

1. Create a `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

2. Install dependencies:
   ```bash
   pip install google-generativeai chainlit python-dotenv
   ```

3. Run the chatbot:
   ```bash
   chainlit run app.py
   ```

## Example Conversations

**User:** "I want to visit Japan in April"

**Bot:** "April is a wonderful time to visit Japan! Here's why:

- **Cherry Blossom Season**: Experience the famous sakura blooming
- **Weather**: Mild temperatures (15-20°C)
- **Festivals**: Hanami (flower viewing) celebrations

**Recommended Itinerary:**
1. Tokyo (3-4 days)
2. Kyoto (2-3 days)
3. Osaka (1-2 days)

Would you like detailed recommendations for any of these cities?"

## Deployment

This project is configured for deployment on Hugging Face Spaces using Docker.

```yaml
title: Travel Agent
sdk: docker
app_port: 8000
```
