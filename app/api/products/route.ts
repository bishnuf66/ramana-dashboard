import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch products
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const status = searchParams.get("status") || "all";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log("API: Fetching products with params:", {
      search,
      category,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    let query = supabase.from("products").select(`
        *,
        category:categories(id, name, slug, picture)
      `);

    // Apply search filter
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`,
      );
    }

    // Apply category filter
    if (category && category !== "all") {
      query = query.eq("category_id", category);
    }

    // Apply stock status filter
    if (status && status !== "all") {
      if (status === "in_stock") {
        query = query.gt("stock", 0);
      } else if (status === "out_of_stock") {
        query = query.lte("stock", 0);
      }
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      console.error("API: Products fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Products fetched successfully:", data?.length || 0);
    return NextResponse.json({
      success: true,
      products: data || [],
    });
  } catch (error: any) {
    console.error("API: Products fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create product
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const product = await request.json();

    console.log("API: Creating product:", product);

    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select();

    if (error) {
      console.error("API: Product creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Product created successfully:", data);
    return NextResponse.json({
      success: true,
      product: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Product creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id, ...updates } = await request.json();

    console.log("API: Updating product:", { id, updates });

    const { data, error } = await supabase
      .from("products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("API: Product update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Product updated successfully:", data);
    return NextResponse.json({
      success: true,
      product: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Product update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await request.json();

    console.log("API: Deleting product:", { id });

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("API: Product deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Product deleted successfully");
    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("API: Product deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
