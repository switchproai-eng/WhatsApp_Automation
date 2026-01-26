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

    const campaigns = await query(
      `SELECT id, name, description, template_id, status, scheduled_at, started_at, completed_at,
              target_audience, total_recipients, sent_count, delivered_count, read_count, 
              replied_count, failed_count, created_at, updated_at
       FROM campaigns
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tenant.id]
    )

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("Error fetching campaigns:", error)
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
    const { name, description, templateId, scheduledAt, targetAudience } = body

    if (!name) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 })
    }

    // Get total recipients based on target audience (for now, all opted-in contacts)
    const contactCount = await query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM contacts WHERE tenant_id = $1 AND opted_in = true`,
      [tenant.id]
    )

    const totalRecipients = parseInt(contactCount[0]?.count || "0")

    const [campaign] = await query(
      `INSERT INTO campaigns (
        tenant_id, name, description, template_id, status, scheduled_at, 
        target_audience, total_recipients
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, description, status, scheduled_at, total_recipients, created_at`,
      [
        tenant.id,
        name,
        description || null,
        templateId || null,
        scheduledAt ? "scheduled" : "draft",
        scheduledAt || null,
        JSON.stringify(targetAudience || { type: "all_opted_in" }),
        totalRecipients,
      ]
    )

    return NextResponse.json(campaign)
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
