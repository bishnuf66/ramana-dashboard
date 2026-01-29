import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    console.log("API: Fetching product by ID:", id);

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(id, name, slug, picture)
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("API: Product fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Product fetched successfully:", data);
    return NextResponse.json({
      success: true,
      product: data,
    });
  } catch (error: any) {
    console.error("API: Product fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
