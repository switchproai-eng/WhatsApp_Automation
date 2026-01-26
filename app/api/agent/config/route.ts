import { NextResponse } from "next/server"
import { verifySession } from "../../../lib/auth"
import { query, queryOne } from "../../../lib/db"

export async function GET(request: Request) {
  const session = await verifySession(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get the default agent for the tenant
  const agent = await queryOne<{
    id: string
    tenant_id: string
    name: string
    config: Record<string, unknown>
    is_default: boolean
    updated_at: string
  }>(
    `SELECT id, tenant_id, name, config, is_default, updated_at
     FROM ai_agents
     WHERE tenant_id = $1 AND is_default = true`,
    [session.tenantId]
  )

  return NextResponse.json({
    agent: agent || null,
    config: agent?.config || {}
  })
}

export async function POST(request: Request) {
  const session = await verifySession(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { section, data } = await request.json()

  // Get existing default agent or create empty object
  const existing = await queryOne<{
    id: string
    config: Record<string, unknown>
    name: string
  }>(
    `SELECT id, config, name FROM ai_agents WHERE tenant_id = $1 AND is_default = true`,
    [session.tenantId]
  )

  const newConfig = {
    ...(existing?.config || {}),
    [section]: data,
  }

  if (existing) {
    // Update existing agent config
    await query(
      `UPDATE ai_agents
       SET config = $1, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(newConfig), existing.id]
    )
  } else {
    // Create new default agent with the config
    const agentName = "Default AI Agent";
    await query(
      `INSERT INTO ai_agents (tenant_id, name, config, is_default, created_at, updated_at)
       VALUES ($1, $2, $3, true, NOW(), NOW())
       ON CONFLICT (tenant_id, is_default) DO UPDATE SET
         config = $3,
         updated_at = NOW()`,
      [session.tenantId, agentName, JSON.stringify(newConfig)]
    )

    // Update tenant to reference the default agent
    const newAgent = await queryOne<{ id: string }>(
      `SELECT id FROM ai_agents WHERE tenant_id = $1 AND is_default = true`,
      [session.tenantId]
    );

    if (newAgent) {
      await query(
        `UPDATE tenants SET default_agent_id = $1 WHERE id = $2`,
        [newAgent.id, session.tenantId]
      );
    }
  }

  return NextResponse.json({ success: true, config: newConfig })
}
