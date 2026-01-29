import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Count payment options
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    console.log("API: Counting payment options with params:", { search, status });

    let query = supabase
      .from("payment_options")
      .select("*", { count: "exact", head: true });

    // Apply search filter
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,type.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Apply status filter
    if (status !== "all") {
      query = query.eq("is_active", status === "active");
    }

    const { count, error } = await query;

    if (error) {
      console.error("API: Payment options count error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payment options counted successfully:", count);
    return NextResponse.json({
      success: true,
      count: count || 0,
    });
  } catch (error: any) {
    console.error("API: Payment options count error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
