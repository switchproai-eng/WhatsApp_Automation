import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrateData() {
  try {
    console.log('🔄 Data migration: agent_configurations -> ai_agents...');

    // Check column
    const colExists = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'default_agent_id';`;
    if (colExists.length === 0) {
      await sql`ALTER TABLE tenants ADD COLUMN default_agent_id UUID;`;
      console.log('✅ Added default_agent_id column');

      // Add FK
      await sql`ALTER TABLE tenants ADD CONSTRAINT fk_tenants_default_agent FOREIGN KEY (default_agent_id) REFERENCES ai_agents(id) ON DELETE SET NULL;`;
      console.log('✅ Added FK constraint');
    } else {
      console.log('ℹ️ default_agent_id column exists');
    }

    // Migrate data
    const configs = await sql`SELECT tenant_id, config FROM agent_configurations;`;
    console.log(`📊 Migrating ${configs.length} configs...`);

    for (const row of configs) {
      const newAgent = await sql`
        INSERT INTO ai_agents (tenant_id, name, config, is_default)
        VALUES (${row.tenant_id}, 'Migrated Agent', ${row.config}::jsonb, true)
        RETURNING id;
      `;
      console.log(`✅ Migrated tenant ${row.tenant_id.slice(0,8)}... to agent ${newAgent[0].id}`);

      // Set tenant default
      await sql`UPDATE tenants SET default_agent_id = ${newAgent[0].id} WHERE id = ${row.tenant_id};`;
    }

    // Drop old table
    await sql`DROP TABLE IF EXISTS agent_configurations CASCADE;`;
    console.log('🗑️ Dropped old table');

    console.log('🎉 Data migration complete!');
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

migrateData().catch(console.error);
