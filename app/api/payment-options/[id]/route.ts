import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch single payment option by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Payment option ID is required" },
        { status: 400 },
      );
    }

    console.log("API: Fetching payment option by ID:", id);

    const { data, error } = await supabase
      .from("payment_options")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("API: Payment option fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Payment option not found" },
        { status: 404 },
      );
    }

    console.log("API: Payment option fetched successfully:", data);
    return NextResponse.json({
      success: true,
      paymentOption: data,
    });
  } catch (error: any) {
    console.error("API: Payment option fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
