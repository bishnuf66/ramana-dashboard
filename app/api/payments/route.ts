import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch user payments
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
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log("API: Fetching payments with params:", {
      search,
      status,
      paymentMethod,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    let query = supabase
      .from("user_payments")
      .select(`
        *,
        orders:order_id (
          customer_name,
          customer_email,
          customer_phone
        )
      `);

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
      } else if (status === "rejected") {
        query = query.eq("is_verified", false).eq("is_rejected", true);
      }
    }

    // Apply payment method filter
    if (paymentMethod && paymentMethod !== "all") {
      query = query.eq("payment_method", paymentMethod);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      console.error("API: Payments fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payments fetched successfully:", data?.length || 0);
    return NextResponse.json({
      success: true,
      userPayments: data || [],
    });
  } catch (error: any) {
    console.error("API: Payments fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create payment
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const payment = await request.json();

    console.log("API: Creating payment:", payment);

    const { data, error } = await supabase
      .from("user_payments")
      .insert([payment])
      .select();

    if (error) {
      console.error("API: Payment creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payment created successfully:", data);
    return NextResponse.json({
      success: true,
      userPayment: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Payment creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update payment
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id, ...updates } = await request.json();

    console.log("API: Updating payment:", { id, updates });

    const { data, error } = await supabase
      .from("user_payments")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("API: Payment update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payment updated successfully:", data);
    return NextResponse.json({
      success: true,
      userPayment: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Payment update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete payment
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    console.log("API: Deleting payment:", id);

    const { error } = await supabase
      .from("user_payments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("API: Payment deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payment deleted successfully:", id);
    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("API: Payment deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
