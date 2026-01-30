import { query } from './lib/db';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fixWhatsAppTenantLink() {
  try {
    console.log("Connecting to database...");

    // Get the tenant that has a default agent configured
    const tenantResult = await query(
      'SELECT id, default_agent_id FROM tenants WHERE default_agent_id IS NOT NULL LIMIT 1'
    );

    if (tenantResult.length === 0) {
      console.log("No tenant found with a default agent configured");
      return;
    }

    const tenantWithAgent = tenantResult[0];
    console.log(`Found tenant with agent: ${tenantWithAgent.id}`);

    // Get the WhatsApp account
    const whatsappResult = await query(
      'SELECT id, tenant_id, phone_number_id FROM whatsapp_accounts LIMIT 1'
    );

    if (whatsappResult.length === 0) {
      console.log("No WhatsApp account found");
      return;
    }

    const whatsappAccount = whatsappResult[0];
    console.log(`Current WhatsApp account tenant: ${whatsappAccount.tenant_id}`);

    // Update the WhatsApp account to use the tenant that has the agent
    await query(
      'UPDATE whatsapp_accounts SET tenant_id = $1 WHERE id = $2',
      [tenantWithAgent.id, whatsappAccount.id]
    );

    console.log(`Updated WhatsApp account ${whatsappAccount.id} to use tenant ${tenantWithAgent.id}`);
    
    // Verify the update
    const updatedResult = await query(
      'SELECT id, tenant_id, phone_number_id FROM whatsapp_accounts WHERE id = $1',
      [whatsappAccount.id]
    );
    
    console.log('Updated WhatsApp account:', updatedResult[0]);

  } catch (error) {
    console.error("Error fixing WhatsApp tenant link:", error);
  }
}

fixWhatsAppTenantLink();