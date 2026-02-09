# GCP Setup Guide for Evolution of Todo

This guide walks you through setting up Google Cloud Platform for deploying the Todo application.

## Prerequisites

- Google account
- Credit card (for verification, free tier available)
- gcloud CLI installed locally

## Step 1: Create GCP Project

### 1.1 Create Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Enter project details:
   - **Project name:** `todo-app-prod`
   - **Project ID:** `todo-app-prod-xxxxx` (auto-generated, note this down)
4. Click "Create"

### 1.2 Enable Billing

1. Go to Billing → Link a billing account
2. New users get $300 free credit for 90 days
3. Cloud Run has a generous free tier even after credits expire

## Step 2: Enable Required APIs

Run these commands in Google Cloud Shell or local terminal with gcloud:

```bash
# Set your project
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com
```

Or enable via Console:
1. Go to APIs & Services → Enable APIs and Services
2. Search and enable each:
   - Cloud Run API
   - Artifact Registry API
   - Secret Manager API
   - Cloud Build API
   - IAM API
   - IAM Service Account Credentials API

## Step 3: Create Artifact Registry Repository

```bash
# Set region
export REGION="us-central1"

# Create Docker repository
gcloud artifacts repositories create todo-repo \
  --repository-format=docker \
  --location=$REGION \
  --description="Todo app Docker images"
```

## Step 4: Create Service Account for GitHub Actions

### 4.1 Create Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer"

# Get the email
export SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
```

### 4.2 Grant Required Permissions

```bash
# Cloud Run Admin (deploy services)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"

# Artifact Registry Writer (push images)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/artifactregistry.writer"

# Secret Manager Accessor (read secrets)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

# Service Account User (deploy as service account)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/iam.serviceAccountUser"
```

## Step 5: Set Up Workload Identity Federation

This allows GitHub Actions to authenticate without storing long-lived credentials.

### 5.1 Create Workload Identity Pool

```bash
# Create identity pool
gcloud iam workload-identity-pools create "github-pool" \
  --project=$PROJECT_ID \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Get the pool ID
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe github-pool \
  --project=$PROJECT_ID \
  --location="global" \
  --format="value(name)")
```

### 5.2 Create Workload Identity Provider

```bash
# Replace YOUR_GITHUB_USERNAME with your GitHub username
export GITHUB_REPO="YOUR_GITHUB_USERNAME/hackaton-2"

gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project=$PROJECT_ID \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### 5.3 Allow GitHub to Impersonate Service Account

```bash
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${GITHUB_REPO}"
```

### 5.4 Get Workload Identity Provider Resource Name

```bash
# This is needed for GitHub Actions
gcloud iam workload-identity-pools providers describe github-provider \
  --project=$PROJECT_ID \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)"
```

Save this output - you'll need it for GitHub secrets.

## Step 6: Store Secrets in Secret Manager

```bash
# Create secrets (replace with your actual values)

# Database URL
echo -n "postgresql://user:pass@host/db?sslmode=require" | \
  gcloud secrets create DATABASE_URL --data-file=-

# Better Auth Secret
echo -n "your-32-char-secret-key-here" | \
  gcloud secrets create BETTER_AUTH_SECRET --data-file=-

# Gemini API Key
echo -n "your-gemini-api-key" | \
  gcloud secrets create GEMINI_API_KEY --data-file=-
```

Grant Cloud Run access to secrets:

```bash
# Get Cloud Run service account
export CLOUD_RUN_SA="${PROJECT_ID}-compute@developer.gserviceaccount.com"

# Grant access to each secret
for SECRET in DATABASE_URL BETTER_AUTH_SECRET GEMINI_API_KEY; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:$CLOUD_RUN_SA" \
    --role="roles/secretmanager.secretAccessor"
done
```

## Step 7: Configure GitHub Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `GCP_PROJECT_ID` | Your GCP project ID |
| `GCP_REGION` | `us-central1` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Output from Step 5.4 |
| `GCP_SERVICE_ACCOUNT` | `github-actions@PROJECT_ID.iam.gserviceaccount.com` |

## Step 8: Verify Setup

Run this to verify everything is configured:

```bash
# Check APIs are enabled
gcloud services list --enabled | grep -E "(run|artifact|secret|cloudbuild)"

# Check service account exists
gcloud iam service-accounts list | grep github-actions

# Check secrets exist
gcloud secrets list

# Check Artifact Registry repo exists
gcloud artifacts repositories list --location=$REGION
```

## Cost Estimation

| Service | Free Tier | Estimated Cost After Free Tier |
|---------|-----------|-------------------------------|
| Cloud Run | 2M requests/month, 360K GB-seconds | ~$0.00-5.00/month for low traffic |
| Artifact Registry | 500MB storage | ~$0.10/GB/month |
| Secret Manager | 6 active secret versions | ~$0.06/version/month |
| Cloud Build | 120 build-minutes/day | ~$0.003/build-minute |

**For a small personal project, this should be FREE or under $5/month.**

## Troubleshooting

### Error: Permission denied

```bash
# Re-grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"
```

### Error: Workload Identity Federation failed

1. Verify the repository name matches exactly
2. Check the workload identity provider is correctly configured
3. Ensure the service account email is correct in GitHub secrets

### Error: Secret not found

```bash
# List secrets and verify
gcloud secrets list
gcloud secrets versions access latest --secret="SECRET_NAME"
```

## Next Steps

After completing this setup:
1. Push code to GitHub
2. GitHub Actions will automatically deploy
3. Access your app at the Cloud Run URLs

---

**Need help?** Check [Cloud Run documentation](https://cloud.google.com/run/docs) or [GitHub Actions for GCP](https://github.com/google-github-actions).
