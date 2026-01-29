import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch all users using Supabase auth admin API
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log("API: Fetching users with params:", {
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    // Use Supabase auth admin API to list users
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: limit,
    });

    console.log("API: Auth admin response:", {
      users: users?.length || 0,
      error,
    });

    if (error) {
      console.error("API: Auth admin listUsers failed:", error);
      return NextResponse.json(
        {
          error: "Unable to fetch users from auth admin API",
          details: error.message,
        },
        { status: 500 },
      );
    }

    // Transform the data to match expected format
    const transformedUsers =
      users?.map((user) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: "user", // Default role since auth users don't have roles
        user_metadata: user.user_metadata,
        email_confirmed_at: user.email_confirmed_at,
      })) || [];

    // Apply search filter if needed (client-side filtering)
    let filteredUsers = transformedUsers;
    if (search) {
      filteredUsers = transformedUsers.filter((user) =>
        user.email?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Apply sorting
    filteredUsers.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] || "";
      const bValue = b[sortBy as keyof typeof b] || "";

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination after filtering and sorting
    const startIndex = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

    console.log("API: Users fetched successfully:", paginatedUsers.length);
    return NextResponse.json({
      success: true,
      users: paginatedUsers,
      total: filteredUsers.length, // Include total count for pagination
    });
  } catch (error: any) {
    console.error("API: Users fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create user
export async function POST(request: NextRequest) {
  try {
    const user = await request.json();

    console.log("API: Creating user:", user);

    const { data, error } = await supabase
      .from("users")
      .insert([user])
      .select();

    if (error) {
      console.error("API: User creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: User created successfully:", data);
    return NextResponse.json({
      success: true,
      user: data?.[0],
    });
  } catch (error: any) {
    console.error("API: User creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    console.log("API: Updating user:", { id, updates });

    const { data, error } = await supabase
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("API: User update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: User updated successfully:", data);
    return NextResponse.json({
      success: true,
      user: data?.[0],
    });
  } catch (error: any) {
    console.error("API: User update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    console.log("API: Deleting user:", { id });

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("API: User deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: User deleted successfully");
    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("API: User deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
