import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Create admin client with service role key
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const { id, verified } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    if (typeof verified !== "boolean") {
      return NextResponse.json(
        { error: "Verified status must be a boolean" },
        { status: 400 }
      );
    }

    console.log("API: Verifying payment with service role:", { id, verified });

    // First check if payment exists
    const { data: existingPayment, error: checkError } = await supabaseAdmin
      .from("user_payments")
      .select("id, is_verified")
      .eq("id", id)
      .single();

    if (checkError) {
      console.error("API: Payment not found:", checkError);
      return NextResponse.json(
        { error: `Payment not found: ${checkError.message}` },
        { status: 404 }
      );
    }

    console.log("API: Payment found, current is_verified:", existingPayment?.is_verified);

    // Update payment using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from("user_payments")
      .update({ is_verified: verified })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("API: Update failed:", error);
      return NextResponse.json(
        { error: `Failed to update payment: ${error.message}` },
        { status: 500 }
      );
    }

    console.log("API: Payment verification successful:", data);

    return NextResponse.json({
      success: true,
      message: `Payment ${verified ? "verified" : "unverified"} successfully`,
      data: data,
    });

  } catch (error: any) {
    console.error("API: Server error:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
