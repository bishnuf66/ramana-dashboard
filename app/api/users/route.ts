import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch all users
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "";

    console.log("API: Fetching users with params:", { role });

    let query = supabase
      .from("users")
      .select("id, email, full_name, role, created_at, updated_at");

    // Apply role filter
    if (role) {
      query = query.eq("role", role);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("API: Users fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Users fetched successfully:", data?.length || 0);
    return NextResponse.json({
      success: true,
      users: data || [],
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
