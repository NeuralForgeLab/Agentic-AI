import React, { useEffect } from "react";
import { useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useAuth } from "../../contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

// Routes that require authentication
const PROTECTED_ROUTES = ["/docs", "/podcast", "/labs"];

export default function AuthGuard({
  children,
}: AuthGuardProps): React.ReactElement | null {
  const { user, loading } = useAuth();
  const location = useLocation();
  const loginUrl = useBaseUrl("/auth/login");
  const baseUrl = useBaseUrl("/");

  // Check if current path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => {
    const fullRoute = baseUrl + route.slice(1);
    return location.pathname.startsWith(fullRoute);
  });

  useEffect(() => {
    if (!loading && !user && isProtectedRoute) {
      const returnUrl = encodeURIComponent(location.pathname);
      window.location.href = `${loginUrl}?returnUrl=${returnUrl}`;
    }
  }, [user, loading, location.pathname, loginUrl, isProtectedRoute]);

  // Show loading only for protected routes
  if (loading && isProtectedRoute) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          fontSize: "1.2rem",
        }}
      >
        Loading...
      </div>
    );
  }

  // Block access to protected routes if not authenticated
  if (!user && isProtectedRoute) {
    return null;
  }

  return <>{children}</>;
}
