import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getCurrentTenant } from "../../../../../lib/auth"
import { query } from "../../../../../lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenant = await getCurrentTenant()
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId } = await params

    // Verify conversation belongs to tenant
    const conversation = await query<{ id: string }>(
      `SELECT id FROM conversations WHERE id = $1 AND tenant_id = $2`,
      [conversationId, tenant.id]
    )

    if (conversation.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const messages = await query(
      `SELECT id, sender_type, sender_id, message_type, content, media_url, status, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    )

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenant = await getCurrentTenant()
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId } = await params
    const body = await request.json()
    const { content, messageType = "text", mediaUrl } = body

    // Verify conversation belongs to tenant
    const conversation = await query<{ id: string; contact_id: string }>(
      `SELECT id, contact_id FROM conversations WHERE id = $1 AND tenant_id = $2`,
      [conversationId, tenant.id]
    )

    if (conversation.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Insert message
    const [message] = await query(
      `INSERT INTO messages (conversation_id, sender_type, sender_id, message_type, content, media_url, status)
       VALUES ($1, 'agent', $2, $3, $4, $5, 'pending')
       RETURNING id, sender_type, sender_id, message_type, content, media_url, status, created_at`,
      [conversationId, user.id, messageType, content, mediaUrl]
    )

    // Update conversation last_message_at
    await query(
      `UPDATE conversations SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [conversationId]
    )

    // TODO: Send message via WhatsApp API
    // For now, just mark as sent
    await query(`UPDATE messages SET status = 'sent' WHERE id = $1`, [(message as { id: string }).id])

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
