import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIConfig {
  agentName: string;
  agentRole: string;
  businessDescription?: string;
  tone?: string;
  language?: string;
  capabilities?: {
    autoRespond?: boolean;
    leadCapture?: boolean;
    appointmentBooking?: boolean;
  };
}

export async function generateAIResponse(
  message: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  config: AIConfig
): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Build system prompt
    let systemPrompt = `You are ${config.agentName || "an AI assistant"}`;

    if (config.agentRole) {
      systemPrompt += `, ${config.agentRole}.`;
    } else {
      systemPrompt += ".";
    }

    if (config.businessDescription) {
      systemPrompt += `\n\nBusiness Context: ${config.businessDescription}`;
    }

    // Add tone instruction
    const toneInstructions: Record<string, string> = {
      professional: "Maintain a professional, formal, and business-appropriate tone.",
      friendly: "Be warm, approachable, and conversational.",
      casual: "Use a relaxed, informal, and conversational style.",
      enthusiastic: "Be energetic, positive, and engaging.",
      empathetic: "Show understanding, care, and emotional intelligence.",
    };

    if (config.tone && toneInstructions[config.tone]) {
      systemPrompt += `\n\nTone: ${toneInstructions[config.tone]}`;
    }

    // Add language instruction if not English
    if (config.language && config.language !== "en") {
      systemPrompt += `\n\nIMPORTANT: Respond in the following language code: ${config.language}`;
    }

    // Add capability-specific instructions
    if (config.capabilities?.autoRespond) {
      systemPrompt += "\\n\\nYou can automatically respond to customer inquiries.";
    }

    // Build messages array
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history (last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current message
    messages.push({ role: "user", content: message });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("No response generated from AI");
    }

    return response;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}

export async function checkBusinessHours(
  tenantId: string,
  timezone: string = "UTC"
): Promise<boolean> {
  try {
    // Query default agent configuration
    const { sql } = await import("@/lib/db");
    const agentResult = await sql`
      SELECT config FROM ai_agents
      WHERE tenant_id = ${tenantId} AND is_default = true
      LIMIT 1
    `;

    if (agentResult.length === 0) {
      // No config found, assume 24/7
      return true;
    }

    const config = agentResult[0].config as any;
    const profile = config.profile || {};

    // If no business hours set, assume always open
    if (!profile.businessHoursStart || !profile.businessHoursEnd) {
      return true;
    }

    // Get current time in business timezone
    const now = new Date();
    const timeInZone = new Date(now.toLocaleString("en-US", { timeZone: profile.timezone || timezone }));

    const currentHour = timeInZone.getHours();
    const currentMinute = timeInZone.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    // Parse business hours
    const [startHour, startMin] = profile.businessHoursStart.split(":").map(Number);
    const [endHour, endMin] = profile.businessHoursEnd.split(":").map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Check if current time is within business hours
    const isWithinHours = currentTime >= startTime && currentTime <= endTime;

    // Check if today is a working day
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDay = dayNames[timeInZone.getDay()];
    const isWorkingDay = !profile.workDays || profile.workDays.length === 0 || profile.workDays.includes(currentDay);

    return isWithinHours && isWorkingDay;
  } catch (error) {
    console.error("Error checking business hours:", error);
    // Default to allowing response if there's an error
    return true;
  }
}

export function shouldUseAIResponse(config: any): boolean {
  try {
    // Check if config exists
    if (!config || !config.capabilities) {
      return false;
    }

    // Check if AI should auto-respond
    const capabilities = config.capabilities;
    return capabilities.autoRespond === true || capabilities.automated === true;
  } catch (error) {
    console.error("Error checking AI capabilities:", error);
    return false;
  }
}
