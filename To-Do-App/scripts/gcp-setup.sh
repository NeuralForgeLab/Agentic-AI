#!/bin/bash
# Task: T5-006 - GCP Setup Script
# From: specs/phase5-cloud/spec.md §7

set -e

echo "=========================================="
echo "  GCP Setup for Evolution of Todo"
echo "=========================================="

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo "Error: PROJECT_ID environment variable is not set"
    echo "Usage: PROJECT_ID=your-project-id ./gcp-setup.sh"
    exit 1
fi

# Set defaults
REGION=${REGION:-us-central1}
REPO_NAME=${REPO_NAME:-todo-repo}
SA_NAME=${SA_NAME:-github-actions}

echo ""
echo "Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Repository: $REPO_NAME"
echo "  Service Account: $SA_NAME"
echo ""

# Set project
echo "Setting project..."
gcloud config set project $PROJECT_ID

# Enable APIs
echo ""
echo "Enabling required APIs..."
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    cloudbuild.googleapis.com \
    iam.googleapis.com \
    iamcredentials.googleapis.com

# Create Artifact Registry repository
echo ""
echo "Creating Artifact Registry repository..."
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Todo app Docker images" \
    2>/dev/null || echo "Repository already exists"

# Create service account
echo ""
echo "Creating service account..."
gcloud iam service-accounts create $SA_NAME \
    --display-name="GitHub Actions Deployer" \
    2>/dev/null || echo "Service account already exists"

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant permissions
echo ""
echo "Granting permissions to service account..."
ROLES=(
    "roles/run.admin"
    "roles/artifactregistry.writer"
    "roles/secretmanager.secretAccessor"
    "roles/iam.serviceAccountUser"
)

for ROLE in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$ROLE" \
        --quiet
done

# Create Workload Identity Pool
echo ""
echo "Creating Workload Identity Pool..."
gcloud iam workload-identity-pools create "github-pool" \
    --project=$PROJECT_ID \
    --location="global" \
    --display-name="GitHub Actions Pool" \
    2>/dev/null || echo "Pool already exists"

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Run ./create-secrets.sh to create secrets"
echo "2. Configure Workload Identity Provider (see docs/GCP_SETUP.md)"
echo "3. Add GitHub repository secrets"
echo ""
echo "Service Account: $SA_EMAIL"
