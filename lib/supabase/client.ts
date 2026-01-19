import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Use the SSR helper so auth state is mirrored into cookies that
// middleware/server components can read, preventing false logouts.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

