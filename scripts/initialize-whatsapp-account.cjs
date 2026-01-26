require('dotenv').config();

const { Client } = require('pg');

async function initializeWhatsAppAccount() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Check if WhatsApp account already exists
    const existingAccount = await client.query(
      'SELECT id FROM whatsapp_accounts WHERE tenant_id = $1',
      ['default-tenant']
    );
    
    if (existingAccount.rows.length > 0) {
      console.log("WhatsApp account already exists in database. Updating...");
      
      // Update existing account
      await client.query(`
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
        'default-tenant'
      ]);
    } else {
      console.log("Creating new WhatsApp account in database...");
      
      // Create new account
      await client.query(`
        INSERT INTO whatsapp_accounts (
          tenant_id,
          phone_number,
          phone_number_id,
          waba_id,
          access_token,
          webhook_verify_token,
          display_name,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'default-tenant',
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
  } catch (error) {
    console.error("Error initializing WhatsApp account:", error);
  } finally {
    await client.end();
  }
}

// Run the initialization
initializeWhatsAppAccount();