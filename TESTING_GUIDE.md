# WhatsApp AI Agent - Testing Guide

## ✅ Installation Complete

All components have been installed and configured:

1. ✓ OpenAI package installed
2. ✓ AI utility library created (`lib/ai.ts`)
3. ✓ Webhook handler updated with auto-reply
4. ✓ OpenAI connection tested successfully

## 🔧 Environment Variables Required

Ensure your `.env.local` file has these variables:

```env
# Database
DATABASE_URL="your_postgres_connection_string"

# OpenAI
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx"

# WhatsApp Cloud API
WHATSAPP_VERIFY_TOKEN="your_webhook_verify_token"
WHATSAPP_ACCESS_TOKEN="your_whatsapp_access_token"
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WEBHOOK_URL="https://your-domain.com/api/webhooks/whatsapp"

# JWT Secret (for auth)
JWT_SECRET="your-jwt-secret-key"
```

## 🧪 Testing Steps

### 1. Test Profile Saving
1. Go to Dashboard → Agent Configuration
2. Fill in agent details:
   - Agent Name (e.g., "Support Bot")
   - Industry (e.g., "Technology")
   - Business Description
   - Tone (e.g., "professional")
   - Language (e.g., "en")
3. Click "Save Profile"
4. Check browser console and toast notifications for success

### 2. Verify Configuration in Database
```sql
SELECT * FROM agent_configurations WHERE tenant_id = 'your_tenant_id';
```

### 3. Test WhatsApp Webhook
1. Use ngrok or similar to expose local server:
   ```bash
   ngrok http 3000
   ```

2. Update Facebook Webhook URL in WhatsApp Business settings:
   ```
   https://your-ngrok-url/api/webhooks/whatsapp
   ```

3. Send test message to your WhatsApp number

### 4. Verify AI Response
Check the webhook logs to see:
- Message received
- AI response generated
- Response sent back to user

### 5. Common Issues

**Issue: AI not responding**
- Check if OpenAI API key is valid and has credits
- Verify agent configuration has auto-respond enabled
- Ensure business hours are set correctly
- Check webhook logs: `console.log("AI auto-response sent successfully")`

**Issue: Webhook not receiving messages**
- Verify verify token matches
- Check WhatsApp Business API is subscribed to messages webhook
- Ensure phone number ID is correct

**Issue: Profile not saving**
- Check browser console for errors
- Verify API endpoint `/api/agent/config` is accessible
- Check network tab for POST request

## 📝 Expected Flow

1. User sends WhatsApp message to your number
2. Meta sends webhook to `/api/webhooks/whatsapp`
3. System:
   - Validates webhook
   - Finds/creates contact
   - Finds/creates conversation
   - Stores incoming message
   - **Checks agent config for AI settings**
   - **Generates AI response using OpenAI**
   - **Sends response back via WhatsApp API**
   - Stores AI response in database
4. User receives AI-generated reply instantly

## 🎯 Next Steps

1. Configure your WhatsApp Business API
2. Set up webhook URL in Facebook Developer Console
3. Test end-to-end flow
4. Customize agent behavior in the dashboard
5. Monitor conversations in the inbox

## 🐛 Debug Commands

```bash
# Test AI connection
node scripts/test-ai-response.mjs

# Check webhook route
cat app/api/webhooks/whatsapp/route.ts | grep -A 20 "shouldAutoRespond"

# Build project
npm run build

# Start dev server
npm run dev
```
