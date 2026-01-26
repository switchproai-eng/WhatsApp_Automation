import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("Initializing default AI agent...");
    
    // Use the same default tenant ID
    const defaultTenantId = '00000000-0000-0000-0000-000000000000';
    
    // Check if default AI assistant already exists for this tenant
    const existingAgent = await query(`
      SELECT id FROM ai_assistants WHERE tenant_id = $1 AND is_default = true
    `, [defaultTenantId]);

    if (existingAgent.length > 0) {
      console.log("Default AI assistant already exists.");
      return NextResponse.json({ message: "Default AI assistant already exists!" });
    } else {
      console.log("Creating default AI assistant...");

      // Create a default AI assistant configuration
      await query(`
        INSERT INTO ai_assistants (
          tenant_id,
          name,
          system_prompt,
          model,
          temperature,
          max_tokens,
          fallback_threshold,
          escalation_keywords,
          is_default
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
      `, [
        defaultTenantId,
        'Default WhatsApp Assistant',
        'You are a helpful WhatsApp assistant. Respond to customer inquiries professionally and helpfully.',
        'gpt-4',
        0.7,
        500,
        0.6,
        '{}', // empty array for escalation keywords
        true
      ]);
      
      console.log("Default AI agent created successfully!");
      return NextResponse.json({ message: "Default AI agent created successfully!" });
    }
  } catch (error) {
    console.error("Error in AI agent initialization API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}