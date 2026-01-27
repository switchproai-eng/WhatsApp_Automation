import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set');
}

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  try {
    console.log('Testing database connection...');

    // Test basic connection
    const result = await sql.query('SELECT 1 as test');
    console.log('Basic connection test:', result);

    // Test querying the ai_assistants table
    const assistants = await sql.query('SELECT id, name, tenant_id FROM ai_assistants LIMIT 3;');
    console.log('Sample ai_assistants:', assistants);

    // Test with a specific tenant ID (we'll use one from the previous check)
    const sampleTenantId = assistants[0]?.tenant_id;
    if (sampleTenantId) {
      console.log(`Testing with tenant_id: ${sampleTenantId}`);
      const tenantAssistants = await sql.query(
        'SELECT id, name, is_default FROM ai_assistants WHERE tenant_id = $1', 
        [sampleTenantId]
      );
      console.log('Assistants for sample tenant:', tenantAssistants);
    }

    // Test inserting a record (to see if INSERT works)
    try {
      const insertResult = await sql.query(
        `INSERT INTO ai_assistants (tenant_id, name, config, is_default) 
         VALUES ($1, $2, $3::jsonb, $4) 
         RETURNING id, name`,
        [sampleTenantId, 'Test Agent', '{}', false]
      );
      console.log('Insert test result:', insertResult);

      // Clean up - delete the test record
      if (insertResult[0]?.id) {
        await sql.query('DELETE FROM ai_assistants WHERE id = $1', [insertResult[0].id]);
        console.log('Test record cleaned up');
      }
    } catch (insertError) {
      console.log('Insert test failed (expected if invalid tenant_id):', insertError.message);
    }

    console.log('Database connection test completed successfully!');
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
}

testConnection();