import { query } from './lib/db';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function debugTenantAgent() {
  try {
    console.log('=== Debugging Tenant-Agent Relationship ===\n');
    
    // Get WhatsApp accounts
    const whatsappAccounts = await query('SELECT id, tenant_id, phone_number_id FROM whatsapp_accounts LIMIT 5');
    console.log('WhatsApp accounts:', whatsappAccounts);
    console.log('');
    
    // Get AI agents
    const aiAgents = await query('SELECT id, tenant_id, name, is_default, config FROM ai_agents LIMIT 5');
    console.log('AI agents:', aiAgents);
    console.log('');
    
    // Get tenants
    const tenants = await query('SELECT id, default_agent_id FROM tenants LIMIT 5');
    console.log('Tenants:', tenants);
    console.log('');
    
    // Check if there's a match between tenant IDs
    for (const waAccount of whatsappAccounts) {
      console.log(`WhatsApp Account ${waAccount.id} (tenant: ${waAccount.tenant_id}):`);
      
      // Check for direct agent match
      const directMatchingAgent = aiAgents.find(agent => agent.tenant_id === waAccount.tenant_id);
      console.log(`  Direct tenant match: ${!!directMatchingAgent}`);
      if (directMatchingAgent) {
        console.log(`    Matching agent: ${directMatchingAgent.name} (ID: ${directMatchingAgent.id}, is_default: ${directMatchingAgent.is_default})`);
      }
      
      // Check if tenant has a default agent ID
      const tenantInfo = tenants.find(t => t.id === waAccount.tenant_id);
      if (tenantInfo && tenantInfo.default_agent_id) {
        const linkedAgent = aiAgents.find(agent => agent.id === tenantInfo.default_agent_id);
        console.log(`  Tenant default agent link: ${!!linkedAgent}`);
        if (linkedAgent) {
          console.log(`    Linked agent: ${linkedAgent.name} (ID: ${linkedAgent.id}, tenant_id: ${linkedAgent.tenant_id})`);
        }
      } else {
        console.log('  No default agent ID in tenant record');
      }
      
      console.log('');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugTenantAgent();