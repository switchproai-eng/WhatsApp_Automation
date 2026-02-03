import { neon } from "@neondatabase/serverless";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Create a direct database connection for this script
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in environment variables");
  }
  return neon(process.env.DATABASE_URL);
}

async function query(queryText, params = []) {
  const sql = getSql();
  const result = await sql.query(queryText, params);
  return Array.isArray(result) ? result : (result && typeof result === 'object' && 'rows' in result) ? result.rows : [];
}

async function diagnoseAgentWhatsAppLink() {
  try {
    console.log('=== Diagnosing Agent-WhatsApp Link Issues ===\n');

    // Get all tenants
    const tenants = await query('SELECT id, name FROM tenants');
    console.log(`Found ${tenants.length} tenants:`);
    tenants.forEach(t => console.log(`  - Tenant: ${t.name} (ID: ${t.id})`));
    console.log('');

    // Get all WhatsApp accounts
    const whatsappAccounts = await query(`
      SELECT id, tenant_id, phone_number, display_name, status 
      FROM whatsapp_accounts 
      ORDER BY created_at DESC
    `);
    console.log(`Found ${whatsappAccounts.length} WhatsApp accounts:`);
    whatsappAccounts.forEach(wa => {
      console.log(`  - WA: ${wa.display_name || wa.phone_number} (ID: ${wa.id}, Tenant: ${wa.tenant_id}, Status: ${wa.status})`);
    });
    console.log('');

    // Get all AI agents
    const aiAgents = await query(`
      SELECT id, tenant_id, name, is_default, created_at 
      FROM ai_agents 
      ORDER BY created_at DESC
    `);
    console.log(`Found ${aiAgents.length} AI agents:`);
    aiAgents.forEach(agent => {
      console.log(`  - Agent: ${agent.name} (ID: ${agent.id}, Tenant: ${agent.tenant_id}, Default: ${agent.is_default})`);
    });
    console.log('');

    // Check for each tenant
    for (const tenant of tenants) {
      console.log(`Tenant: ${tenant.name} (ID: ${tenant.id})`);
      
      // Get WhatsApp accounts for this tenant
      const tenantWA = whatsappAccounts.filter(wa => wa.tenant_id === tenant.id);
      console.log(`  WhatsApp accounts: ${tenantWA.length}`);
      tenantWA.forEach(wa => {
        console.log(`    - ${wa.display_name || wa.phone_number} (Status: ${wa.status})`);
      });

      // Get agents for this tenant
      const tenantAgents = aiAgents.filter(agent => agent.tenant_id === tenant.id);
      console.log(`  AI agents: ${tenantAgents.length}`);
      tenantAgents.forEach(agent => {
        console.log(`    - ${agent.name} (Default: ${agent.is_default})`);
      });

      // Check if there's a default agent
      const defaultAgent = tenantAgents.find(agent => agent.is_default);
      if (defaultAgent) {
        console.log(`  ✓ Has default agent: ${defaultAgent.name}`);
      } else {
        console.log(`  ⚠ No default agent configured for this tenant`);
      }

      console.log('');
    }

    // Check if there are WhatsApp accounts without any agents
    for (const wa of whatsappAccounts) {
      const tenantAgents = aiAgents.filter(agent => agent.tenant_id === wa.tenant_id);
      if (tenantAgents.length === 0) {
        console.log(`⚠ WhatsApp account ${wa.display_name || wa.phone_number} (ID: ${wa.id}) has no agents configured in tenant ${wa.tenant_id}`);
      } else {
        const defaultAgent = tenantAgents.find(agent => agent.is_default);
        if (!defaultAgent) {
          console.log(`⚠ WhatsApp account ${wa.display_name || wa.phone_number} (ID: ${wa.id}) has agents but no default agent in tenant ${wa.tenant_id}`);
        }
      }
    }

    console.log('\n=== Diagnosis Complete ===');
    
  } catch (error) {
    console.error('Error diagnosing Agent-WhatsApp link:', error.message);
    console.error(error.stack);
  }
}

diagnoseAgentWhatsAppLink();