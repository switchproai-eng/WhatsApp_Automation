-- Migration to create business_templates table
-- This adds a new table to store business templates with logo and social media links

CREATE TABLE IF NOT EXISTS business_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_logo_url TEXT,
    description TEXT,
    website_url TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    linkedin_url TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    welcome_message TEXT,
    greeting_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_business_templates_tenant ON business_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_business_templates_created_at ON business_templates(created_at);