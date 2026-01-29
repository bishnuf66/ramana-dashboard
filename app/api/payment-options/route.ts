import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch payment options
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log("API: Fetching payment options with params:", {
      search,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    let query = supabase
      .from("payment_options")
      .select("*");

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

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      console.error("API: Payment options fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payment options fetched successfully:", data?.length || 0);
    return NextResponse.json({
      success: true,
      paymentOptions: data || [],
    });
  } catch (error: any) {
    console.error("API: Payment options fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create payment option
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const paymentOption = await request.json();

    console.log("API: Creating payment option:", paymentOption);

    const { data, error } = await supabase
      .from("payment_options")
      .insert([paymentOption])
      .select();

    if (error) {
      console.error("API: Payment option creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payment option created successfully:", data);
    return NextResponse.json({
      success: true,
      paymentOption: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Payment option creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update payment option
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id, ...paymentOptionData } = await request.json();

    console.log("API: Updating payment option:", { id, paymentOptionData });

    const { data, error } = await supabase
      .from("payment_options")
      .update({ ...paymentOptionData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("API: Payment option update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payment option updated successfully:", data);
    return NextResponse.json({
      success: true,
      paymentOption: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Payment option update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete payment option
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await request.json();

    console.log("API: Deleting payment option:", { id });

    const { error } = await supabase.from("payment_options").delete().eq("id", id);

    if (error) {
      console.error("API: Payment option deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Payment option deleted successfully");
    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("API: Payment option deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
