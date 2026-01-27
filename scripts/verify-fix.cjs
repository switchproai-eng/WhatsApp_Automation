const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: './.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('Testing database connection...');

    const sql = neon(DATABASE_URL);

    // Test basic connection
    const result = await sql.query('SELECT 1 as test');
    console.log('Basic connection test:', result);

    // Test querying the ai_agents table
    const assistants = await sql.query('SELECT id, name, tenant_id FROM ai_agents LIMIT 3;');
    console.log('Sample ai_agents:', assistants);

    console.log('Database connection test completed successfully!');
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
}

testConnection();