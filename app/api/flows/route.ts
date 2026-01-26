import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getCurrentTenant } from "../../../lib/auth"
import { query } from "../../../lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenant = await getCurrentTenant()
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const flows = await query(
      `SELECT id, name, description, trigger_type, trigger_config, nodes, is_active, created_at, updated_at
       FROM flows
       WHERE tenant_id = $1
       ORDER BY updated_at DESC`,
      [tenant.id]
    )

    return NextResponse.json(flows)
  } catch (error) {
    console.error("Error fetching flows:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenant = await getCurrentTenant()
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, triggerType, triggerConfig, nodes } = body

    if (!name) {
      return NextResponse.json({ error: "Flow name is required" }, { status: 400 })
    }

    const [flow] = await query(
      `INSERT INTO flows (tenant_id, name, description, trigger_type, trigger_config, nodes, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING id, name, description, trigger_type, trigger_config, nodes, is_active, created_at`,
      [
        tenant.id,
        name,
        description || null,
        triggerType,
        JSON.stringify(triggerConfig || {}),
        JSON.stringify(nodes || []),
      ]
    )

    return NextResponse.json(flow)
  } catch (error) {
    console.error("Error creating flow:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenant = await getCurrentTenant()
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, triggerType, triggerConfig, nodes, isActive } = body

    if (!id || !name) {
      return NextResponse.json({ error: "Flow ID and name are required" }, { status: 400 })
    }

    const [flow] = await query(
      `UPDATE flows 
       SET name = $1, description = $2, trigger_type = $3, trigger_config = $4, nodes = $5, is_active = COALESCE($6, is_active), updated_at = NOW()
       WHERE id = $7 AND tenant_id = $8
       RETURNING id, name, description, trigger_type, trigger_config, nodes, is_active, updated_at`,
      [
        name,
        description || null,
        triggerType,
        JSON.stringify(triggerConfig || {}),
        JSON.stringify(nodes || []),
        isActive,
        id,
        tenant.id,
      ]
    )

    if (!flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 })
    }

    return NextResponse.json(flow)
  } catch (error) {
    console.error("Error updating flow:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
