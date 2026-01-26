import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set');
}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log('🔄 Starting migration: single agent_configurations -> multi ai_agents...');

    // 1. Create trigger function if not exists
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;
    console.log('✅ Trigger function created/updated');

    // 2. Create ai_agents table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS ai_agents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        config JSONB NOT NULL DEFAULT '{}',
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ ai_agents table created/verified');

    // Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_agents_tenant ON ai_agents(tenant_id);`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS ai_agents_tenant_default ON ai_agents(tenant_id) WHERE is_default = true;`;
    console.log('✅ Indexes created');

    // Trigger
    await sql`
      CREATE TRIGGER IF NOT EXISTS update_ai_agents_updated_at
      BEFORE UPDATE ON ai_agents
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;
    console.log('✅ Trigger attached');

    // 3. Add default_agent_id to tenants - JS conditional to avoid Neon ALTER IF NOT EXISTS limitation
    const colExists = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'default_agent_id';`;
    if (colExists.length === 0) {
      await sql`ALTER TABLE tenants ADD COLUMN default_agent_id UUID;`;
      console.log('✅ tenants.default_agent_id column added');

      // Add FK constraint after column
      await sql`ALTER TABLE tenants ADD CONSTRAINT fk_tenants_default_agent FOREIGN KEY (default_agent_id) REFERENCES ai_agents(id) ON DELETE SET NULL;`;
      console.log('✅ FK constraint added');
    } else {
      console.log('ℹ️ tenants.default_agent_id column already exists');
    }

    // 4. Check if migration needed (agent_configurations exists and has data)
    const oldConfigs = await sql`SELECT COUNT(*) as count FROM agent_configurations;`;
    const oldCount = oldConfigs[0]?.count || 0;
    console.log(`📊 Found ${oldCount} old agent_configurations rows`);

    if (oldCount === 0) {
      console.log('ℹ️ No old data to migrate. Migration complete.');
      return;
    }

    // 5. Migrate data
    const configs = await sql`SELECT tenant_id, config FROM agent_configurations;`;
    for (const row of configs) {
      await sql`
        INSERT INTO ai_agents (tenant_id, name, config, is_default)
        VALUES (${row.tenant_id}, 'Migrated Agent', ${row.config}::jsonb, true)
        ON CONFLICT (tenant_id, is_default) DO NOTHING;
      `;
    }
    console.log('✅ Migrated data to ai_agents');

    // 6. Update tenants default_agent_id
    await sql`
      UPDATE tenants t
      SET default_agent_id = (
        SELECT id FROM ai_agents a
        WHERE a.tenant_id = t.id AND a.is_default = true
        LIMIT 1
      )
      WHERE t.default_agent_id IS NULL;
    `;
    console.log('✅ Updated tenants.default_agent_id');

    // 7. Drop old table if empty/success
    await sql`DROP TABLE IF EXISTS agent_configurations CASCADE;`;
    console.log('🗑️ Dropped old agent_configurations table');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate().catch(console.error);
