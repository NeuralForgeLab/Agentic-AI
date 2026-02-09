# Backend Deployment Guide (FREE Options)

## Current Status
- Frontend: LIVE at https://mansoor-siddiqui.github.io/physical-ai-textbook/
- Backend: Ready to deploy (choose one option below)

## Environment Variables Needed

```
GEMINI_API_KEY=AIzaSyAQuH-w2bfMQjJVzh7eukxKJl5tQrtuB18
QDRANT_URL=https://ce7be0b8-23f0-456c-aee9-a6774a57c077.europe-west3-0.gcp.cloud.qdrant.io
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.fk_xaKI8F2dBdSIFyWKqLqcH0IgXg-tPo0R7s5M6a1c
DATABASE_URL=postgresql://neondb_owner:npg_8XPU5OiSwstx@ep-quiet-forest-a5hinovzg-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
CORS_ORIGINS=https://mansoor-siddiqui.github.io,http://localhost:3000
```

---

## Option 1: Koyeb (Recommended - No Credit Card)

1. Go to https://www.koyeb.com
2. Sign up with GitHub (free, no credit card)
3. Click "Create App"
4. Select "GitHub" > Connect your account
5. Select repo: `Mansoor-Siddiqui/physical-ai-textbook`
6. Settings:
   - **Root directory**: `rag-backend`
   - **Builder**: Dockerfile
   - **Instance type**: Free (nano)
   - **Region**: Frankfurt or Washington
7. Add environment variables (see above)
8. Click "Deploy"

Your URL will be: `https://physical-ai-rag-<random>.koyeb.app`

---

## Option 2: Hugging Face Spaces (No Credit Card)

1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Settings:
   - **Name**: physical-ai-rag
   - **SDK**: Docker
   - **Hardware**: Free CPU
4. Clone locally: `git clone https://huggingface.co/spaces/YOUR_USERNAME/physical-ai-rag`
5. Copy contents of `rag-backend/` into the space
6. Add secrets in Space Settings > Repository secrets
7. Push to deploy

---

## Option 3: Fly.io (Free Tier - Needs Credit Card for Verification Only)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth signup  # or fly auth login

# Deploy
cd rag-backend
fly launch --name physical-ai-rag

# Set secrets
fly secrets set GEMINI_API_KEY=AIzaSyAQuH-w2bfMQjJVzh7eukxKJl5tQrtuB18
fly secrets set QDRANT_URL=https://ce7be0b8-23f0-456c-aee9-a6774a57c077.europe-west3-0.gcp.cloud.qdrant.io
fly secrets set QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.fk_xaKI8F2dBdSIFyWKqLqcH0IgXg-tPo0R7s5M6a1c
fly secrets set DATABASE_URL=postgresql://neondb_owner:npg_8XPU5OiSwstx@ep-quiet-forest-a5hinovzg-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
fly secrets set CORS_ORIGINS=https://mansoor-siddiqui.github.io,http://localhost:3000

# Deploy
fly deploy
```

Your URL: `https://physical-ai-rag.fly.dev`

---

## Option 4: Run Locally + ngrok (Instant, Temporary)

```bash
# Terminal 1: Run backend
cd rag-backend
pip install -r requirements.txt
uvicorn app.main:app --port 8000

# Terminal 2: Expose with ngrok (free)
# Download from https://ngrok.com/download
ngrok http 8000
```

Use the ngrok URL (e.g., `https://abc123.ngrok.io`) as your backend URL.

---

## After Deploying Backend

1. Test health: `curl https://YOUR_BACKEND_URL/health`
2. Test stats: `curl https://YOUR_BACKEND_URL/api/stats`
3. The chat widget on the frontend will automatically connect

---

## Quick Test Command

```bash
curl -X POST https://YOUR_BACKEND_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is ROS2?", "session_id": "test", "locale": "en"}'
```
