import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch contact messages
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log("API: Fetching contact messages with params:", {
      search,
      status,
      page,
      limit,
    });

    let query = supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%,message.ilike.%${search}%`,
      );
    }

    // Apply status filter
    if (status && status !== "all") {
      query = query.eq("is_read", status === "read");
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      console.error("API: Contact messages fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Contact messages fetched successfully:", data?.length || 0);
    return NextResponse.json({
      success: true,
      messages: data || [],
    });
  } catch (error: any) {
    console.error("API: Contact messages fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update contact message (mark as read/unread)
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id, is_read } = await request.json();

    console.log("API: Updating contact message:", { id, is_read });

    const { data, error } = await supabase
      .from("contact_messages")
      .update({ 
        is_read,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("API: Contact message update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Contact message updated successfully:", data);
    return NextResponse.json({
      success: true,
      message: data?.[0],
    });
  } catch (error: any) {
    console.error("API: Contact message update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete contact message
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await request.json();

    console.log("API: Deleting contact message:", { id });

    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("API: Contact message deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("API: Contact message deleted successfully");
    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("API: Contact message deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
