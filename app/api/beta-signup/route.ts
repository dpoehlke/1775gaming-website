import { NextRequest, NextResponse } from "next/server";

// Phase 4: Replace with real Supabase insert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic server-side validation
    if (!body.email || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO (Phase 4): Insert into Supabase beta_signups table
    console.log("Beta signup received:", {
      name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      platform: body.platform,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Application received successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to process application" },
      { status: 500 }
    );
  }
}
