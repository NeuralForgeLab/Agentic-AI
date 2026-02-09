#!/bin/bash
# Task: T5-006 - Cleanup Script
# From: specs/phase5-cloud/spec.md

set -e

echo "=========================================="
echo "  Cleanup GCP Resources"
echo "=========================================="

if [ -z "$PROJECT_ID" ]; then
    echo "Error: PROJECT_ID is not set"
    exit 1
fi

REGION=${REGION:-us-central1}

echo ""
echo "WARNING: This will delete all Cloud Run services and images!"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

gcloud config set project $PROJECT_ID

# Delete Cloud Run services
echo ""
echo "Deleting Cloud Run services..."
gcloud run services delete todo-backend --region=$REGION --quiet 2>/dev/null || echo "Backend service not found"
gcloud run services delete todo-frontend --region=$REGION --quiet 2>/dev/null || echo "Frontend service not found"

# Delete images from Artifact Registry
echo ""
echo "Deleting images from Artifact Registry..."
gcloud artifacts docker images delete \
    $REGION-docker.pkg.dev/$PROJECT_ID/todo-repo/todo-backend --quiet 2>/dev/null || echo "Backend images not found"
gcloud artifacts docker images delete \
    $REGION-docker.pkg.dev/$PROJECT_ID/todo-repo/todo-frontend --quiet 2>/dev/null || echo "Frontend images not found"

echo ""
echo "=========================================="
echo "  Cleanup Complete!"
echo "=========================================="
echo ""
echo "Note: Secrets and Artifact Registry repository were NOT deleted."
echo "To delete secrets: gcloud secrets delete SECRET_NAME"
echo "To delete repo: gcloud artifacts repositories delete todo-repo --location=$REGION"
