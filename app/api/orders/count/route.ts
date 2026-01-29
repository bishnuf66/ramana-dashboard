import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Count orders
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    console.log("API: Counting orders with params:", { status, search });

    let query = supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    // Apply search filter
    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,id.ilike.%${search}%`,
      );
    }

    // Apply status filter (only if status is not "all")
    if (status && status !== "all") {
      query = query.eq("order_status", status);
    }

    const { count, error } = await query;

    if (error) {
      console.error("API: Orders count error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Orders counted successfully:", count);
    return NextResponse.json({
      success: true,
      count: count || 0,
    });
  } catch (error: any) {
    console.error("API: Orders count error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
