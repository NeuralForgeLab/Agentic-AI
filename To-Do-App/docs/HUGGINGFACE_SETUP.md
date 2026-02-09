# Hugging Face Spaces Deployment Guide

This guide explains how to deploy the Todo App to Hugging Face Spaces.

## Overview

Hugging Face Spaces provides FREE hosting for ML/AI applications with Docker support.

| Feature | Details |
|---------|---------|
| Cost | FREE |
| Docker Support | Yes |
| GPU Support | Optional (paid) |
| Custom Domain | Yes (paid) |
| Auto-deploy | Yes (from Git) |

## Prerequisites

1. [Hugging Face Account](https://huggingface.co/join) (free)
2. [Neon Database](https://neon.tech) (free PostgreSQL)
3. [Google AI Studio](https://aistudio.google.com) API key for Gemini

## Deployment Steps

### Step 1: Create Backend Space

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Configure:
   - **Space name**: `todo-backend`
   - **License**: MIT
   - **SDK**: Docker
   - **Hardware**: CPU Basic (free)
4. Click "Create Space"

### Step 2: Upload Backend Files

Upload these files to your backend space:

```
todo-backend/
├── README.md          # Copy from huggingface/backend/README.md
├── Dockerfile         # Copy from huggingface/backend/Dockerfile
├── requirements.txt   # Copy from backend/requirements.txt
└── app/               # Copy entire backend/app/ folder
    ├── __init__.py
    ├── main.py
    ├── config.py
    ├── database.py
    ├── auth.py
    ├── models/
    ├── schemas/
    ├── routes/
    └── services/
```

### Step 3: Configure Backend Secrets

In Space Settings > Repository secrets, add:

| Secret | Value |
|--------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` |
| `BETTER_AUTH_URL` | `https://YOUR-USERNAME-todo-frontend.hf.space` |
| `BETTER_AUTH_SECRET` | Your secret key (generate secure random string) |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `CORS_ORIGINS` | `["https://YOUR-USERNAME-todo-frontend.hf.space"]` |

### Step 4: Create Frontend Space

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Configure:
   - **Space name**: `todo-frontend`
   - **License**: MIT
   - **SDK**: Docker
   - **Hardware**: CPU Basic (free)
4. Click "Create Space"

### Step 5: Upload Frontend Files

Upload these files to your frontend space:

```
todo-frontend/
├── README.md              # Copy from huggingface/frontend/README.md
├── Dockerfile             # Copy from huggingface/frontend/Dockerfile
├── package.json
├── package-lock.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── app/                   # Copy entire frontend/app/ folder
├── components/            # Copy entire frontend/components/ folder
├── lib/                   # Copy entire frontend/lib/ folder
├── types/                 # Copy entire frontend/types/ folder
└── public/                # Copy if exists
```

### Step 6: Configure Frontend Secrets

In Space Settings > Repository secrets, add:

| Secret | Value |
|--------|-------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-USERNAME-todo-backend.hf.space` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `https://YOUR-USERNAME-todo-frontend.hf.space` |
| `DATABASE_URL` | Same as backend |
| `BETTER_AUTH_SECRET` | Same as backend |

### Step 7: Configure Build Arguments

For frontend, add build arguments in Settings:

```
NEXT_PUBLIC_API_URL=https://YOUR-USERNAME-todo-backend.hf.space
NEXT_PUBLIC_BETTER_AUTH_URL=https://YOUR-USERNAME-todo-frontend.hf.space
```

## Access URLs

After deployment:

- **Frontend**: `https://YOUR-USERNAME-todo-frontend.hf.space`
- **Backend API**: `https://YOUR-USERNAME-todo-backend.hf.space`
- **API Docs**: `https://YOUR-USERNAME-todo-backend.hf.space/docs`

## Alternative: Deploy via Git

You can also connect your GitHub repository to Hugging Face:

1. In Space Settings, go to "Linked repository"
2. Connect your GitHub account
3. Select repository and branch
4. Hugging Face will auto-deploy on push

### Repository Structure for Git Deploy

For backend space, use subdirectory:
```
# In Space Settings > Files
# Set "App directory" to: backend
```

## Troubleshooting

### Build Fails

1. Check Dockerfile syntax
2. Verify all required files are uploaded
3. Check build logs in Space "Logs" tab

### App Won't Start

1. Verify port 7860 is exposed
2. Check environment variables are set
3. Review runtime logs

### CORS Errors

1. Verify `CORS_ORIGINS` includes frontend URL
2. Check URL format (https, no trailing slash)

### Database Connection Failed

1. Verify `DATABASE_URL` is correct
2. Check Neon database is active
3. Verify IP allowlist (Hugging Face IPs)

## Cost Summary

| Service | Cost |
|---------|------|
| Backend Space | FREE |
| Frontend Space | FREE |
| Neon Database | FREE (0.5GB) |
| Gemini API | FREE tier available |
| **Total** | **$0/month** |

## Limitations (Free Tier)

- Spaces sleep after 48 hours of inactivity
- Wake-up takes ~30 seconds
- 16GB RAM, 2 vCPU limit
- No persistent storage (use external DB)
