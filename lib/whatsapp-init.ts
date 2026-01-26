// Script to initialize default tenant and WhatsApp account

import { query } from "@/lib/db";

export async function initializeDefaultTenant() {
  try {
    console.log("Initializing default tenant...");
    
    // Use a default tenant ID - we'll use a consistent UUID for the default tenant
    const defaultTenantId = '00000000-0000-0000-0000-000000000000'; // A fixed UUID for default tenant
    
    // Check if default tenant already exists
    const existingTenant = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [defaultTenantId]);
    
    if (existingTenant.length > 0) {
      console.log("Default tenant already exists.");
    } else {
      console.log("Creating default tenant...");
      
      // Create default tenant
      await query(`
        INSERT INTO tenants (
          id,
          name,
          slug,
          plan,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, NOW(), NOW()
        )
      `, [
        defaultTenantId,
        'Default Tenant',
        'default-tenant',
        'free'
      ]);
    }
    
    console.log("Default tenant initialized successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error initializing default tenant:", error);
    return { success: false, error: error.message };
  }
}

export async function initializeWhatsAppAccount() {
  try {
    console.log("Initializing WhatsApp account in database...");
    
    // Use a default tenant ID - we'll use a consistent UUID for the default tenant
    const defaultTenantId = '00000000-0000-0000-0000-000000000000'; // A fixed UUID for default tenant
    
    // First, initialize the default tenant
    const tenantResult = await initializeDefaultTenant();
    if (!tenantResult.success) {
      return tenantResult;
    }
    
    // Check if WhatsApp account already exists
    const existingAccount = await query(`
      SELECT id FROM whatsapp_accounts WHERE tenant_id = $1
    `, [defaultTenantId]);
    
    if (existingAccount.length > 0) {
      console.log("WhatsApp account already exists in database. Updating...");
      
      // Update existing account
      await query(`
        UPDATE whatsapp_accounts 
        SET 
          phone_number = $1,
          phone_number_id = $2,
          waba_id = $3,
          access_token = $4,
          webhook_verify_token = $5,
          display_name = 'Default WhatsApp Account',
          status = 'active',
          updated_at = NOW()
        WHERE tenant_id = $6
      `, [
        process.env.WHATSAPP_PHONE_NUMBER,
        process.env.WHATSAPP_PHONE_NUMBER_ID,
        process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        process.env.WHATSAPP_ACCESS_TOKEN,
        process.env.WHATSAPP_VERIFY_TOKEN,
        defaultTenantId
      ]);
    } else {
      console.log("Creating new WhatsApp account in database...");
      
      // Create new account
      await query(`
        INSERT INTO whatsapp_accounts (
          tenant_id,
          phone_number,
          phone_number_id,
          waba_id,
          access_token,
          webhook_verify_token,
          display_name,
          status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
      `, [
        defaultTenantId,
        process.env.WHATSAPP_PHONE_NUMBER,
        process.env.WHATSAPP_PHONE_NUMBER_ID,
        process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        process.env.WHATSAPP_ACCESS_TOKEN,
        process.env.WHATSAPP_VERIFY_TOKEN,
        'Default WhatsApp Account',
        'active'
      ]);
    }
    
    console.log("WhatsApp account initialized successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error initializing WhatsApp account:", error);
    return { success: false, error: error.message };
  }
}