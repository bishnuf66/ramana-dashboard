import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase service role environment variables");
}

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function GET() {
  try {
    // Get admin users to exclude them
    const { data: adminUsers } = await supabaseAdmin
      .from("admin_users")
      .select("id");

    const adminIds = new Set(adminUsers?.map((au) => au.id) || []);

    // Get all users from auth.users
    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (error) throw error;

    // Filter out admin users
    const regularUsers = users.filter((user) => !adminIds.has(user.id));

    const usersList = regularUsers.map((user) => ({
      id: user.id,
      email: user.email || "",
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at || null,
      display_name:
        user.user_metadata?.display_name || user.user_metadata?.name || null,
      user_metadata: user.user_metadata,
    }));

    return NextResponse.json({ users: usersList });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 },
    );
  }
}
