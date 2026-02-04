import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get WhatsApp account configuration for the tenant
    const whatsappAccountResult = await sql`
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
      WHERE tenant_id = ${session.tenantId}
    `;

    if (whatsappAccountResult.length === 0) {
      return NextResponse.json({
        connected: false,
        config: null,
        accounts: []
      });
    }

    const config = whatsappAccountResult[0];

    // Return all accounts for the tenant
    const accounts = whatsappAccountResult.map((account: {
      id: string;
      phone_number: string;
      phone_number_id: string;
      waba_id: string;
      display_name: string;
      status: string;
    }) => ({
      id: account.id,
      phoneNumber: account.phone_number,
      phoneNumberId: account.phone_number_id,
      wabaId: account.waba_id,
      displayName: account.display_name,
      status: account.status,
    }));

    return NextResponse.json({
      connected: true,
      config: {
        phoneNumber: config.phone_number,
        phoneNumberId: config.phone_number_id,
        wabaId: config.waba_id,
        displayName: config.display_name,
        qualityRating: config.quality_rating,
        status: config.status,
      },
      accounts
    });
  } catch (error) {
    console.error("Error getting WhatsApp settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      phoneNumber, 
      phoneNumberId, 
      wabaId, 
      accessToken, 
      webhookVerifyToken,
      displayName 
    } = body;

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        { error: "Phone Number ID and Access Token are required" },
        { status: 400 }
      );
    }

    // Check if WhatsApp account already exists for this tenant
    const existingAccountResult = await sql`
      SELECT id FROM whatsapp_accounts 
      WHERE tenant_id = ${session.tenantId}
    `;

    let result;
    if (existingAccountResult.length > 0) {
      // Update existing account
      result = await sql`
        UPDATE whatsapp_accounts 
        SET 
          phone_number = ${phoneNumber || null},
          phone_number_id = ${phoneNumberId},
          waba_id = ${wabaId || null},
          access_token = ${accessToken},
          webhook_verify_token = ${webhookVerifyToken || null},
          display_name = ${displayName || null},
          status = 'active',
          updated_at = NOW()
        WHERE tenant_id = ${session.tenantId}
        RETURNING id
      `;
    } else {
      // Create new account
      result = await sql`
        INSERT INTO whatsapp_accounts (
          tenant_id,
          phone_number,
          phone_number_id,
          waba_id,
          access_token,
          webhook_verify_token,
          display_name,
          status
        ) VALUES (
          ${session.tenantId},
          ${phoneNumber || null},
          ${phoneNumberId},
          ${wabaId || null},
          ${accessToken},
          ${webhookVerifyToken || null},
          ${displayName || null},
          'active'
        )
        RETURNING id
      `;
    }

    return NextResponse.json({ 
      success: true,
      id: result[0].id
    });
  } catch (error) {
    console.error("Error saving WhatsApp settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}