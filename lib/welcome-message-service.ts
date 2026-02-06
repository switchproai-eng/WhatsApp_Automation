import { query } from '@/lib/db';
import { WhatsAppService } from '@/lib/whatsapp';

/**
 * Service to handle sending welcome messages to new contacts
 */
export class WelcomeMessageService {
  static async sendWelcomeMessage(phoneNumber: string, tenantId: string, whatsappService: WhatsAppService) {
    try {
      // Get the business template with welcome message for this tenant
      const templates = await query(
        `SELECT welcome_message, greeting_message, business_logo_url, business_name, description
         FROM business_templates
         WHERE tenant_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [tenantId]
      );

      if (templates.length === 0) {
        console.log(`No business template found for tenant ${tenantId}`);
        return;
      }

      const template = templates[0] as {
        welcome_message: string | null;
        greeting_message: string | null;
        business_logo_url: string | null;
        business_name: string | null;
        description: string | null;
      };

      // Send welcome message if available
      if (template.welcome_message) {
        await whatsappService.sendTextMessage({
          to: phoneNumber,
          text: template.welcome_message
        });
      }

      // Send greeting message if available
      if (template.greeting_message) {
        await whatsappService.sendTextMessage({
          to: phoneNumber,
          text: template.greeting_message
        });
      }

      // Optionally send business card with logo and details
      if (template.business_logo_url || template.business_name || template.description) {
        const businessCardMessage = 
          `*${template.business_name || 'Our Business'}*\n\n` +
          `${template.description || ''}\n\n` +
          `For more information, connect with us on social media or visit our website.`;
        
        await whatsappService.sendTextMessage({
          to: phoneNumber,
          text: businessCardMessage
        });
      }

      console.log(`Welcome messages sent to ${phoneNumber} for tenant ${tenantId}`);
    } catch (error) {
      console.error('Error sending welcome message:', error);
      throw error;
    }
  }

  /**
   * Check if a contact is new and should receive a welcome message
   */
  static async isNewContact(phoneNumber: string, tenantId: string): Promise<boolean> {
    try {
      // Check if this phone number has had previous conversations with this tenant
      const result = await query(
        `SELECT COUNT(*) as count
         FROM conversations
         WHERE tenant_id = $1 AND phone_number = $2`,
        [tenantId, phoneNumber]
      );

      const count = parseInt((result[0] as { count: string }).count) || 0;
      return count === 0;
    } catch (error) {
      console.error('Error checking if contact is new:', error);
      // If there's an error, assume it's a new contact to be safe
      return true;
    }
  }

  /**
   * Process incoming message and send welcome message if contact is new
   */
  static async processIncomingMessage(phoneNumber: string, tenantId: string, whatsappService: WhatsAppService) {
    try {
      const isNew = await this.isNewContact(phoneNumber, tenantId);
      
      if (isNew) {
        await this.sendWelcomeMessage(phoneNumber, tenantId, whatsappService);
      }
    } catch (error) {
      console.error('Error processing incoming message for welcome:', error);
    }
  }
}