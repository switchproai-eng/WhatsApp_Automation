import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if a default agent already exists for this tenant
    const existingAgent = await query(`
      SELECT id, name, config, is_default 
      FROM ai_assistants 
      WHERE tenant_id = $1 AND is_default = true
      LIMIT 1
    `, [session.tenantId]);

    if (existingAgent.length > 0) {
      return NextResponse.json({ 
        message: "Default agent already exists", 
        agent: existingAgent[0] 
      });
    } else {
      // Create a default agent with auto-reply enabled
      const defaultAgent = await query(`
        INSERT INTO ai_assistants (
          tenant_id,
          name,
          system_prompt,
          model,
          temperature,
          max_tokens,
          fallback_threshold,
          escalation_keywords,
          is_default,
          config
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        RETURNING id, name, is_default, created_at
      `, [
        session.tenantId,
        'Default WhatsApp Assistant',
        'You are a helpful WhatsApp assistant. Respond to customer inquiries professionally and helpfully.',
        'gpt-4',
        0.7,
        500,
        0.6,
        '{}',
        true,
        JSON.stringify({
          profile: {
            name: 'Default WhatsApp Assistant',
            industry: 'Customer Service',
            description: 'Default assistant for handling customer inquiries',
            tone: 'friendly',
            language: 'en',
            businessHoursStart: '09:00',
            businessHoursEnd: '18:00',
            timezone: 'UTC',
            workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            phoneNumber: ''
          },
          response: {
            autoRespond: true,           // This is the key setting for auto-reply
            businessHoursOnly: false,    // Allow responses outside business hours
            responseDelay: 'immediate',
            delayTime: 2,
            escalationKeywords: ['manager', 'supervisor', 'complaint', 'urgent'],
            fallbackThreshold: 0.6,
            readReceipts: true,
            markAsRead: true,
            responseTemplates: [],
            enableTypingIndicator: true,
            autoCloseConversation: false,
            autoCloseTimeout: 24
          },
          prompt: {
            businessDescription: 'Default customer service assistant',
            goals: ['Answer customer questions', 'Provide helpful information', 'Escalate complex issues'],
            tone: 'friendly',
            constraints: ['Never share confidential information', 'Escalate when uncertain'],
            customInstructions: 'Always be polite and helpful to customers.'
          }
        })
      ]);

      return NextResponse.json({ 
        message: "Default agent created successfully", 
        agent: defaultAgent[0] 
      });
    }
  } catch (error) {
    console.error("Error in default agent initialization API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}