import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  try {
    // Get first tenant
    const tenants = await sql`SELECT id FROM tenants LIMIT 1`;
    if (tenants.length === 0) {
      console.log('No tenants found. Create a tenant first via signup/login.');
      return;
    }
    const tenantId = tenants[0].id;
    console.log('Tenant ID:', tenantId);

    // Seed full agent config
    const config = {
      profile: {
        name: "Test AI Agent",
        industry: "E-commerce",
        description: "AI agent that handles customer inquiries for WhatsApp automation demo.",
        tone: "friendly",
        language: "en",
        businessHoursStart: "09:00",
        businessHoursEnd: "17:00",
        timezone: "America/New_York",
        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      },
      prompt: {
        businessDescription: "Switch Pro Auto is a WhatsApp automation platform for businesses.",
        goals: ["Respond to customer inquiries", "Provide product information", "Schedule appointments"],
        tone: "professional",
        constraints: ["Be concise", "Use simple language", "Avoid technical jargon"],
        customInstructions: "You are a helpful AI assistant for Switch Pro Auto. Always be polite and offer to escalate to human if needed.",
        generatedPrompt: "You are Test AI Agent, a friendly AI assistant..."
      },
      capabilities: {
        autoRespond: true
      }
    };

    // Upsert
    await sql`
      INSERT INTO agent_configurations (tenant_id, config)
      VALUES (${tenantId}, ${config}::jsonb)
      ON CONFLICT (tenant_id) DO UPDATE SET
        config = ${config}::jsonb,
        updated_at = NOW()
    `;
    console.log('✅ Test AI agent profile seeded successfully!');
    console.log('Config:', JSON.stringify(config, null, 2));

    // Test fetch
    const fetched = await sql`SELECT config FROM agent_configurations WHERE tenant_id = ${tenantId}`;
    console.log('Fetched config:', fetched[0]?.config);
  } catch (error) {
    console.error('❌ Seed failed:', error);
  }
}

seed().catch(console.error);
