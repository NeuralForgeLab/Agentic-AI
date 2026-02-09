#!/bin/bash
# Task: T5-006 - Manual Deployment Script
# From: specs/phase5-cloud/spec.md §3

set -e

echo "=========================================="
echo "  Manual Deploy to Cloud Run"
echo "=========================================="

# Check required variables
if [ -z "$PROJECT_ID" ]; then
    echo "Error: PROJECT_ID is not set"
    exit 1
fi

REGION=${REGION:-us-central1}
REPO_NAME=${REPO_NAME:-todo-repo}
TAG=${TAG:-latest}

REGISTRY="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME"

echo ""
echo "Configuration:"
echo "  Project: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Registry: $REGISTRY"
echo "  Tag: $TAG"
echo ""

# Configure Docker
echo "Configuring Docker for Artifact Registry..."
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet

# Build and push backend
echo ""
echo "Building backend..."
docker build -t $REGISTRY/todo-backend:$TAG -f docker/backend/Dockerfile.cloud .

echo "Pushing backend..."
docker push $REGISTRY/todo-backend:$TAG

# Deploy backend
echo ""
echo "Deploying backend to Cloud Run..."
gcloud run deploy todo-backend \
    --image=$REGISTRY/todo-backend:$TAG \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --port=8000 \
    --set-secrets="DATABASE_URL=DATABASE_URL:latest,BETTER_AUTH_SECRET=BETTER_AUTH_SECRET:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest" \
    --set-env-vars="GEMINI_MODEL=gemini-2.5-flash,GEMINI_MAX_TOKENS=1024,GEMINI_TEMPERATURE=0.7,JWT_ALGORITHM=EdDSA"

# Get backend URL
BACKEND_URL=$(gcloud run services describe todo-backend --region=$REGION --format='value(status.url)')
echo ""
echo "Backend deployed: $BACKEND_URL"

# Build frontend with backend URL
echo ""
echo "Building frontend..."
docker build \
    -t $REGISTRY/todo-frontend:$TAG \
    -f docker/frontend/Dockerfile.cloud \
    --build-arg NEXT_PUBLIC_API_URL=$BACKEND_URL \
    .

echo "Pushing frontend..."
docker push $REGISTRY/todo-frontend:$TAG

# Deploy frontend
echo ""
echo "Deploying frontend to Cloud Run..."
gcloud run deploy todo-frontend \
    --image=$REGISTRY/todo-frontend:$TAG \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --port=3000 \
    --set-secrets="DATABASE_URL=DATABASE_URL:latest,BETTER_AUTH_SECRET=BETTER_AUTH_SECRET:latest" \
    --set-env-vars="NEXT_PUBLIC_API_URL=$BACKEND_URL"

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe todo-frontend --region=$REGION --format='value(status.url)')

# Update backend with frontend URL for CORS
echo ""
echo "Updating backend CORS configuration..."
gcloud run services update todo-backend \
    --region=$REGION \
    --update-env-vars="CORS_ORIGINS=[\"$FRONTEND_URL\"],BETTER_AUTH_URL=$FRONTEND_URL"

# Update frontend with its own URL
echo ""
echo "Updating frontend environment..."
gcloud run services update todo-frontend \
    --region=$REGION \
    --update-env-vars="BETTER_AUTH_URL=$FRONTEND_URL,NEXT_PUBLIC_BETTER_AUTH_URL=$FRONTEND_URL"

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo "API Docs: $BACKEND_URL/docs"
echo ""
echo "Testing health endpoint..."
curl -s $BACKEND_URL/health
echo ""
