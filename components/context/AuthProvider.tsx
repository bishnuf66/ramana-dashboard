"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Admin {
  user: User;
  admin: any;
}

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  setAdmin: (admin: Admin | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state on mount
    const checkInitialAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Check if user is admin
          const { data: adminData } = await supabase
            .from("admin_users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (adminData) {
            console.log("AuthProvider: User is admin, setting admin state");
            setAdmin({ user: session.user, admin: adminData });
          } else {
            console.log(
              "AuthProvider: User is not admin, clearing admin state",
            );
            setAdmin(null);
          }
        } else {
          console.log("AuthProvider: No session found");
          setAdmin(null);
        }
      } catch (error) {
        console.error("AuthProvider: Initial auth check error:", error);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    checkInitialAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      console.log(
        "AuthProvider: Auth state changed:",
        session?.user ? "authenticated" : "not authenticated",
      );

      if (session?.user) {
        // Check if user is admin
        const checkAdmin = async () => {
          try {
            const { data: adminData } = await supabase
              .from("admin_users")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (adminData) {
              console.log("AuthProvider: User is admin, setting admin state");
              setAdmin({ user: session.user, admin: adminData });
            } else {
              console.log(
                "AuthProvider: User is not admin, clearing admin state",
              );
              setAdmin(null);
            }
          } catch (error) {
            console.error("Admin check error:", error);
            setAdmin(null);
          }
        };

        checkAdmin();
      } else {
        console.log("AuthProvider: User logged out, clearing admin state");
        setAdmin(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ admin, loading, setAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn("useAuth: Context is undefined, returning fallback");
    return { admin: null, loading: false, setAdmin: () => {} };
  }
  return context;
}
