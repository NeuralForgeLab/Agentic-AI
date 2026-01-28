import React, { ReactNode } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import ChatWidget from "../components/ChatWidget";

interface RootProps {
  children: ReactNode;
}

// Root component wraps the entire app with global providers
// This is a Docusaurus convention for adding context providers
export default function Root({ children }: RootProps): React.ReactElement {
  return (
    <AuthProvider>
      {children}
      <ChatWidget />
    </AuthProvider>
  );
}
