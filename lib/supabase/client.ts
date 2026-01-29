import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create a fresh client instance
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null =
  null;

export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    // Add retry and error handling options
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        "X-Client-Info": "ramana-dashboard",
      },
    },
  },
);

// Helper function to refresh the client if needed
export const refreshSupabaseClient = () => {
  try {
    // Create a new client instance
    const newClient = createBrowserClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            "X-Client-Info": "ramana-dashboard",
          },
        },
      },
    );

    console.log("Supabase client refreshed");
    return newClient;
  } catch (error) {
    console.error("Failed to refresh Supabase client:", error);
    return supabase;
  }
};

// Add error handling wrapper with timeout
export const safeSupabaseOperation = async <T>(
  operation: () => Promise<T>,
  retries = 2,
  timeoutMs = 30000, // 30 seconds timeout
): Promise<T> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs,
        );
      });

      const result = await Promise.race([operation(), timeoutPromise]);

      return result;
    } catch (error: any) {
      console.error(
        `Supabase operation failed (attempt ${attempt + 1}):`,
        error,
      );

      // If it's a connection/auth error and we have retries left, try refreshing the client
      if (
        attempt < retries &&
        (error.message?.includes("fetch") ||
          error.message?.includes("auth") ||
          error.message?.includes("timed out"))
      ) {
        console.log("Retrying Supabase operation...");
        // Note: In a real scenario, you might want to recreate the client here
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
        continue;
      }

      throw error;
    }
  }

  throw new Error("Operation failed after all retries");
};
