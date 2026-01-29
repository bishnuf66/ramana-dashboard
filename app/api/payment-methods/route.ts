import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch all payment methods
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    console.log("API: Fetching payment methods with params:", { status, sortBy, sortOrder });

    let query = supabase
      .from("payment_methods")
      .select("*");

    // Apply status filter
    if (status) {
      query = query.eq("status", status);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, error } = await query;

    if (error) {
      console.error("API: Payment methods fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payment methods fetched successfully:", data?.length || 0);
    return NextResponse.json({
      success: true,
      paymentMethods: data || [],
    });
  } catch (error: any) {
    console.error("API: Payment methods fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create payment method
export async function POST(request: NextRequest) {
  try {
    const paymentMethod = await request.json();

    console.log("API: Creating payment method:", paymentMethod);

    const { data, error } = await supabase
      .from("payment_methods")
      .insert([paymentMethod])
      .select();

    if (error) {
      console.error("API: Payment method creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payment method created successfully:", data);
    return NextResponse.json({
      success: true,
      paymentMethod: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Payment method creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update payment method
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    console.log("API: Updating payment method:", { id, updates });

    const { data, error } = await supabase
      .from("payment_methods")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("API: Payment method update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payment method updated successfully:", data);
    return NextResponse.json({
      success: true,
      paymentMethod: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Payment method update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete payment method
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    console.log("API: Deleting payment method:", { id });

    const { error } = await supabase.from("payment_methods").delete().eq("id", id);

    if (error) {
      console.error("API: Payment method deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payment method deleted successfully");
    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("API: Payment method deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
