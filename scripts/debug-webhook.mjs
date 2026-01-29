import { query } from '../lib/db';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function debugWebhookSetup() {
  console.log('🔍 Debugging WhatsApp Webhook Setup...\n');

  // 1. Check if WhatsApp account is properly configured in DB
  console.log('1. Checking WhatsApp account in database...');
  try {
    const accounts = await query(`
      SELECT id, tenant_id, phone_number, phone_number_id, waba_id, access_token, status
      FROM whatsapp_accounts
      LIMIT 10
    `);
    
    if (accounts.length === 0) {
      console.log('❌ No WhatsApp accounts found in database');
    } else {
      console.log('✅ WhatsApp accounts found:');
      accounts.forEach(acc => {
        console.log(`   - ID: ${acc.id}`);
        console.log(`   - Phone Number: ${acc.phone_number}`);
        console.log(`   - Phone Number ID: ${acc.phone_number_id}`);
        console.log(`   - WABA ID: ${acc.waba_id}`);
        console.log(`   - Status: ${acc.status}\n`);
      });
    }
  } catch (error) {
    console.log('❌ Error checking WhatsApp accounts:', error.message);
  }

  // 2. Check if AI agents are properly configured
  console.log('2. Checking AI agents in database...');
  try {
    const agents = await query(`
      SELECT id, tenant_id, name, config, is_default, created_at
      FROM ai_agents
      LIMIT 10
    `);
    
    if (agents.length === 0) {
      console.log('❌ No AI agents found in database');
    } else {
      console.log('✅ AI agents found:');
      agents.forEach(agent => {
        console.log(`   - ID: ${agent.id}`);
        console.log(`   - Tenant ID: ${agent.tenant_id}`);
        console.log(`   - Name: ${agent.name}`);
        console.log(`   - Is Default: ${agent.is_default}`);
        console.log(`   - Has Config: ${!!agent.config}\n`);
      });
    }
  } catch (error) {
    console.log('❌ Error checking AI agents:', error.message);
  }

  // 3. Check environment variables
  console.log('3. Checking environment variables...');
  const requiredVars = [
    'WHATSAPP_VERIFY_TOKEN',
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_BUSINESS_ACCOUNT_ID',
    'DATABASE_URL'
  ];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`❌ ${varName}: Not set`);
    }
  });

  // 4. Check if there are any conversations or messages
  console.log('\n4. Checking recent conversations and messages...');
  try {
    const conversations = await query(`
      SELECT id, tenant_id, contact_id, whatsapp_account_id, status, last_message, created_at
      FROM conversations
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    if (conversations.length === 0) {
      console.log('❌ No conversations found in database');
    } else {
      console.log('✅ Recent conversations:');
      conversations.forEach(conv => {
        console.log(`   - ID: ${conv.id}`);
        console.log(`   - Status: ${conv.status}`);
        console.log(`   - Last message: ${conv.last_message?.substring(0, 30) || 'None'}`);
        console.log(`   - Created: ${conv.created_at}\n`);
      });
    }
  } catch (error) {
    console.log('❌ Error checking conversations:', error.message);
  }

  try {
    const messages = await query(`
      SELECT id, conversation_id, direction, content, status, created_at
      FROM messages
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    if (messages.length === 0) {
      console.log('❌ No messages found in database');
    } else {
      console.log('✅ Recent messages:');
      messages.forEach(msg => {
        console.log(`   - Direction: ${msg.direction}`);
        console.log(`   - Content: ${msg.content?.substring(0, 30) || 'None'}...`);
        console.log(`   - Status: ${msg.status}`);
        console.log(`   - Created: ${msg.created_at}\n`);
      });
    }
  } catch (error) {
    console.log('❌ Error checking messages:', error.message);
  }

  console.log('\n💡 Suggestions:');
  console.log('   • Make sure your webhook URL is correctly set in Meta Developer Portal');
  console.log('   • Verify that your phone number is verified in WhatsApp Business Manager');
  console.log('   • Ensure your app has the required permissions');
  console.log('   • Check that your agent is configured with auto-reply enabled');
  console.log('   • Verify that your OpenAI API key is working');
}

debugWebhookSetup().catch(console.error);