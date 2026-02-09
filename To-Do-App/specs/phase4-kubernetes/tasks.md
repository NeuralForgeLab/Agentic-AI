# Phase IV Tasks: Local Kubernetes Deployment

## Task Overview

| Task ID | Description | Status | Dependencies |
|---------|-------------|--------|--------------|
| T4-001 | Create Backend Dockerfile | pending | - |
| T4-002 | Create Frontend Dockerfile | pending | - |
| T4-003 | Create docker-compose.yaml for local testing | pending | T4-001, T4-002 |
| T4-004 | Test Docker builds locally | pending | T4-003 |
| T4-005 | Create Kubernetes namespace manifest | pending | - |
| T4-006 | Create ConfigMap manifest | pending | T4-005 |
| T4-007 | Create Secrets manifest | pending | T4-005 |
| T4-008 | Create Backend Deployment manifest | pending | T4-006, T4-007 |
| T4-009 | Create Backend Service manifest | pending | T4-008 |
| T4-010 | Create Frontend Deployment manifest | pending | T4-006, T4-007 |
| T4-011 | Create Frontend Service manifest | pending | T4-010 |
| T4-012 | Create Ingress manifest | pending | T4-009, T4-011 |
| T4-013 | Deploy to Kubernetes and verify | pending | T4-012 |
| T4-014 | Update README for Phase IV | pending | T4-013 |

---

## Detailed Tasks

### T4-001: Create Backend Dockerfile
**Priority**: High

**Description**: Create Dockerfile for the FastAPI backend application.

**Acceptance Criteria**:
- [ ] Multi-stage build (optional for backend)
- [ ] Python 3.11-slim base image
- [ ] Install dependencies from requirements.txt
- [ ] Copy application code
- [ ] Expose port 8000
- [ ] Run with uvicorn
- [ ] Health check instruction

**Artifacts**:
- `docker/backend/Dockerfile`

---

### T4-002: Create Frontend Dockerfile
**Priority**: High

**Description**: Create Dockerfile for the Next.js frontend application.

**Acceptance Criteria**:
- [ ] Multi-stage build for smaller image
- [ ] Node 20 alpine base image
- [ ] Build stage: npm install and npm run build
- [ ] Production stage: npm start
- [ ] Expose port 3000
- [ ] Environment variables support

**Artifacts**:
- `docker/frontend/Dockerfile`

---

### T4-003: Create docker-compose.yaml
**Priority**: Medium

**Description**: Create Docker Compose file for local testing before Kubernetes.

**Acceptance Criteria**:
- [ ] Frontend service definition
- [ ] Backend service definition
- [ ] Network configuration
- [ ] Environment variables
- [ ] Port mappings

**Artifacts**:
- `docker-compose.yaml`

---

### T4-004: Test Docker Builds Locally
**Priority**: High

**Description**: Build and test Docker images locally.

**Acceptance Criteria**:
- [ ] Backend image builds without errors
- [ ] Frontend image builds without errors
- [ ] Containers start successfully
- [ ] Health endpoints respond
- [ ] Application works end-to-end

**Commands**:
```bash
docker-compose build
docker-compose up
```

---

### T4-005: Create Kubernetes Namespace Manifest
**Priority**: High

**Description**: Create namespace for Todo application.

**Acceptance Criteria**:
- [ ] Namespace named `todo-app`
- [ ] Labels for organization

**Artifacts**:
- `k8s/namespace.yaml`

---

### T4-006: Create ConfigMap Manifest
**Priority**: High

**Description**: Create ConfigMap for non-sensitive configuration.

**Acceptance Criteria**:
- [ ] CORS_ORIGINS configuration
- [ ] BETTER_AUTH_URL
- [ ] GEMINI_MODEL
- [ ] NEXT_PUBLIC_API_URL

**Artifacts**:
- `k8s/configmap.yaml`

---

### T4-007: Create Secrets Manifest
**Priority**: High

**Description**: Create Secrets for sensitive data.

