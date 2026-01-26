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

    const contacts = await query(
      `SELECT id, whatsapp_id, phone_number, name, email, avatar_url, tags, opted_in, last_message_at, created_at
       FROM contacts
       WHERE tenant_id = $1
       ORDER BY last_message_at DESC NULLS LAST`,
      [tenant.id]
    )

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching contacts:", error)
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
    const { phoneNumber, name, email } = body

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Clean phone number
    const cleanedPhone = phoneNumber.replace(/[^\d+]/g, "")
    const whatsappId = cleanedPhone.replace("+", "")

    // Check if contact already exists
    const existing = await query(
      `SELECT id FROM contacts WHERE tenant_id = $1 AND (phone_number = $2 OR whatsapp_id = $3)`,
      [tenant.id, cleanedPhone, whatsappId]
    )

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A contact with this phone number already exists" },
        { status: 400 }
      )
    }

    const [contact] = await query(
      `INSERT INTO contacts (tenant_id, whatsapp_id, phone_number, name, email, opted_in)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, whatsapp_id, phone_number, name, email, avatar_url, tags, opted_in, created_at`,
      [tenant.id, whatsappId, cleanedPhone, name || null, email || null]
    )

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
