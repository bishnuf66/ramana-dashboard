import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Count customers
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    console.log("API: Counting customers with params:", { search });

    let query = supabase
      .from("orders")
      .select("customer_email", { count: "exact", head: true });

    // Apply search filter
    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%`,
      );
    }

    const { count, error } = await query;

    if (error) {
      console.error("API: Customers count error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Customers counted successfully:", count);
    return NextResponse.json({
      success: true,
      count: count || 0,
    });
  } catch (error: any) {
    console.error("API: Customers count error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
