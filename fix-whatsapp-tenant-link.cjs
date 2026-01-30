require('dotenv').config();
const { Client } = require('pg');

async function fixWhatsAppTenantLink() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Get the tenant that has a default agent configured
    const tenantResult = await client.query(
      'SELECT id, default_agent_id FROM tenants WHERE default_agent_id IS NOT NULL LIMIT 1'
    );

    if (tenantResult.rows.length === 0) {
      console.log("No tenant found with a default agent configured");
      return;
    }

    const tenantWithAgent = tenantResult.rows[0];
    console.log(`Found tenant with agent: ${tenantWithAgent.id}`);

    // Get the WhatsApp account
    const whatsappResult = await client.query(
      'SELECT id, tenant_id, phone_number_id FROM whatsapp_accounts LIMIT 1'
    );

    if (whatsappResult.rows.length === 0) {
      console.log("No WhatsApp account found");
      return;
    }

    const whatsappAccount = whatsappResult.rows[0];
    console.log(`Current WhatsApp account tenant: ${whatsappAccount.tenant_id}`);

    // Update the WhatsApp account to use the tenant that has the agent
    await client.query(
      'UPDATE whatsapp_accounts SET tenant_id = $1 WHERE id = $2',
      [tenantWithAgent.id, whatsappAccount.id]
    );

    console.log(`Updated WhatsApp account ${whatsappAccount.id} to use tenant ${tenantWithAgent.id}`);
    
    // Verify the update
    const updatedResult = await client.query(
      'SELECT id, tenant_id, phone_number_id FROM whatsapp_accounts WHERE id = $1',
      [whatsappAccount.id]
    );
    
    console.log('Updated WhatsApp account:', updatedResult.rows[0]);

  } catch (error) {
    console.error("Error fixing WhatsApp tenant link:", error);
  } finally {
    await client.end();
  }
}

fixWhatsAppTenantLink();