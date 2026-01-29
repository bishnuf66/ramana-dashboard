import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  try {
    console.log("API: Fetching all categories");

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("API: Categories fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Categories fetched successfully:", data?.length || 0);
    return NextResponse.json({
      success: true,
      categories: data || [],
    });
  } catch (error: any) {
    console.error("API: Categories fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create category
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  try {
    const category = await request.json();

    console.log("API: Creating category:", category);

    const { data, error } = await supabase
      .from("categories")
      .insert([category])
      .select();

    if (error) {
      console.error("API: Category creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Category created successfully:", data);
    return NextResponse.json({
      success: true,
      category: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Category creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  try {
    const { id, ...updates } = await request.json();

    console.log("API: Updating category:", { id, updates });

    const { data, error } = await supabase
      .from("categories")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("API: Category update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Category updated successfully:", data);
    return NextResponse.json({
      success: true,
      category: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Category update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  try {
    const { id } = await request.json();

    console.log("API: Deleting category:", { id });

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("API: Category deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Category deleted successfully");
    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("API: Category deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
