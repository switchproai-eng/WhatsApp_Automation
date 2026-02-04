import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the account belongs to the tenant
    const account = await sql`
      SELECT id FROM whatsapp_accounts
      WHERE id = ${id} AND tenant_id = ${session.tenantId}
    `;

    if (account.length === 0) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    // Delete the account
    await sql`
      DELETE FROM whatsapp_accounts
      WHERE id = ${id} AND tenant_id = ${session.tenantId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting WhatsApp account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const account = await sql`
      SELECT
        id,
        phone_number,
        phone_number_id,
        waba_id,
        display_name,
        quality_rating,
        status,
        created_at,
        updated_at
      FROM whatsapp_accounts
      WHERE id = ${id} AND tenant_id = ${session.tenantId}
    `;

    if (account.length === 0) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    const config = account[0];

    return NextResponse.json({
      id: config.id,
      phoneNumber: config.phone_number,
      phoneNumberId: config.phone_number_id,
      wabaId: config.waba_id,
      displayName: config.display_name,
      qualityRating: config.quality_rating,
      status: config.status,
    });
  } catch (error) {
    console.error("Error getting WhatsApp account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
