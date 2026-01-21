import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifySession } from "@/lib/auth";
import { WhatsAppService } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, type = "text", content, templateName, templateParams } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Get conversation with contact info
    const conversationResult = await sql`
      SELECT 
        c.id,
        c.contact_id,
        co.phone as contact_phone,
        t.whatsapp_phone_number_id,
        t.whatsapp_access_token
      FROM conversations c
      JOIN contacts co ON c.contact_id = co.id
      JOIN tenants t ON c.tenant_id = t.id
      WHERE c.id = ${conversationId} AND c.tenant_id = ${session.tenantId}
    `;

    if (conversationResult.length === 0) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const conversation = conversationResult[0];

    // Check if WhatsApp is configured
    if (!conversation.whatsapp_phone_number_id || !conversation.whatsapp_access_token) {
      return NextResponse.json(
        { error: "WhatsApp is not configured for this tenant" },
        { status: 400 }
      );
    }

    // Initialize WhatsApp service
    const whatsapp = new WhatsAppService({
      phoneNumberId: conversation.whatsapp_phone_number_id,
      accessToken: conversation.whatsapp_access_token,
    });

    let messageId: string;
    let messageContent = content;

    try {
      if (type === "template" && templateName) {
        // Send template message
        const result = await whatsapp.sendTemplateMessage({
          to: conversation.contact_phone,
          templateName,
          languageCode: "en",
          components: templateParams,
        });
        messageId = result.messageId;
        messageContent = `[Template: ${templateName}]`;
      } else if (type === "interactive") {
        // Send interactive message
        const result = await whatsapp.sendInteractiveMessage({
          to: conversation.contact_phone,
          type: body.interactiveType || "button",
          body: content,
          buttons: body.buttons,
          sections: body.sections,
        });
        messageId = result.messageId;
      } else {
        // Send text message
        const result = await whatsapp.sendTextMessage({
          to: conversation.contact_phone,
          text: content,
        });
        messageId = result.messageId;
      }
    } catch (error) {
      console.error("WhatsApp API error:", error);
      return NextResponse.json(
        { error: "Failed to send message via WhatsApp" },
        { status: 500 }
      );
    }

    // Store message in database
    const messageResult = await sql`
      INSERT INTO messages (
        conversation_id,
        sender_type,
        sender_id,
        direction,
        type,
        content,
        whatsapp_message_id,
        status,
        sent_at
      )
      VALUES (
        ${conversationId},
        'user',
        ${session.userId},
        'outbound',
        ${type},
        ${messageContent},
        ${messageId},
        'sent',
        NOW()
      )
      RETURNING id, type, content, status, sent_at
    `;

    // Update conversation
    await sql`
      UPDATE conversations 
      SET 
        last_message = ${messageContent},
        last_message_at = NOW(),
        status = 'open',
        updated_at = NOW()
      WHERE id = ${conversationId}
    `;

    return NextResponse.json({
      message: {
        id: messageResult[0].id,
        type: messageResult[0].type,
        content: messageResult[0].content,
        status: messageResult[0].status,
        sentAt: messageResult[0].sent_at,
        whatsappMessageId: messageId,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
