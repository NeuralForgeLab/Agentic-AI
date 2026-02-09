import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      const message = getErrorMessage(err.message);
      setError(message);
      throw err;
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
  ): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            full_name: displayName,
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      const message = getErrorMessage(err.message);
      setError(message);
      throw err;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/physical-ai-textbook/",
        },
      });
      if (error) throw error;
    } catch (err: any) {
      const message = getErrorMessage(err.message);
      setError(message);
      throw err;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      const message = getErrorMessage(err.message);
      setError(message);
      throw err;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/physical-ai-textbook/auth/login",
      });
      if (error) throw error;
    } catch (err: any) {
      const message = getErrorMessage(err.message);
      setError(message);
      throw err;
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    return session?.access_token ?? null;
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
    clearError,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Helper function to get user-friendly error messages
function getErrorMessage(errorMessage: string): string {
  if (errorMessage.includes("Invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (errorMessage.includes("Email not confirmed")) {
    return "Please check your email and confirm your account.";
  }
  if (errorMessage.includes("User already registered")) {
    return "This email is already registered. Please sign in instead.";
  }
  if (errorMessage.includes("Password should be")) {
    return "Password must be at least 6 characters.";
  }
  if (errorMessage.includes("Unable to validate email")) {
    return "Invalid email address format.";
  }
  if (errorMessage.includes("rate limit")) {
    return "Too many attempts. Please try again later.";
  }
  return errorMessage || "An error occurred. Please try again.";
}

export default AuthContext;
