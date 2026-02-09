# Phase V: Advanced Cloud Deployment - Specification

## 1. Overview

### 1.1 Purpose
Deploy the Evolution of Todo application to a cloud platform with CI/CD automation, monitoring, and production-ready infrastructure.

### 1.2 Scope
- Cloud platform deployment (Google Cloud Platform - GCP)
- CI/CD pipeline with GitHub Actions
- Container registry (Google Artifact Registry)
- Cloud Run or GKE deployment
- SSL/TLS configuration
- Monitoring and logging
- Environment management (staging/production)

### 1.3 Out of Scope
- Multi-region deployment
- Advanced auto-scaling policies
- Custom domain purchase (use provided URLs)

## 2. Functional Requirements

### 2.1 CI/CD Pipeline
| Requirement | Description |
|-------------|-------------|
| FR-5.1 | Automated builds on push to main branch |
| FR-5.2 | Run tests before deployment |
| FR-5.3 | Build and push Docker images to registry |
| FR-5.4 | Deploy to staging environment |
| FR-5.5 | Manual approval for production deployment |

### 2.2 Cloud Infrastructure
| Requirement | Description |
|-------------|-------------|
| FR-5.6 | Deploy backend to Cloud Run |
| FR-5.7 | Deploy frontend to Cloud Run |
| FR-5.8 | Configure environment variables securely |
| FR-5.9 | Set up HTTPS with managed certificates |
| FR-5.10 | Configure health checks and auto-restart |

### 2.3 Monitoring & Logging
| Requirement | Description |
|-------------|-------------|
| FR-5.11 | Centralized logging (Cloud Logging) |
| FR-5.12 | Application metrics collection |
| FR-5.13 | Error alerting |

## 3. Technical Architecture

### 3.1 Cloud Platform: Google Cloud Platform (GCP)

**Why GCP:**
- Generous free tier ($300 credit for new users)
- Cloud Run offers serverless containers (pay per use)
- Integrated CI/CD with Cloud Build
- Managed SSL certificates
- Excellent integration with GitHub

### 3.2 Architecture Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │              GitHub Repository               │
                    └─────────────────┬───────────────────────────┘
                                      │ Push to main
                                      ▼
                    ┌─────────────────────────────────────────────┐
                    │            GitHub Actions CI/CD              │
                    │  ┌─────────┐ ┌─────────┐ ┌─────────────┐   │
                    │  │  Test   │→│  Build  │→│Push to GCR  │   │
                    │  └─────────┘ └─────────┘ └─────────────┘   │
                    └─────────────────┬───────────────────────────┘
                                      │ Deploy
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Google Cloud Platform                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Artifact Registry                          │  │
│  │   ┌─────────────────┐    ┌─────────────────┐                 │  │
│  │   │ backend:latest  │    │ frontend:latest │                 │  │
│  │   └─────────────────┘    └─────────────────┘                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                       Cloud Run                               │  │
│  │   ┌─────────────────┐    ┌─────────────────┐                 │  │
│  │   │ todo-backend    │    │ todo-frontend   │                 │  │
│  │   │ (FastAPI)       │    │ (Next.js)       │                 │  │
│  │   │ Port 8000       │    │ Port 3000       │                 │  │
│  │   └────────┬────────┘    └────────┬────────┘                 │  │
│  │            │                      │                           │  │
│  │            ▼                      ▼                           │  │
│  │   https://backend-xxx.run.app   https://frontend-xxx.run.app │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐                      │
│  │  Secret Manager  │    │  Cloud Logging   │                      │
│  │  - DB URL        │    │  - App logs      │                      │
│  │  - API Keys      │    │  - Error alerts  │                      │
│  └──────────────────┘    └──────────────────┘                      │
└─────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────────────┐
                    │           Neon PostgreSQL                    │
                    │         (External Database)                  │
                    └─────────────────────────────────────────────┘
```

### 3.3 Services Used

| Service | Purpose | Cost |
|---------|---------|------|
| Cloud Run | Serverless container hosting | Pay per request (free tier: 2M requests/month) |
| Artifact Registry | Docker image storage | Free tier: 500MB |
| Secret Manager | Secure secrets storage | Free tier: 6 active versions |
| Cloud Logging | Centralized logs | Free tier: 50GB/month |
| Cloud Build | CI/CD builds | Free tier: 120 min/day |

## 4. CI/CD Pipeline Design

### 4.1 Workflow Triggers

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

### 4.2 Pipeline Stages

1. **Test Stage**
   - Run backend tests (pytest)
   - Run frontend tests (if any)
   - Lint code

2. **Build Stage**
   - Build backend Docker image
   - Build frontend Docker image
   - Tag with commit SHA

3. **Push Stage**
   - Authenticate to GCP
   - Push images to Artifact Registry

4. **Deploy Stage**
   - Deploy backend to Cloud Run
   - Deploy frontend to Cloud Run
   - Run smoke tests

## 5. Security Requirements

### 5.1 Secrets Management
- All secrets stored in GCP Secret Manager
- No secrets in code or environment files
- Secrets accessed at runtime via service account

### 5.2 Authentication
- Service account with minimal permissions
- Workload Identity Federation for GitHub Actions
- No long-lived credentials in CI/CD

### 5.3 Network Security
- HTTPS only (managed SSL)
- CORS configured for frontend domain
- Cloud Run ingress set to "all" (public)

## 6. Environment Configuration

### 6.1 Environment Variables

**Backend (Cloud Run):**
```
DATABASE_URL=<from-secret-manager>
BETTER_AUTH_SECRET=<from-secret-manager>
BETTER_AUTH_URL=https://frontend-xxx.run.app
GEMINI_API_KEY=<from-secret-manager>
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGINS=["https://frontend-xxx.run.app"]
```

**Frontend (Cloud Run):**
```
DATABASE_URL=<from-secret-manager>
BETTER_AUTH_SECRET=<from-secret-manager>
BETTER_AUTH_URL=https://frontend-xxx.run.app
NEXT_PUBLIC_API_URL=https://backend-xxx.run.app
```

## 7. Acceptance Criteria

- [ ] GitHub Actions workflow runs on push
- [ ] Docker images pushed to Artifact Registry
- [ ] Backend accessible via Cloud Run URL
- [ ] Frontend accessible via Cloud Run URL
- [ ] HTTPS enabled with valid certificate
- [ ] Environment variables loaded from Secret Manager
- [ ] Logs visible in Cloud Logging
- [ ] Application fully functional in cloud

## 8. Prerequisites

### 8.1 Required Accounts
- Google Cloud Platform account (free tier available)
- GitHub account (for repository and Actions)

### 8.2 Required Tools
- gcloud CLI (Google Cloud SDK)
- Docker (for local testing)

### 8.3 GCP Setup Steps
1. Create GCP project
2. Enable required APIs (Cloud Run, Artifact Registry, Secret Manager)
3. Create service account for GitHub Actions
4. Set up Workload Identity Federation
5. Store secrets in Secret Manager
