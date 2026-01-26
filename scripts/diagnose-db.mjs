import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function diagnose() {
  try {
    console.log('📋 Tables:');
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`;
    console.log(tables.map(t => t.table_name).join('\n'));

    console.log('\n📋 ai_agents columns:');
    const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'ai_agents' ORDER BY ordinal_position;`;
    console.log(cols.map(c => `${c.column_name}: ${c.data_type}`).join('\n'));

    console.log('\n🔍 tenants.default_agent_id exists?');
    const tenantCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'default_agent_id';`;
    console.log(tenantCols.length ? '✅ Exists' : '❌ Missing');

    console.log('\n📊 Counts:');
    const agentCount = await sql`SELECT COUNT(*) as count FROM ai_agents;`;
    console.log('ai_agents:', agentCount[0].count);

    const configCount = await sql`SELECT COUNT(*) as count FROM agent_configurations;`;
    console.log('agent_configurations:', configCount[0].count || 0);

    const tenants = await sql`SELECT COUNT(*) as count FROM tenants;`;
    console.log('tenants:', tenants[0].count);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

diagnose().catch(console.error);