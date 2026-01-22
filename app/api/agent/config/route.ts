import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { query, queryOne } from "@/lib/db"

export async function GET(request: Request) {
  const session = await verifySession(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const config = await queryOne<{
    id: string
    tenant_id: string
    config: Record<string, unknown>
    updated_at: string
  }>(
    `SELECT * FROM agent_configurations WHERE tenant_id = $1`,
    [session.tenantId]
  )

  return NextResponse.json({ config: config?.config || {} })
}

export async function POST(request: Request) {
  const session = await verifySession(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { section, data } = await request.json()

  // Get existing config or create empty object
  const existing = await queryOne<{
    id: string
    config: Record<string, unknown>
  }>(
    `SELECT id, config FROM agent_configurations WHERE tenant_id = $1`,
    [session.tenantId]
  )

  const newConfig = {
    ...(existing?.config || {}),
    [section]: data,
  }

  if (existing) {
    // Update existing config
    await query(
      `UPDATE agent_configurations 
       SET config = $1, updated_at = NOW() 
       WHERE tenant_id = $2`,
      [JSON.stringify(newConfig), session.tenantId]
    )
  } else {
    // Create new config
    await query(
      `INSERT INTO agent_configurations (id, tenant_id, config, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())`,
      [session.tenantId, JSON.stringify(newConfig)]
    )
  }

  return NextResponse.json({ success: true, config: newConfig })
}
