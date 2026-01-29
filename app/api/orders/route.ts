import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch all orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    console.log("API: Fetching orders with params:", { status, sortBy, sortOrder });

    let query = supabase
      .from("orders")
      .select(`
        *,
        user:users(id, email, full_name)
      `);

    // Apply status filter
    if (status) {
      query = query.eq("order_status", status);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, error } = await query;

    if (error) {
      console.error("API: Orders fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Orders fetched successfully:", data?.length || 0);
    return NextResponse.json({
      success: true,
      orders: data || [],
    });
  } catch (error: any) {
    console.error("API: Orders fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create order
export async function POST(request: NextRequest) {
  try {
    const order = await request.json();

    console.log("API: Creating order:", order);

    const { data, error } = await supabase
      .from("orders")
      .insert([order])
      .select();

    if (error) {
      console.error("API: Order creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Order created successfully:", data);
    return NextResponse.json({
      success: true,
      order: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update order
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    console.log("API: Updating order:", { id, updates });

    const { data, error } = await supabase
      .from("orders")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("API: Order update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Order updated successfully:", data);
    return NextResponse.json({
      success: true,
      order: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Order update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete order
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    console.log("API: Deleting order:", { id });

    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) {
      console.error("API: Order deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Order deleted successfully");
    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("API: Order deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
