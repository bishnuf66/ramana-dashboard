import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Count user payments
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";

    console.log("API: Counting payments with params:", {
      search,
      status,
      paymentMethod,
    });

    let query = supabase
      .from("user_payments")
      .select("*", { count: "exact", head: true });

    // Apply search filter
    if (search) {
      query = query.or(`
        transaction_id.ilike.%${search}%,
        payment_method.ilike.%${search}%,
        orders.customer_name.ilike.%${search}%,
        orders.customer_email.ilike.%${search}%
      `);
    }

    // Apply status filter
    if (status && status !== "all") {
      if (status === "verified") {
        query = query.eq("is_verified", true);
      } else if (status === "pending") {
        query = query.eq("is_verified", false);
      }
    }

    // Apply payment method filter
    if (paymentMethod) {
      query = query.eq("payment_method", paymentMethod);
    }

    const { count, error } = await query;

    if (error) {
      console.error("API: Payments count error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payments counted successfully:", count);
    return NextResponse.json({
      success: true,
      count: count || 0,
    });
  } catch (error: any) {
    console.error("API: Payments count error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
