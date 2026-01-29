import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = sql`
      SELECT 
        c.id,
        c.status,
        c.channel,
        c.last_message,
        c.last_message_at,
        c.unread_count,
        c.created_at,
        c.updated_at,
        co.id as contact_id,
        co.name as contact_name,
        co.phone as contact_phone,
        co.email as contact_email,
        u.id as assigned_user_id,
        u.name as assigned_user_name
      FROM conversations c
      LEFT JOIN contacts co ON c.contact_id = co.id
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.tenant_id = ${session.tenantId}
    `;

    if (status && status !== "all") {
      query = sql`${query} AND c.status = ${status}`;
    }

    if (assignedTo === "me") {
      query = sql`${query} AND c.assigned_to = ${session.userId}`;
    } else if (assignedTo === "unassigned") {
      query = sql`${query} AND c.assigned_to IS NULL`;
    }

    if (search) {
      query = sql`${query} AND (
        co.name ILIKE ${"%" + search + "%"} OR 
        co.phone ILIKE ${"%" + search + "%"} OR
        c.last_message ILIKE ${"%" + search + "%"}
      )`;
    }

    query = sql`${query} ORDER BY c.last_message_at DESC NULLS LAST LIMIT ${limit} OFFSET ${offset}`;

    const conversations = await query;

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM conversations c
      LEFT JOIN contacts co ON c.contact_id = co.id
      WHERE c.tenant_id = ${session.tenantId}
    `;

    return NextResponse.json({
      conversations: conversations.map((c) => ({
        id: c.id,
        status: c.status,
        channel: c.channel,
        lastMessage: c.last_message,
        lastMessageAt: c.last_message_at,
        unreadCount: c.unread_count,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        contact: {
          id: c.contact_id,
          name: c.contact_name,
          phone: c.contact_phone,
          email: c.contact_email,
        },
        assignedTo: c.assigned_user_id
          ? {
              id: c.assigned_user_id,
              name: c.assigned_user_name,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total: parseInt(countResult[0].total),
        totalPages: Math.ceil(parseInt(countResult[0].total) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contactId, channel = "whatsapp" } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // Check if contact exists and belongs to tenant
    const contact = await sql`
      SELECT id FROM contacts 
      WHERE id = ${contactId} AND tenant_id = ${session.tenantId}
    `;

    if (contact.length === 0) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Check for existing open conversation
    const existingConversation = await sql`
      SELECT id FROM conversations
      WHERE contact_id = ${contactId}
      AND tenant_id = ${session.tenantId}
      AND status != 'resolved'
      LIMIT 1
    `;

    if (existingConversation.length > 0) {
      return NextResponse.json({
        conversation: { id: existingConversation[0].id },
        message: "Existing conversation found",
      });
    }

    // Create new conversation with valid status
    const result = await sql`
      INSERT INTO conversations (tenant_id, contact_id, channel, status, assigned_to)
      VALUES (${session.tenantId}, ${contactId}, ${channel}, 'open'::text, ${session.userId})
      RETURNING id, status, channel, created_at
    `;

    return NextResponse.json({
      conversation: {
        id: result[0].id,
        status: result[0].status,
        channel: result[0].channel,
        createdAt: result[0].created_at,
      },
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
