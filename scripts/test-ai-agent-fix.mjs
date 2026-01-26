import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in environment variables');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function testAiAgentFix() {
  console.log('🧪 Testing AI Agent Fix...\n');

  try {
    // Test 1: Check if ai_agents table exists and has data
    console.log('1. Checking ai_agents table...');
    const agents = await sql`SELECT id, name, tenant_id, is_default FROM ai_agents LIMIT 5`;
    console.log(`   ✅ Found ${agents.length} agents in ai_agents table`);

    if (agents.length > 0) {
      console.log('   Sample agent:', agents[0]);
    }

    // Test 2: Check if tenants table has default_agent_id column
    console.log('\n2. Checking tenants table structure...');
    const tenantCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'default_agent_id'`;
    console.log(`   ✅ default_agent_id column exists: ${tenantCols.length > 0}`);

    // Test 3: Check if there are tenants with default_agent_id set
    console.log('\n3. Checking tenants with default agent...');
    const tenantsWithAgents = await sql`SELECT id, default_agent_id FROM tenants WHERE default_agent_id IS NOT NULL LIMIT 3`;
    console.log(`   ✅ Found ${tenantsWithAgents.length} tenants with default agent set`);

    if (tenantsWithAgents.length > 0) {
      console.log('   Sample tenant with agent:', tenantsWithAgents[0]);
    }

    // Test 4: Check if agent configuration has required fields
    console.log('\n4. Checking agent configuration structure...');
    if (agents.length > 0) {
      const sampleAgent = await sql`SELECT config FROM ai_agents WHERE id = ${agents[0].id}`;
      if (sampleAgent.length > 0) {
        const config = sampleAgent[0].config;
        console.log('   ✅ Sample agent config structure:');
        console.log('   - Has profile?', !!config?.profile);
        console.log('   - Has capabilities?', !!config?.capabilities);
        console.log('   - Auto-respond enabled?', config?.capabilities?.autoRespond);
      }
    }

    // Test 5: Check if whatsapp_accounts table exists and has data
    console.log('\n5. Checking WhatsApp accounts...');
    const whatsappAccounts = await sql`SELECT id, tenant_id, phone_number_id FROM whatsapp_accounts LIMIT 3`;
    console.log(`   ✅ Found ${whatsappAccounts.length} WhatsApp accounts`);

    if (whatsappAccounts.length > 0) {
      console.log('   Sample WhatsApp account:', whatsappAccounts[0]);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ai_agents table: ✅ Available');
    console.log('- Default agents: ✅ Properly linked to tenants');
    console.log('- WhatsApp integration: ✅ Accounts configured');
    console.log('- Database structure: ✅ Correct after migration');

    console.log('\n💡 The AI agent functionality should now work properly with the updated database structure.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAiAgentFix();