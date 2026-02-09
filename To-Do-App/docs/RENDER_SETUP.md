# Render Deployment Guide - Evolution of Todo

Deploy the Todo application to Render for **FREE** with automatic GitHub deployments.

## Why Render?

- **100% Free** for this project
- No credit card required
- Auto-deploy from GitHub
- Free SSL certificates
- Simple dashboard

## Prerequisites

- GitHub account with your code pushed
- Render account (free): https://render.com

## Step 1: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended) or email
4. Verify your email

## Step 2: Connect GitHub Repository

1. In Render dashboard, click "New +"
2. Select "Blueprint"
3. Connect your GitHub account if not already connected
4. Select your `hackaton-2` repository
5. Render will auto-detect `render.yaml`

## Step 3: Configure Environment Variables

Before deploying, you need to set secret environment variables.

### Backend Service (todo-backend)

Click on the backend service and add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Your Neon database URL |
| `BETTER_AUTH_SECRET` | `your-32-char-secret` | Same as frontend |
| `GEMINI_API_KEY` | `AIza...` | Your Gemini API key |

### Frontend Service (todo-frontend)

Click on the frontend service and add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Your Neon database URL |
| `BETTER_AUTH_SECRET` | `your-32-char-secret` | Same as backend |

## Step 4: Deploy

1. Click "Apply" to start deployment
2. Wait for both services to build and deploy (~5-10 minutes first time)
3. Render will show you the URLs when ready

## Step 5: Update CORS and URLs

After deployment, you'll get URLs like:
- Backend: `https://todo-backend-xxxx.onrender.com`
- Frontend: `https://todo-frontend-xxxx.onrender.com`

### Update Backend CORS

1. Go to todo-backend service in Render
2. Go to Environment → Edit `CORS_ORIGINS`
3. Update to: `["https://todo-frontend-xxxx.onrender.com"]`
4. Click "Save Changes" (will auto-redeploy)

### Update Frontend URLs

1. Go to todo-frontend service in Render
2. Update these environment variables:
   - `BETTER_AUTH_URL`: `https://todo-frontend-xxxx.onrender.com`
   - `NEXT_PUBLIC_BETTER_AUTH_URL`: `https://todo-frontend-xxxx.onrender.com`
   - `NEXT_PUBLIC_API_URL`: `https://todo-backend-xxxx.onrender.com`
3. Click "Save Changes"

### Update Backend Auth URL

1. Go to todo-backend service
2. Update `BETTER_AUTH_URL`: `https://todo-frontend-xxxx.onrender.com`
3. Click "Save Changes"

## Step 6: Verify Deployment

1. Open frontend URL in browser
2. Sign up for a new account
3. Create a task
4. Test the AI chatbot

## Automatic Deployments

After initial setup, every push to `main` branch will:
1. Trigger automatic rebuild
2. Deploy new version
3. Zero downtime deployment

## Free Tier Limitations

| Limit | Value |
|-------|-------|
| Web Services | Unlimited (sleep after 15 min inactivity) |
| Build Minutes | 500/month |
| Bandwidth | 100 GB/month |

**Note:** Free tier services "sleep" after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

## Troubleshooting

### Build Failed

1. Check build logs in Render dashboard
2. Common issues:
   - Missing environment variables
   - Dockerfile path incorrect
   - npm/pip install failures

### Service Won't Start

1. Check deploy logs
2. Verify all environment variables are set
3. Check health check endpoint is working

### CORS Errors

1. Verify `CORS_ORIGINS` includes your frontend URL
2. Make sure URLs have `https://` prefix
3. No trailing slash in URLs

### Auth Not Working

1. Verify `BETTER_AUTH_SECRET` is same in both services
2. Check `BETTER_AUTH_URL` points to frontend
3. Verify `DATABASE_URL` is correct

## Cost Summary

| Service | Cost |
|---------|------|
| Backend | FREE |
| Frontend | FREE |
| Database | FREE (Neon) |
| SSL | FREE |
| **Total** | **$0/month** |

## Upgrading (Optional)

If you need always-on services without sleep:
- Starter plan: $7/month per service
- Includes more build minutes and no sleep

---

## Quick Reference

### URLs (after deployment)
```
Frontend: https://todo-frontend-xxxx.onrender.com
Backend:  https://todo-backend-xxxx.onrender.com
API Docs: https://todo-backend-xxxx.onrender.com/docs
```

### Manual Redeploy
1. Go to service in Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

### View Logs
1. Go to service in Render dashboard
2. Click "Logs" tab

---

**Need help?** Check [Render Documentation](https://render.com/docs) or [Community Forum](https://community.render.com)
