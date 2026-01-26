import { query } from "@/lib/db";

async function initializeWhatsAppAccount() {
  try {
    console.log("Initializing WhatsApp account in database...");

    // Check if WhatsApp account already exists
    const existingAccount = await query(`
      SELECT id FROM whatsapp_accounts WHERE tenant_id = 'default-tenant'
    `);

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
        WHERE tenant_id = 'default-tenant'
      `, [
        process.env.WHATSAPP_PHONE_NUMBER,
        process.env.WHATSAPP_PHONE_NUMBER_ID,
        process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        process.env.WHATSAPP_ACCESS_TOKEN,
        process.env.WHATSAPP_VERIFY_TOKEN
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
          'default-tenant',
          $1,
          $2,
          $3,
          $4,
          $5,
          'Default WhatsApp Account',
          'active'
        )
      `, [
        process.env.WHATSAPP_PHONE_NUMBER,
        process.env.WHATSAPP_PHONE_NUMBER_ID,
        process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        process.env.WHATSAPP_ACCESS_TOKEN,
        process.env.WHATSAPP_VERIFY_TOKEN
      ]);
    }

    console.log("WhatsApp account initialized successfully!");
  } catch (error) {
    console.error("Error initializing WhatsApp account:", error);
    process.exit(1);
  }
}

// Run the initialization
initializeWhatsAppAccount();