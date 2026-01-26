import { NextResponse } from "next/server";
import { verifySession } from "/lib/auth";
import { query, queryOne } from "/lib/db";

// Test endpoint to verify agent configuration
export async function GET(request: Request) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await queryOne(
      `SELECT config FROM agent_configurations WHERE tenant_id = $1`,
      [session.tenantId]
    );

    return NextResponse.json({
      success: true,
      config: config?.config || null,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      webhookUrl: process.env.WEBHOOK_URL || "Not configured",
      verifyToken: !!process.env.WHATSAPP_VERIFY_TOKEN,
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}
