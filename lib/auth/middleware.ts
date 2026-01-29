import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client for server-side
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware to check if user is authenticated and is admin
export async function requireAuth(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    // Return the user and admin data
    return { user, adminUser };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// Helper function to create authenticated API handler
export function withAuth(handler: (req: NextRequest, context: any) => Promise<Response>) {
  return async (request: NextRequest, context: any) => {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      // This is an error response
      return authResult;
    }
    
    // Add user and admin data to the request context
    context.user = authResult.user;
    context.adminUser = authResult.adminUser;
    
    return handler(request, context);
  };
}
