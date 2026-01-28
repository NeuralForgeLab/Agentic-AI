"""Firebase authentication service."""

from typing import Optional

from fastapi import HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings

# Firebase initialization status
_firebase_initialized = False
_firebase_available = False


def init_firebase():
    """Initialize Firebase Admin SDK (optional - won't fail if not configured)."""
    global _firebase_initialized, _firebase_available

    if _firebase_initialized:
        return _firebase_available

    _firebase_initialized = True
    settings = get_settings()

    # Check if Firebase is configured
    if (
        not settings.firebase_project_id
        or not settings.firebase_private_key
        or not settings.firebase_client_email
    ):
        print("Firebase not configured - authentication disabled")
        _firebase_available = False
        return False

    try:
        import firebase_admin
        from firebase_admin import credentials

        # Build credentials from environment variables
        # Handle escaped newlines in private key
        private_key = settings.firebase_private_key
        if "\\n" in private_key:
            private_key = private_key.replace("\\n", "\n")

        cred_dict = {
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key": private_key,
            "client_email": settings.firebase_client_email,
            "token_uri": "https://oauth2.googleapis.com/token",
        }

        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        _firebase_available = True
        print("Firebase initialized successfully")
        return True
    except Exception as e:
        print(f"Firebase initialization failed: {e}")
        print("Authentication will be disabled")
        _firebase_available = False
        return False


class FirebaseAuth(HTTPBearer):
    """Firebase authentication dependency for FastAPI."""

    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[dict]:
        """Verify Firebase JWT and return user info."""
        global _firebase_available

        # If Firebase is not available, return anonymous user or skip auth
        if not _firebase_available:
            if self.auto_error:
                # Return anonymous user for testing
                return {"uid": "anonymous", "email": None, "name": "Anonymous User"}
            return None

        credentials: HTTPAuthorizationCredentials = await super().__call__(request)

        if not credentials:
            if self.auto_error:
                raise HTTPException(status_code=401, detail="Not authenticated")
            return None

        if credentials.scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        try:
            from firebase_admin import auth

            # Verify the Firebase JWT
            decoded_token = auth.verify_id_token(credentials.credentials)
            return {
                "uid": decoded_token["uid"],
                "email": decoded_token.get("email"),
                "name": decoded_token.get("name"),
            }
        except Exception as e:
            if self.auto_error:
                raise HTTPException(
                    status_code=401, detail=f"Authentication failed: {str(e)}"
                )
            return None


# Create auth dependency
firebase_auth = FirebaseAuth()
firebase_auth_optional = FirebaseAuth(auto_error=False)
