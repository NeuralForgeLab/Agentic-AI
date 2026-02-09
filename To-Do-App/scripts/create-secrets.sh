#!/bin/bash
# Task: T5-006 - Create Secrets Script
# From: specs/phase5-cloud/spec.md §5

set -e

echo "=========================================="
echo "  Create GCP Secrets"
echo "=========================================="

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo "Error: PROJECT_ID environment variable is not set"
    exit 1
fi

gcloud config set project $PROJECT_ID

echo ""
echo "This script will create secrets in GCP Secret Manager."
echo "You will be prompted for each secret value."
echo ""

# Function to create secret
create_secret() {
    local SECRET_NAME=$1
    local PROMPT=$2

    echo ""
    echo "Creating secret: $SECRET_NAME"
    echo -n "$PROMPT: "
    read -s SECRET_VALUE
    echo ""

    # Check if secret exists
    if gcloud secrets describe $SECRET_NAME &>/dev/null; then
        echo "Secret exists, adding new version..."
        echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=-
    else
        echo "Creating new secret..."
        echo -n "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME --data-file=-
    fi

    echo "Secret $SECRET_NAME created/updated successfully"
}

# Create secrets
create_secret "DATABASE_URL" "Enter DATABASE_URL (PostgreSQL connection string)"
create_secret "BETTER_AUTH_SECRET" "Enter BETTER_AUTH_SECRET (32+ character secret key)"
create_secret "GEMINI_API_KEY" "Enter GEMINI_API_KEY (from Google AI Studio)"

# Grant Cloud Run access
echo ""
echo "Granting Cloud Run access to secrets..."
COMPUTE_SA="${PROJECT_ID}-compute@developer.gserviceaccount.com"

for SECRET in DATABASE_URL BETTER_AUTH_SECRET GEMINI_API_KEY; do
    gcloud secrets add-iam-policy-binding $SECRET \
        --member="serviceAccount:$COMPUTE_SA" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet
done

echo ""
echo "=========================================="
echo "  Secrets Created Successfully!"
echo "=========================================="
echo ""
echo "Secrets in Secret Manager:"
gcloud secrets list --format="table(name)"
