---
title: Todo App Frontend
emoji: 📝
colorFrom: purple
colorTo: pink
sdk: docker
pinned: false
license: mit
app_port: 7860
---

# Todo App Frontend

Next.js frontend for the Evolution of Todo application with AI-powered chatbot.

## Features

- User authentication (signup/signin)
- Task management dashboard
- AI chatbot for natural language task management
- Responsive design with Tailwind CSS

## Technology Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Better Auth

## Environment Variables

Required in Hugging Face Space settings:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_BETTER_AUTH_URL` - Auth URL (this frontend URL)
- `DATABASE_URL` - PostgreSQL for Better Auth
- `BETTER_AUTH_SECRET` - Auth secret key

## Authors

**Mansoor Siddiqui** & **Zeeshan Zubair**
