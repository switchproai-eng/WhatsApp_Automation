import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all agents for the tenant to verify they exist
    const agents = await query(`
      SELECT id, name, is_default, created_at, updated_at
      FROM ai_assistants
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `, [session.tenantId]);

    return NextResponse.json({ 
      agents,
      count: agents.length,
      message: `Found ${agents.length} agents for tenant ${session.tenantId}`
    });
  } catch (error) {
    console.error("Error in test agents API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}