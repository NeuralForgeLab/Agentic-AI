# Phase V: Advanced Cloud Deployment - Tasks

## Task Overview

| Task ID | Description | Dependencies | Status |
|---------|-------------|--------------|--------|
| T5-001 | Create GCP project setup guide | - | Pending |
| T5-002 | Create GitHub Actions workflow for CI | - | Pending |
| T5-003 | Create GitHub Actions workflow for CD | T5-002 | Pending |
| T5-004 | Update Dockerfiles for Cloud Run | - | Pending |
| T5-005 | Create Cloud Run service configurations | T5-004 | Pending |
| T5-006 | Create deployment scripts | T5-005 | Pending |
| T5-007 | Test deployment pipeline | T5-003, T5-006 | Pending |
| T5-008 | Update README for Phase V | T5-007 | Pending |

---

## T5-001: Create GCP Project Setup Guide

**Description:** Create documentation for setting up GCP project and required services.

**Acceptance Criteria:**
- [ ] Step-by-step GCP project creation guide
- [ ] API enablement instructions
- [ ] Service account setup instructions
- [ ] Workload Identity Federation setup
- [ ] Secret Manager configuration

**File:** `docs/GCP_SETUP.md`

---

## T5-002: Create GitHub Actions CI Workflow

**Description:** Create CI workflow for testing and building on pull requests.

**Acceptance Criteria:**
- [ ] Workflow triggers on PR to main
- [ ] Runs backend tests
- [ ] Builds Docker images (no push)
- [ ] Reports status to PR

**File:** `.github/workflows/ci.yml`

**Test Cases:**
```
TC-5.2.1: PR triggers CI workflow
TC-5.2.2: Failed tests block PR
TC-5.2.3: Successful build completes
```

---

## T5-003: Create GitHub Actions CD Workflow

**Description:** Create CD workflow for deploying to GCP Cloud Run.

**Acceptance Criteria:**
- [ ] Workflow triggers on push to main
- [ ] Authenticates to GCP via Workload Identity
- [ ] Builds and pushes images to Artifact Registry
- [ ] Deploys to Cloud Run
- [ ] Outputs deployment URLs

**File:** `.github/workflows/deploy.yml`

**Required Secrets:**
- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`

**Test Cases:**
```
TC-5.3.1: Push to main triggers deployment
TC-5.3.2: Images pushed to Artifact Registry
TC-5.3.3: Cloud Run services updated
TC-5.3.4: Deployment URLs accessible
```

---

## T5-004: Update Dockerfiles for Cloud Run

**Description:** Optimize Dockerfiles for Cloud Run deployment.

**Acceptance Criteria:**
- [ ] Backend listens on PORT environment variable
- [ ] Frontend configured for Cloud Run
- [ ] Images optimized for size
- [ ] Health check endpoints configured

**Files:**
- `docker/backend/Dockerfile.cloud`
- `docker/frontend/Dockerfile.cloud`

**Test Cases:**
```
TC-5.4.1: Backend starts on dynamic PORT
TC-5.4.2: Frontend serves correctly
TC-5.4.3: Health checks pass
```

---

## T5-005: Create Cloud Run Service Configurations

**Description:** Create Cloud Run service YAML configurations.

**Acceptance Criteria:**
- [ ] Backend service configuration
- [ ] Frontend service configuration
- [ ] Environment variables from secrets
- [ ] Memory and CPU limits defined
- [ ] Scaling parameters configured

**Files:**
- `cloud-run/backend-service.yaml`
- `cloud-run/frontend-service.yaml`

---

## T5-006: Create Deployment Scripts

**Description:** Create scripts for manual deployment and setup.

**Acceptance Criteria:**
- [ ] GCP setup script (enable APIs, create resources)
- [ ] Secret creation script
- [ ] Manual deployment script
- [ ] Cleanup script

**Files:**
- `scripts/gcp-setup.sh`
- `scripts/create-secrets.sh`
- `scripts/deploy.sh`
- `scripts/cleanup.sh`

---

## T5-007: Test Deployment Pipeline

**Description:** Test the complete deployment pipeline end-to-end.

**Acceptance Criteria:**
- [ ] CI workflow passes
- [ ] CD workflow deploys successfully
- [ ] Backend accessible via HTTPS
- [ ] Frontend accessible via HTTPS
- [ ] Full application flow works
- [ ] Logs visible in Cloud Logging

**Test Cases:**
```
TC-5.7.1: User can sign up in cloud
TC-5.7.2: User can sign in in cloud
TC-5.7.3: User can create tasks
TC-5.7.4: AI chatbot works
TC-5.7.5: Logs appear in Cloud Logging
```

---

## T5-008: Update README for Phase V

**Description:** Update project README with cloud deployment instructions.

**Acceptance Criteria:**
- [ ] Cloud deployment overview
- [ ] GCP setup prerequisites
- [ ] CI/CD pipeline documentation
- [ ] Environment variables documentation
- [ ] Troubleshooting guide

**File:** `README.md`

---

## Implementation Order

```
Phase 1: Setup (T5-001)
    │
    ▼
Phase 2: CI Pipeline (T5-002)
    │
    ▼
Phase 3: Docker Updates (T5-004)
    │
    ▼
Phase 4: Cloud Config (T5-005)
    │
    ▼
Phase 5: CD Pipeline (T5-003)
    │
    ▼
Phase 6: Scripts (T5-006)
    │
    ▼
Phase 7: Testing (T5-007)
    │
    ▼
Phase 8: Documentation (T5-008)
```
