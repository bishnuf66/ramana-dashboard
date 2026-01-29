import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Get product count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const status = searchParams.get("status") || "all";

    console.log("API: Fetching product count with params:", { search, category, status });

    let query = supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Apply search filter
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`
      );
    }

    // Apply category filter
    if (category !== "all") {
      query = query.eq("category_id", category);
    }

    // Apply stock status filter
    if (status !== "all") {
      if (status === "in_stock") {
        query = query.gt("stock", 0);
      } else if (status === "out_of_stock") {
        query = query.lte("stock", 0);
      }
    }

    const { count, error } = await query;

    if (error) {
      console.error("API: Product count error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Product count fetched successfully:", count);
    return NextResponse.json({
      success: true,
      count: count || 0,
    });
  } catch (error: any) {
    console.error("API: Product count error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
