# Phase IV Specification: Local Kubernetes Deployment

## 1. Overview

### 1.1 Purpose
Deploy the Todo application (frontend, backend, and database) to a local Kubernetes cluster for container orchestration and scalability testing.

### 1.2 Goals
- Containerize frontend and backend applications using Docker
- Deploy to local Kubernetes cluster (Docker Desktop Kubernetes or minikube)
- Configure proper networking between services
- Implement health checks and readiness probes
- Manage configuration via ConfigMaps and Secrets

### 1.3 Non-Goals
- Production-grade high availability
- Cloud provider deployment (Phase V)
- CI/CD pipeline (Phase V)
- SSL/TLS termination

---

## 2. Architecture

### 2.1 Components
```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Frontend   │  │   Backend   │  │  External Database  │ │
│  │  (Next.js)  │  │  (FastAPI)  │  │   (Neon PostgreSQL) │ │
│  │  Port 3000  │  │  Port 8000  │  │                     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│  ┌──────┴──────┐  ┌──────┴──────┐             │            │
│  │   Service   │  │   Service   │             │            │
│  │ (ClusterIP) │  │ (ClusterIP) │◄────────────┘            │
│  └──────┬──────┘  └──────┬──────┘                          │
│         │                │                                  │
│  ┌──────┴────────────────┴──────┐                          │
│  │         Ingress              │                          │
│  │    (localhost routing)       │                          │
│  └──────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Container Images
| Image | Base | Port | Description |
|-------|------|------|-------------|
| todo-frontend | node:20-alpine | 3000 | Next.js application |
| todo-backend | python:3.11-slim | 8000 | FastAPI application |

### 2.3 Kubernetes Resources
| Resource | Name | Description |
|----------|------|-------------|
| Deployment | todo-frontend | Frontend pods |
| Deployment | todo-backend | Backend pods |
| Service | todo-frontend-svc | Frontend ClusterIP service |
| Service | todo-backend-svc | Backend ClusterIP service |
| ConfigMap | todo-config | Non-sensitive configuration |
| Secret | todo-secrets | Sensitive data (API keys, DB URL) |
| Ingress | todo-ingress | HTTP routing |

---

## 3. Docker Configuration

### 3.1 Frontend Dockerfile
- Multi-stage build for smaller image
- Build stage: Install dependencies and build Next.js
- Production stage: Run with Node.js
- Environment variables for API URL

### 3.2 Backend Dockerfile
- Python 3.11 slim base
- Install dependencies from requirements.txt
- Run with uvicorn
- Health check endpoint

### 3.3 Docker Compose (Optional)
- Local development testing before Kubernetes
- Service definitions for frontend and backend

---

## 4. Kubernetes Manifests

### 4.1 Namespace
- Create dedicated namespace: `todo-app`

### 4.2 ConfigMap
```yaml
data:
  CORS_ORIGINS: '["http://localhost:3000"]'
  BETTER_AUTH_URL: "http://localhost:3000"
  GEMINI_MODEL: "gemini-2.5-flash"
```

### 4.3 Secrets
```yaml
data:
  DATABASE_URL: <base64-encoded>
  BETTER_AUTH_SECRET: <base64-encoded>
  GEMINI_API_KEY: <base64-encoded>
```

### 4.4 Deployments
- Replicas: 1 (for local development)
- Resource limits: CPU 500m, Memory 512Mi
- Liveness and readiness probes
- Environment variables from ConfigMap and Secrets

### 4.5 Services
- Type: ClusterIP
- Target ports: 3000 (frontend), 8000 (backend)

### 4.6 Ingress
- Host: localhost
- Paths:
  - `/` → frontend service
  - `/api` → backend service

---

## 5. Health Checks

### 5.1 Backend
- Endpoint: `GET /health`
- Expected response: `{"status": "healthy"}`
- Liveness probe: Every 30s
- Readiness probe: Every 10s

### 5.2 Frontend
- Endpoint: `GET /`
- Expected response: HTTP 200
- Liveness probe: Every 30s
- Readiness probe: Every 10s

---

## 6. Environment Configuration

### 6.1 Frontend Environment
| Variable | Source | Description |
|----------|--------|-------------|
| NEXT_PUBLIC_API_URL | ConfigMap | Backend API URL |
| BETTER_AUTH_SECRET | Secret | Auth secret |
| DATABASE_URL | Secret | Database connection |

### 6.2 Backend Environment
| Variable | Source | Description |
|----------|--------|-------------|
| DATABASE_URL | Secret | PostgreSQL connection |
| BETTER_AUTH_SECRET | Secret | JWT secret |
| GEMINI_API_KEY | Secret | Gemini API key |
| CORS_ORIGINS | ConfigMap | Allowed origins |

---

## 7. Deployment Steps

### 7.1 Prerequisites
- Docker Desktop with Kubernetes enabled, OR
- minikube installed and running
- kubectl configured

### 7.2 Build Steps
1. Build frontend Docker image
2. Build backend Docker image
3. Tag images for local registry

### 7.3 Deploy Steps
1. Create namespace
2. Apply ConfigMap
3. Apply Secrets
4. Apply Deployments
5. Apply Services
6. Apply Ingress
7. Verify pods are running

### 7.4 Verification
- Check pod status: `kubectl get pods -n todo-app`
- Check services: `kubectl get svc -n todo-app`
- Test endpoints via Ingress

---

## 8. Acceptance Criteria

- [ ] Frontend Docker image builds successfully
- [ ] Backend Docker image builds successfully
- [ ] All Kubernetes resources deploy without errors
- [ ] Pods reach Running state
- [ ] Health checks pass
- [ ] Frontend accessible via Ingress
- [ ] Backend API accessible via Ingress
- [ ] Application functions correctly (auth, tasks, chat)

---

## 9. File Structure

```
hackaton-2/
├── docker/
│   ├── frontend/
│   │   └── Dockerfile
│   └── backend/
│       └── Dockerfile
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   └── ingress.yaml
└── docker-compose.yaml (optional)
```
