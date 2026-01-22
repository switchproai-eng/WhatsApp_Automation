import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Verify webhook (GET request from Meta)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      return new NextResponse(challenge, { status: 200 });
    }
    // Respond with '403 Forbidden' if verify tokens do not match
    return new NextResponse("Forbidden", { status: 403 });
  }

  return new NextResponse("Bad Request", { status: 400 });
}

// Handle incoming webhook events (POST request from Meta)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is from WhatsApp Business API
    if (body.object !== "whatsapp_business_account") {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Process each entry
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== "messages") continue;

        const value = change.value;
        const metadata = value.metadata;
        const phoneNumberId = metadata?.phone_number_id;
        const displayPhoneNumber = metadata?.display_phone_number;

        // Handle incoming messages
        for (const message of value.messages || []) {
          await handleIncomingMessage({
            phoneNumberId,
            displayPhoneNumber,
            message,
            contact: value.contacts?.[0],
          });
        }

        // Handle message status updates
        for (const status of value.statuses || []) {
          await handleMessageStatus(status);
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

interface IncomingMessagePayload {
  phoneNumberId: string;
  displayPhoneNumber: string;
  message: {
    id: string;
    from: string;
    timestamp: string;
    type: string;
    text?: { body: string };
    image?: { id: string; caption?: string };
    document?: { id: string; filename: string };
    audio?: { id: string };
    video?: { id: string };
    location?: { latitude: number; longitude: number };
    button?: { text: string; payload: string };
    interactive?: {
      type: string;
      button_reply?: { id: string; title: string };
      list_reply?: { id: string; title: string };
    };
  };
  contact: {
    profile: { name: string };
    wa_id: string;
  };
}

async function handleIncomingMessage(payload: IncomingMessagePayload) {
  const { phoneNumberId, message, contact } = payload;

  try {
    // Find the tenant by phone number ID
    const tenantResult = await sql`
      SELECT id FROM tenants 
      WHERE whatsapp_phone_number_id = ${phoneNumberId}
      LIMIT 1
    `;

    if (tenantResult.length === 0) {
      console.log("No tenant found for phone number ID:", phoneNumberId);
      return;
    }

    const tenantId = tenantResult[0].id;
    const senderPhone = message.from;
    const senderName = contact?.profile?.name || "Unknown";

    // Find or create contact
    let contactResult = await sql`
      SELECT id FROM contacts 
      WHERE tenant_id = ${tenantId} AND phone = ${senderPhone}
      LIMIT 1
    `;

    let contactId: string;

    if (contactResult.length === 0) {
      // Create new contact
      const newContact = await sql`
        INSERT INTO contacts (tenant_id, phone, name, source)
        VALUES (${tenantId}, ${senderPhone}, ${senderName}, 'whatsapp')
        RETURNING id
      `;
      contactId = newContact[0].id;
    } else {
      contactId = contactResult[0].id;
    }

    // Find or create conversation
    let conversationResult = await sql`
      SELECT id FROM conversations 
      WHERE tenant_id = ${tenantId} AND contact_id = ${contactId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    let conversationId: string;

    if (conversationResult.length === 0) {
      // Create new conversation
      const newConversation = await sql`
        INSERT INTO conversations (tenant_id, contact_id, channel, status)
        VALUES (${tenantId}, ${contactId}, 'whatsapp', 'open')
        RETURNING id
      `;
      conversationId = newConversation[0].id;
    } else {
      conversationId = conversationResult[0].id;
      // Reopen conversation if closed
      await sql`
        UPDATE conversations 
        SET status = 'open', updated_at = NOW()
        WHERE id = ${conversationId}
      `;
    }

    // Determine message content based on type
    let content = "";
    let messageType = message.type;
    let mediaUrl: string | null = null;

    switch (message.type) {
      case "text":
        content = message.text?.body || "";
        break;
      case "image":
        content = message.image?.caption || "[Image]";
        messageType = "image";
        // Media URL would need to be fetched from Meta API
        break;
      case "document":
        content = `[Document: ${message.document?.filename}]`;
        messageType = "document";
        break;
      case "audio":
        content = "[Voice Message]";
        messageType = "audio";
        break;
      case "video":
        content = "[Video]";
        messageType = "video";
        break;
      case "location":
        content = `[Location: ${message.location?.latitude}, ${message.location?.longitude}]`;
        messageType = "location";
        break;
      case "button":
        content = message.button?.text || "";
        break;
      case "interactive":
        if (message.interactive?.button_reply) {
          content = message.interactive.button_reply.title;
        } else if (message.interactive?.list_reply) {
          content = message.interactive.list_reply.title;
        }
        break;
      default:
        content = `[Unsupported message type: ${message.type}]`;
    }

    // Store message
    await sql`
      INSERT INTO messages (
        conversation_id, 
        direction, 
        type, 
        content, 
        whatsapp_message_id,
        status,
        sent_at
      )
      VALUES (
        ${conversationId}, 
        'inbound', 
        ${messageType}, 
        ${content}, 
        ${message.id},
        'delivered',
        to_timestamp(${parseInt(message.timestamp)})
      )
    `;

    // Update conversation last message
    await sql`
      UPDATE conversations 
      SET 
        last_message = ${content},
        last_message_at = to_timestamp(${parseInt(message.timestamp)}),
        unread_count = unread_count + 1,
        updated_at = NOW()
      WHERE id = ${conversationId}
    `;

    // Update contact last contacted
    await sql`
      UPDATE contacts 
      SET last_contacted_at = NOW(), updated_at = NOW()
      WHERE id = ${contactId}
    `;

    console.log("Message stored successfully:", message.id);

    // TODO: Trigger automation flows based on message content
    // TODO: Check for AI auto-reply settings

  } catch (error) {
    console.error("Error handling incoming message:", error);
    throw error;
  }
}

async function handleMessageStatus(status: {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string }>;
}) {
  try {
    await sql`
      UPDATE messages 
      SET 
        status = ${status.status},
        ${status.status === "delivered" ? sql`delivered_at = to_timestamp(${parseInt(status.timestamp)}),` : sql``}
        ${status.status === "read" ? sql`read_at = to_timestamp(${parseInt(status.timestamp)}),` : sql``}
        updated_at = NOW()
      WHERE whatsapp_message_id = ${status.id}
    `;

    console.log("Message status updated:", status.id, status.status);
  } catch (error) {
    console.error("Error updating message status:", error);
  }
}
