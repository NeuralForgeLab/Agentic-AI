@echo off
echo ============================================
echo    Todo App - Kubernetes Deployment
echo ============================================
echo.

REM Check if kubectl is available
kubectl version --client >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: kubectl is not installed or not in PATH
    echo Please install kubectl: https://kubernetes.io/docs/tasks/tools/
    pause
    exit /b 1
)

REM Check if docker is available
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo Step 1: Building Docker images...
echo.

cd /d "%~dp0"

echo Building backend image...
docker build -t todo-backend:latest -f docker/backend/Dockerfile .
if %errorlevel% neq 0 (
    echo ERROR: Failed to build backend image
    pause
    exit /b 1
)

echo Building frontend image...
docker build -t todo-frontend:latest -f docker/frontend/Dockerfile .
if %errorlevel% neq 0 (
    echo ERROR: Failed to build frontend image
    pause
    exit /b 1
)

echo.
echo Step 2: Deploying to Kubernetes...
echo.

echo Creating namespace...
kubectl apply -f k8s/namespace.yaml

echo Creating ConfigMap...
kubectl apply -f k8s/configmap.yaml

echo Creating Secrets...
kubectl apply -f k8s/secrets.yaml

echo Deploying backend...
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

echo Deploying frontend...
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

echo Creating Ingress...
kubectl apply -f k8s/ingress.yaml

echo.
echo Step 3: Waiting for pods to be ready...
echo.
kubectl wait --for=condition=ready pod -l app=todo -n todo-app --timeout=120s

echo.
echo ============================================
echo    Deployment Complete!
echo ============================================
echo.
echo Checking status:
kubectl get all -n todo-app
echo.
echo Access the application:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo.
echo To view logs:
echo   kubectl logs -n todo-app -l component=backend
echo   kubectl logs -n todo-app -l component=frontend
echo.
pause