**Acceptance Criteria**:
- [ ] DATABASE_URL (base64 encoded)
- [ ] BETTER_AUTH_SECRET (base64 encoded)
- [ ] GEMINI_API_KEY (base64 encoded)

**Artifacts**:
- `k8s/secrets.yaml`

---

### T4-008: Create Backend Deployment Manifest
**Priority**: High

**Description**: Create Kubernetes Deployment for backend.

**Acceptance Criteria**:
- [ ] 1 replica
- [ ] Image: todo-backend:latest
- [ ] Environment from ConfigMap and Secrets
- [ ] Resource limits (CPU: 500m, Memory: 512Mi)
- [ ] Liveness probe on /health
- [ ] Readiness probe on /health

**Artifacts**:
- `k8s/backend-deployment.yaml`

---

### T4-009: Create Backend Service Manifest
**Priority**: High

**Description**: Create Kubernetes Service for backend.

**Acceptance Criteria**:
- [ ] Type: ClusterIP
- [ ] Port: 8000
- [ ] Selector matches deployment

**Artifacts**:
- `k8s/backend-service.yaml`

---

### T4-010: Create Frontend Deployment Manifest
**Priority**: High

**Description**: Create Kubernetes Deployment for frontend.

**Acceptance Criteria**:
- [ ] 1 replica
- [ ] Image: todo-frontend:latest
- [ ] Environment from ConfigMap and Secrets
- [ ] Resource limits (CPU: 500m, Memory: 512Mi)
- [ ] Liveness probe on /
- [ ] Readiness probe on /

**Artifacts**:
- `k8s/frontend-deployment.yaml`

---

### T4-011: Create Frontend Service Manifest
**Priority**: High

**Description**: Create Kubernetes Service for frontend.

**Acceptance Criteria**:
- [ ] Type: ClusterIP
- [ ] Port: 3000
- [ ] Selector matches deployment

**Artifacts**:
- `k8s/frontend-service.yaml`

---

### T4-012: Create Ingress Manifest
**Priority**: High

**Description**: Create Ingress for HTTP routing.

**Acceptance Criteria**:
- [ ] Host: localhost
- [ ] Path / → frontend service
- [ ] Path /api → backend service
- [ ] Annotations for ingress controller

**Artifacts**:
- `k8s/ingress.yaml`

---

### T4-013: Deploy to Kubernetes and Verify
**Priority**: High

**Description**: Deploy all resources and verify functionality.

**Acceptance Criteria**:
- [ ] All resources created successfully
- [ ] Pods in Running state
- [ ] Services have endpoints
- [ ] Ingress configured
- [ ] Application accessible
- [ ] Full functionality working

**Commands**:
```bash
kubectl apply -f k8s/
kubectl get all -n todo-app
kubectl logs -n todo-app <pod-name>
```

---

### T4-014: Update README for Phase IV
**Priority**: Medium

**Description**: Document Phase IV setup and deployment.

**Acceptance Criteria**:
- [ ] Docker build instructions
- [ ] Kubernetes deployment instructions
- [ ] Troubleshooting guide
- [ ] Architecture diagram

**Artifacts**:
- Update `README.md`

---

## Implementation Order

```
T4-001, T4-002 (parallel - Dockerfiles)
       │
       ▼
    T4-003 (docker-compose)
       │
       ▼
    T4-004 (test Docker builds)
       │
       ▼
    T4-005 (namespace)
       │
   ┌───┴───┐
   ▼       ▼
T4-006  T4-007 (ConfigMap, Secrets - parallel)
   │       │
   └───┬───┘
       │
   ┌───┴───┐
   ▼       ▼
T4-008  T4-010 (Deployments - parallel)
   │       │
   ▼       ▼
T4-009  T4-011 (Services - parallel)
   │       │
   └───┬───┘
       │
       ▼
    T4-012 (Ingress)
       │
       ▼
    T4-013 (Deploy & Verify)
       │
       ▼
    T4-014 (README)
```
