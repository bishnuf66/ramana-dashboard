import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch all blogs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    console.log("API: Fetching blogs with params:", { status, sortBy, sortOrder });

    let query = supabase
      .from("blogs")
      .select("*");

    // Apply status filter
    if (status) {
      query = query.eq("status", status);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, error } = await query;

    if (error) {
      console.error("API: Blogs fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Blogs fetched successfully:", data?.length || 0);
    return NextResponse.json({
      success: true,
      blogs: data || [],
    });
  } catch (error: any) {
    console.error("API: Blogs fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create blog
export async function POST(request: NextRequest) {
  try {
    const blog = await request.json();

    console.log("API: Creating blog:", blog);

    const { data, error } = await supabase
      .from("blogs")
      .insert([blog])
      .select();

    if (error) {
      console.error("API: Blog creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Blog created successfully:", data);
    return NextResponse.json({
      success: true,
      blog: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Blog creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update blog
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    console.log("API: Updating blog:", { id, updates });

    const { data, error } = await supabase
      .from("blogs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("API: Blog update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Blog updated successfully:", data);
    return NextResponse.json({
      success: true,
      blog: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Blog update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    console.log("API: Deleting blog:", { id });

    const { error } = await supabase.from("blogs").delete().eq("id", id);

    if (error) {
      console.error("API: Blog deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Blog deleted successfully");
    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("API: Blog deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
