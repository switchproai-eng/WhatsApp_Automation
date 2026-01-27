const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: './.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables');
  process.exit(1);
}

console.log('DATABASE_URL:', DATABASE_URL.replace(/\/\/([^:]+):[^@]*@/, '//***:***@'));

async function testConnection() {
  try {
    console.log('Testing database connection...');

    const sql = neon(DATABASE_URL);

    // Test basic connection
    const result = await sql.query('SELECT 1 as test');
    console.log('Basic connection test:', result);

    // Check all tables in the database
    const tables = await sql.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_type = 'BASE TABLE' 
      ORDER BY table_schema, table_name;
    `);
    console.log('All tables in database:');
    tables.forEach(row => {
      console.log(`  ${row.table_schema}.${row.table_name}`);
    });

    // Specifically check for ai_assistants and agent_configurations
    const aiAssistantsExists = tables.some(row => row.table_name === 'ai_assistants');
    const agentConfigurationsExists = tables.some(row => row.table_name === 'agent_configurations');
    
    console.log(`ai_assistants exists: ${aiAssistantsExists}`);
    console.log(`agent_configurations exists: ${agentConfigurationsExists}`);

    if (aiAssistantsExists) {
      console.log('Testing ai_assistants table...');
      const assistants = await sql.query('SELECT id, name, tenant_id FROM ai_assistants LIMIT 3;');
      console.log('Sample ai_assistants:', assistants);
    } else if (agentConfigurationsExists) {
      console.log('Testing agent_configurations table...');
      const configs = await sql.query('SELECT id, tenant_id FROM agent_configurations LIMIT 3;');
      console.log('Sample agent_configurations:', configs);
    } else {
      console.log('Neither ai_assistants nor agent_configurations table exists!');
    }

    console.log('Database connection test completed!');
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
}

testConnection();