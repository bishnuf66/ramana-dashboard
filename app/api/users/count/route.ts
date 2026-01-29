import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Count users using Supabase auth admin API
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    console.log("API: Counting users with params:", { search });

    // Use Supabase auth admin API to list all users for counting
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000, // Get a large number to count all users
    });

    console.log("API: Auth admin count response:", {
      users: users?.length || 0,
      error,
    });

    if (error) {
      console.error("API: Auth admin count failed:", error);
      return NextResponse.json(
        {
          error: "Unable to count users from auth admin API",
          details: error.message,
        },
        { status: 500 },
      );
    }

    // Transform the data and apply search filter if needed
    let filteredUsers = users || [];
    if (search) {
      filteredUsers =
        users?.filter((user) =>
          user.email?.toLowerCase().includes(search.toLowerCase()),
        ) || [];
    }

    console.log("API: Users counted successfully:", filteredUsers.length);
    return NextResponse.json({
      success: true,
      count: filteredUsers.length,
    });
  } catch (error: any) {
    console.error("API: Users count error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
