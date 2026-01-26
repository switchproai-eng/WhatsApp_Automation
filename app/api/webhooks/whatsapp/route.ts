import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "../../../../lib/db";
import { generateAIResponse, shouldUseAIResponse, checkBusinessHours } from "../../../../lib/ai";
import { WhatsAppService } from "../../../../lib/whatsapp";

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
    // Find the WhatsApp account and tenant by phone number ID
    const accountResult = await query(`
      SELECT wa.id as whatsapp_account_id, wa.tenant_id, wa.access_token
      FROM whatsapp_accounts wa
      WHERE wa.phone_number_id = $1
      LIMIT 1
    `, [phoneNumberId]);

    if (accountResult.length === 0) {
      console.log("No WhatsApp account found for phone number ID:", phoneNumberId);
      return;
    }

    const tenantId = accountResult[0].tenant_id;
    const whatsappAccountId = accountResult[0].whatsapp_account_id;
    const senderPhone = message.from;
    const senderName = contact?.profile?.name || "Unknown";

    // Find or create contact
    let contactResult = await query(`
      SELECT id FROM contacts
      WHERE tenant_id = $1 AND phone = $2
      LIMIT 1
    `, [tenantId, senderPhone]);

    let contactId: string;

    if (contactResult.length === 0) {
      // Create new contact
      const newContact = await query(`
        INSERT INTO contacts (tenant_id, phone, name, source)
        VALUES ($1, $2, $3, 'whatsapp')
        RETURNING id
      `, [tenantId, senderPhone, senderName]);
      contactId = newContact[0].id;
    } else {
      contactId = contactResult[0].id;
    }

    // Find or create conversation
    let conversationResult = await query(`
      SELECT id FROM conversations
      WHERE tenant_id = $1 AND contact_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `, [tenantId, contactId]);

    let conversationId: string;

    if (conversationResult.length === 0) {
      // Create new conversation
      const newConversation = await query(`
        INSERT INTO conversations (tenant_id, contact_id, whatsapp_account_id, status)
        VALUES ($1, $2, $3, 'open')
        RETURNING id
      `, [tenantId, contactId, whatsappAccountId]);
      conversationId = newConversation[0].id;
    } else {
      conversationId = conversationResult[0].id;
      // Reopen conversation if closed
      await query(`
        UPDATE conversations
        SET status = 'open', updated_at = NOW()
        WHERE id = $1
      `, [conversationId]);
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
    await query(`
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
        $1, 'inbound', $2, $3, $4, 'delivered', to_timestamp($5)
      )
    `, [conversationId, messageType, content, message.id, parseInt(message.timestamp)]);

    // Update conversation last message
    await query(`
      UPDATE conversations
      SET
        last_message = $1,
        last_message_at = to_timestamp($2),
        unread_count = unread_count + 1,
        updated_at = NOW()
      WHERE id = $3
    `, [content, parseInt(message.timestamp), conversationId]);

    // Update contact last contacted
    await query(`
      UPDATE contacts
      SET last_contacted_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [contactId]);

    console.log("Message stored successfully:", message.id);

    // Check if we should auto-respond with AI
    try {
      // First, try to find an assistant associated with this tenant
      let agentResult = await query(`
        SELECT id, system_prompt, name, model, temperature, max_tokens, config FROM ai_assistants
        WHERE tenant_id = $1 AND is_default = true
        LIMIT 1
      `, [tenantId]);

      // Create a config object from the assistant data
      const assistantData = agentResult.length > 0 ? agentResult[0] : null;
      let agentConfig: any = null;

      if (assistantData) {
        agentConfig = {
          profile: {
            agentName: assistantData.name,
            systemPrompt: assistantData.system_prompt,
            model: assistantData.model,
            temperature: assistantData.temperature,
            maxTokens: assistantData.max_tokens,
          },
          capabilities: {
            autoRespond: true, // Assuming auto-respond is enabled for default assistants
          },
          // Include any additional config from the config field if it exists
          ...assistantData.config
        };
      }

      // Check if AI auto-respond is enabled and within business hours
      const isBusinessHours = await checkBusinessHours(tenantId, agentConfig?.profile?.timezone);

      // Check if auto-respond is enabled in response settings
      const autoRespondEnabled = agentConfig?.response?.autoRespond ?? true; // Default to true if not set

      // Check if business hours restriction is enabled
      const businessHoursOnly = agentConfig?.response?.businessHoursOnly ?? false; // Default to false if not set

      // Determine if we should auto-respond based on settings
      const shouldAutoRespond = autoRespondEnabled &&
        (!businessHoursOnly || isBusinessHours) &&
        message.type === "text" &&
        content;

      if (shouldAutoRespond) {
        console.log("Generating AI response for:", content);

        // Get recent conversation history (last 5 messages)
        const historyResult = await query(`
          SELECT direction, content
          FROM messages
          WHERE conversation_id = $1
          ORDER BY sent_at DESC
          LIMIT 5
        `, [conversationId]);

        const conversationHistory = historyResult
          .reverse()
          .map((msg: any) => ({
            role: msg.direction === "outbound" ? "assistant" : "user",
            content: msg.content,
          }));

        // Add current message
        conversationHistory.push({ role: "user", content });

        // Generate AI response
        const aiResponse = await generateAIResponse(content, conversationHistory, agentConfig || {});

        // Send response via WhatsApp
        const whatsappService = new WhatsAppService({
          phoneNumberId,
          accessToken: accountResult[0].access_token,
        });

        await whatsappService.sendTextMessage({
          to: senderPhone,
          text: aiResponse,
        });

        // Store the AI response in database
        await query(`
          INSERT INTO messages (
            conversation_id,
            direction,
            type,
            content,
            status,
            ai_generated,
            sent_at
          )
          VALUES (
            $1, 'outbound', 'text', $2, 'sent', true, NOW()
          )
        `, [conversationId, aiResponse]);

        // Update conversation with AI response
        await query(`
          UPDATE conversations
          SET
            last_message = $1,
            last_message_at = NOW(),
            updated_at = NOW()
          WHERE id = $2
        `, [aiResponse, conversationId]);

        console.log("AI auto-response sent successfully");
      } else {
        console.log(
          "AI auto-response skipped - Config:",
          !!agentConfig,
          "Business hours:",
          isBusinessHours,
          "Message type:",
          message.type,
          "Has content:",
          !!content
        );
      }
    } catch (aiError) {
      console.error("Error in AI auto-response:", aiError);
    }

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
    if (status.status === "delivered") {
      await query(`
        UPDATE messages
        SET
          status = $1,
          delivered_at = to_timestamp($2),
          updated_at = NOW()
        WHERE whatsapp_message_id = $3
      `, [status.status, parseInt(status.timestamp), status.id]);
    } else if (status.status === "read") {
      await query(`
        UPDATE messages
        SET
          status = $1,
          read_at = to_timestamp($2),
          updated_at = NOW()
        WHERE whatsapp_message_id = $3
      `, [status.status, parseInt(status.timestamp), status.id]);
    } else {
      await query(`
        UPDATE messages
        SET
          status = $1,
          updated_at = NOW()
        WHERE whatsapp_message_id = $2
      `, [status.status, status.id]);
    }

    console.log("Message status updated:", status.id, status.status);
  } catch (error) {
    console.error("Error updating message status:", error);
  }
}
