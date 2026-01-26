const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: './.env.local' });

// Get the database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables');
  process.exit(1);
}

async function checkAIAgentTable() {
  try {
    console.log('Creating database connection...');
    const sql = neon(DATABASE_URL);
    
    console.log('Checking if ai_agents table exists...');
    const result = await sql.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ai_agents'
      ) AS table_exists;
    `);
    
    console.log('ai_agents table exists:', result[0]?.table_exists);
    
    if (result[0]?.table_exists) {
      console.log('Checking ai_agents count...');
      const agentCount = await sql.query('SELECT COUNT(*) FROM ai_agents;');
      console.log('Number of AI agents:', agentCount[0]?.count || 0);
      
      // Check for any agents with sample tenant ID (just to see if there are records)
      const sampleAgents = await sql.query('SELECT id, tenant_id, name, is_default FROM ai_agents LIMIT 5;');
      console.log('Sample AI agents:', sampleAgents);
    } else {
      console.log('ai_agents table does not exist. Schema migration might be needed.');
    }
    
    console.log('Database check completed!');
  } catch (error) {
    console.error('Database error:', error);
  }
}

checkAIAgentTable();