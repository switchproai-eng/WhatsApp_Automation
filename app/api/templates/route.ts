import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getCurrentTenant } from "@/lib/auth"
import { query } from "@/lib/db"

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

    const templates = await query(
      `SELECT id, name, category, language, status, components, whatsapp_template_id, created_at, updated_at
       FROM message_templates
       WHERE tenant_id = $1
       ORDER BY updated_at DESC`,
      [tenant.id]
    )

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching templates:", error)
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
    const { name, category, language, bodyText, headerText, footerText, buttons } = body

    if (!name || !category || !language || !bodyText) {
      return NextResponse.json(
        { error: "Name, category, language, and body text are required" },
        { status: 400 }
      )
    }

    // Build components array
    const components = []

    if (headerText) {
      components.push({ type: "header", format: "text", text: headerText })
    }

    components.push({ type: "body", text: bodyText })

    if (footerText) {
      components.push({ type: "footer", text: footerText })
    }

    if (buttons && buttons.length > 0) {
      components.push({ type: "buttons", buttons })
    }

    const [template] = await query(
      `INSERT INTO message_templates (tenant_id, name, category, language, status, components)
       VALUES ($1, $2, $3, $4, 'pending', $5)
       RETURNING id, name, category, language, status, components, created_at`,
      [tenant.id, name, category, language, JSON.stringify(components)]
    )

    // TODO: Submit template to WhatsApp for approval

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
