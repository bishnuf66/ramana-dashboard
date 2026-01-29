import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch all testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    console.log("API: Fetching testimonials with params:", { status, sortBy, sortOrder });

    let query = supabase
      .from("testimonials")
      .select("*");

    // Apply status filter
    if (status) {
      query = query.eq("status", status);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, error } = await query;

    if (error) {
      console.error("API: Testimonials fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Testimonials fetched successfully:", data?.length || 0);
    return NextResponse.json({
      success: true,
      testimonials: data || [],
    });
  } catch (error: any) {
    console.error("API: Testimonials fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create testimonial
export async function POST(request: NextRequest) {
  try {
    const testimonial = await request.json();

    console.log("API: Creating testimonial:", testimonial);

    const { data, error } = await supabase
      .from("testimonials")
      .insert([testimonial])
      .select();

    if (error) {
      console.error("API: Testimonial creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Testimonial created successfully:", data);
    return NextResponse.json({
      success: true,
      testimonial: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Testimonial creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update testimonial
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    console.log("API: Updating testimonial:", { id, updates });

    const { data, error } = await supabase
      .from("testimonials")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("API: Testimonial update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Testimonial updated successfully:", data);
    return NextResponse.json({
      success: true,
      testimonial: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Testimonial update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete testimonial
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    console.log("API: Deleting testimonial:", { id });

    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) {
      console.error("API: Testimonial deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Testimonial deleted successfully");
    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("API: Testimonial deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
