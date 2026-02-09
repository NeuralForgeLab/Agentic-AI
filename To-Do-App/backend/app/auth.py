"""
JWT authentication using PyJWT with EdDSA (Ed25519) support.
"""

from typing import Optional

import httpx
import jwt
from fastapi import Header, HTTPException, status
from jwt import PyJWKClient

from .config import get_settings

settings = get_settings()

# JWKS client with caching
_jwks_client: Optional[PyJWKClient] = None


class AuthError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class ForbiddenError(HTTPException):
    def __init__(self, detail: str = "Access denied"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def get_jwks_client() -> PyJWKClient:
    """Get or create JWKS client with caching."""
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{settings.better_auth_url}/api/auth/jwks"
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


def decode_jwt(token: str) -> dict:
    """Decode and verify JWT token using JWKS."""
    try:
        client = get_jwks_client()
        signing_key = client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA", "RS256", "ES256"],
            options={"verify_aud": False},
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise AuthError(f"Invalid token: {str(e)}")


async def verify_token(
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> str:
    """FastAPI dependency to verify JWT and extract user ID."""
    if not authorization:
        raise AuthError("Authorization header is required")

    if not authorization.startswith("Bearer "):
        raise AuthError("Invalid authorization header format")

    token = authorization[7:]
    payload = decode_jwt(token)

    user_id = payload.get("sub")
    if not user_id:
        raise AuthError("Token does not contain user ID")

    return user_id


def verify_user_access(token_user_id: str, path_user_id: str) -> None:
    """Verify user has access to the requested resource."""
    if token_user_id != path_user_id:
        raise ForbiddenError("You can only access your own resources")
