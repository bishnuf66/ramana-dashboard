import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch customers (from orders table)
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

    console.log("API: Fetching customers with params:", {
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    // Get unique customers from orders
    let query = supabase.from("orders").select(`
        customer_name,
        customer_email,
        customer_phone,
        total_amount,
        created_at,
        order_status
      `);

    // Apply search filter
    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%`,
      );
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      console.error("API: Customers fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Customers fetched successfully:", data?.length || 0);
    return NextResponse.json({
      success: true,
      customers: data || [],
    });
  } catch (error: any) {
    console.error("API: Customers fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create customer
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const customer = await request.json();

    console.log("API: Creating customer:", customer);

    const { data, error } = await supabase
      .from("users")
      .insert([customer])
      .select();

    if (error) {
      console.error("API: Customer creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Customer created successfully:", data);
    return NextResponse.json({
      success: true,
      customer: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Customer creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update customer
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id, ...customerData } = await request.json();

    console.log("API: Updating customer:", { id, customerData });

    const { data, error } = await supabase
      .from("users")
      .update({ ...customerData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("API: Customer update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Customer updated successfully:", data);
    return NextResponse.json({
      success: true,
      customer: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Customer update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete customer
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await request.json();

    console.log("API: Deleting customer:", { id });

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("API: Customer deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Customer deleted successfully");
    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("API: Customer deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
