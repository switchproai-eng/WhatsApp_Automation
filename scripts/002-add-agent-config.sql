-- Add agent_configurations table for Smart Agent Configuration System
CREATE TABLE IF NOT EXISTS agent_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agent_configurations_tenant ON agent_configurations(tenant_id);

-- Add comment for documentation
COMMENT ON TABLE agent_configurations IS 'Stores AI agent configuration settings per tenant including profile, knowledge base, behavior settings, escalation rules, booking settings, campaign rules, response templates, and AI prompt builder configurations';
