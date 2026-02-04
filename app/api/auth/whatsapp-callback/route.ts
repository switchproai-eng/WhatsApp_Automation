import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifySession } from "@/lib/auth";

const GRAPH_API_URL = "https://graph.facebook.com/v18.0";

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      return NextResponse.json(
        { error: "Facebook app credentials not configured" },
        { status: 500 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      `${GRAPH_API_URL}/oauth/access_token?` +
        new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          code: code,
        })
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange failed:", errorData);
      return NextResponse.json(
        { error: "Failed to exchange authorization code" },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Debug the shared WABA info from the embedded signup response
    // The code exchange should return the shared WABA details
    console.log("Token exchange response:", JSON.stringify(tokenData, null, 2));

    // Get debug token info to understand what was shared
    const debugResponse = await fetch(
      `${GRAPH_API_URL}/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`
    );

    let debugData;
    if (debugResponse.ok) {
      debugData = await debugResponse.json();
      console.log("Debug token info:", JSON.stringify(debugData, null, 2));
    }

    // Get the shared WhatsApp Business Accounts
    // First, get the user's business accounts
    const businessAccountsResponse = await fetch(
      `${GRAPH_API_URL}/me/businesses?access_token=${accessToken}`
    );

    let wabaId: string | null = null;
    let phoneNumberId: string | null = null;
    let phoneNumber: string | null = null;
    let displayName: string | null = null;

    if (businessAccountsResponse.ok) {
      const businessData = await businessAccountsResponse.json();
      console.log("Business accounts:", JSON.stringify(businessData, null, 2));

      // For each business, get the WhatsApp Business Accounts
      for (const business of businessData.data || []) {
        const wabaResponse = await fetch(
          `${GRAPH_API_URL}/${business.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`
        );

        if (wabaResponse.ok) {
          const wabaData = await wabaResponse.json();
          console.log("WABA data:", JSON.stringify(wabaData, null, 2));

          if (wabaData.data && wabaData.data.length > 0) {
            wabaId = wabaData.data[0].id;

            // Get phone numbers for this WABA
            const phonesResponse = await fetch(
              `${GRAPH_API_URL}/${wabaId}/phone_numbers?access_token=${accessToken}`
            );

            if (phonesResponse.ok) {
              const phonesData = await phonesResponse.json();
              console.log("Phone numbers:", JSON.stringify(phonesData, null, 2));

              if (phonesData.data && phonesData.data.length > 0) {
                const phoneData = phonesData.data[0];
                phoneNumberId = phoneData.id;
                phoneNumber = phoneData.display_phone_number;
                displayName = phoneData.verified_name || phoneData.display_phone_number;
              }
            }
            break;
          }
        }
      }
    }

    // Alternative: Try to get WABA directly from the shared data
    if (!wabaId) {
      // Try getting from the granular scopes in debug token
      if (debugData?.data?.granular_scopes) {
        for (const scope of debugData.data.granular_scopes) {
          if (scope.scope === "whatsapp_business_management" && scope.target_ids) {
            wabaId = scope.target_ids[0];
            break;
          }
        }
      }

      if (wabaId) {
        // Get phone numbers for this WABA
        const phonesResponse = await fetch(
          `${GRAPH_API_URL}/${wabaId}/phone_numbers?access_token=${accessToken}`
        );

        if (phonesResponse.ok) {
          const phonesData = await phonesResponse.json();
          console.log("Phone numbers (alt):", JSON.stringify(phonesData, null, 2));

          if (phonesData.data && phonesData.data.length > 0) {
            const phoneData = phonesData.data[0];
            phoneNumberId = phoneData.id;
            phoneNumber = phoneData.display_phone_number;
            displayName = phoneData.verified_name || phoneData.display_phone_number;
          }
        }
      }
    }

    if (!phoneNumberId || !phoneNumber) {
      return NextResponse.json(
        { error: "No WhatsApp phone number found. Please ensure you've connected a phone number during signup." },
        { status: 400 }
      );
    }

    // Generate a webhook verify token
    const webhookVerifyToken = crypto.randomUUID();

    // Check if this phone number already exists
    const existingAccount = await sql`
      SELECT id FROM whatsapp_accounts
      WHERE phone_number_id = ${phoneNumberId}
    `;

    let accountId: string;

    if (existingAccount.length > 0) {
      // Update existing account
      const result = await sql`
        UPDATE whatsapp_accounts
        SET
          tenant_id = ${session.tenantId},
          phone_number = ${phoneNumber},
          waba_id = ${wabaId},
          access_token = ${accessToken},
          webhook_verify_token = ${webhookVerifyToken},
          display_name = ${displayName},
          status = 'active',
          updated_at = NOW()
        WHERE phone_number_id = ${phoneNumberId}
        RETURNING id
      `;
      accountId = result[0].id;
    } else {
      // Create new account
      const result = await sql`
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
          ${phoneNumber},
          ${phoneNumberId},
          ${wabaId},
          ${accessToken},
          ${webhookVerifyToken},
          ${displayName},
          'active'
        )
        RETURNING id
      `;
      accountId = result[0].id;
    }

    // Try to subscribe to webhooks automatically
    if (wabaId) {
      try {
        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin")}/api/webhooks/whatsapp`;

        const subscribeResponse = await fetch(
          `${GRAPH_API_URL}/${wabaId}/subscribed_apps`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: accessToken,
            }),
          }
        );

        if (subscribeResponse.ok) {
          console.log("Successfully subscribed to webhook events");
        } else {
          console.warn("Failed to auto-subscribe webhooks:", await subscribeResponse.text());
        }
      } catch (webhookError) {
        console.warn("Error subscribing to webhooks:", webhookError);
        // Non-fatal error, continue
      }
    }

    return NextResponse.json({
      success: true,
      accountId,
      phoneNumber,
      displayName,
      message: "WhatsApp account connected successfully",
    });
  } catch (error) {
    console.error("WhatsApp callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
