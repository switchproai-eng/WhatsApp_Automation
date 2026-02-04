# WhatsFlow - WhatsApp Automation Platform

A full-featured WhatsApp automation SaaS platform for marketing, sales, and customer support. Built with Next.js 16, React 19, and powered by OpenAI GPT-4 for intelligent automated responses.

## Features

### Core Features
- **Inbox Management** - Real-time conversation handling with agent assignment
- **Contact Management** - Customer database with tags, opt-in tracking, and segmentation
- **AI Agents** - GPT-4 powered chatbots with customizable personalities and knowledge bases
- **Broadcast Campaigns** - Schedule and send marketing messages to contact lists
- **Message Templates** - WhatsApp-approved template management
- **Automation Flows** - Visual workflow builder for automated messaging sequences
- **Quick Replies** - Predefined responses for faster customer support
- **Analytics Dashboard** - Comprehensive reporting on messages, conversations, and agent performance

### AI Agent Capabilities
- Custom personality and tone configuration
- Knowledge base with FAQs, products, and policies
- Business hours awareness
- Escalation rules (sentiment, keywords, confidence threshold)
- Conversation context understanding

### Multi-Tenancy
- Full tenant isolation
- Team member management
- Plan-based feature access

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.0.10 (App Router) |
| Frontend | React 19.2.0, TypeScript |
| Database | Neon (Serverless PostgreSQL) |
| Auth | Custom JWT (jose + bcryptjs) |
| AI | OpenAI GPT-4 |
| UI | shadcn/ui, Tailwind CSS, Radix UI |
| Charts | Recharts |
| Data Fetching | SWR |

## Prerequisites

- Node.js 18+
- npm or yarn
- Neon Database account
- Meta Developer account (for WhatsApp Business API)
- OpenAI API key (for AI features)

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database (Neon)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Authentication
JWT_SECRET=your_jwt_secret_key_min_32_characters

# OpenAI (for AI Agents)
OPENAI_API_KEY=sk-your-openai-api-key

# WhatsApp Cloud API
WHATSAPP_VERIFY_TOKEN=your_custom_verification_string
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id
WHATSAPP_APP_ID=your_meta_app_id
WHATSAPP_APP_SECRET=your_meta_app_secret

# Facebook SDK (for Embedded Signup)
FACEBOOK_APP_ID=your_meta_app_id
FACEBOOK_APP_SECRET=your_meta_app_secret
NEXT_PUBLIC_FACEBOOK_APP_ID=your_meta_app_id
NEXT_PUBLIC_WHATSAPP_CONFIG_ID=your_whatsapp_config_id

# App URL (for webhooks)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/whatsflow.git
   cd whatsflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run database migrations**
   ```bash
   # Execute SQL scripts in order from /scripts folder
   # Scripts are numbered: 001-create-schema.sql, 002-..., etc.
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   ```
   http://localhost:3000
   ```

## WhatsApp Business API Setup

### Step 1: Create Meta App

1. Go to [Meta Developer Portal](https://developers.facebook.com)
2. Create a new app (Business type)
3. Add the **WhatsApp** product to your app

### Step 2: Get API Credentials

1. In WhatsApp > API Setup, note down:
   - **Phone Number ID**
   - **WhatsApp Business Account ID**
   - **Temporary Access Token** (or create a permanent one)

### Step 3: Configure Webhook

1. In WhatsApp > Configuration, set:
   - **Callback URL**: `https://your-domain.com/api/webhooks/whatsapp`
   - **Verify Token**: Same value as `WHATSAPP_VERIFY_TOKEN` in your env
2. Subscribe to webhook fields:
   - `messages`
   - `message_template_status_update` (optional)

### Step 4: Generate Permanent Access Token

1. Go to Business Settings > System Users
2. Create a System User with Admin role
3. Generate a token with permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`

### Step 5: Connect in App

1. Navigate to Settings > WhatsApp in the dashboard
2. Either:
   - Use **Embedded Signup** (one-click connection)
   - Or **Manual Setup** with your credentials

## Project Structure

```
├── app/
│   ├── (auth)/              # Login/Signup pages
│   ├── (dashboard)/         # Protected dashboard pages
│   │   └── dashboard/
│   │       ├── agents/      # AI agent management
│   │       ├── analytics/   # Reports & analytics
│   │       ├── campaigns/   # Broadcast campaigns
│   │       ├── contacts/    # Contact management
│   │       ├── flows/       # Automation workflows
│   │       ├── inbox/       # Messaging inbox
│   │       ├── quick-replies/
│   │       ├── settings/    # App settings
│   │       └── templates/   # Message templates
│   ├── api/                 # API routes
│   │   ├── agents/
│   │   ├── auth/
│   │   ├── campaigns/
│   │   ├── contacts/
│   │   ├── conversations/
│   │   ├── messages/
│   │   ├── settings/
│   │   └── webhooks/
│   └── page.tsx             # Landing page
├── components/
│   ├── agents/              # AI agent components
│   ├── campaigns/           # Campaign components
│   ├── contacts/            # Contact components
│   ├── inbox/               # Inbox/chat components
│   ├── settings/            # Settings components
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── auth.ts              # Authentication utilities
│   ├── db.ts                # Database connection
│   └── whatsapp.ts          # WhatsApp API service
├── scripts/                 # Database migration scripts
└── public/                  # Static assets
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |

### Messaging
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | List conversations |
| GET | `/api/conversations/[id]/messages` | Get messages |
| POST | `/api/messages/send` | Send a message |

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List contacts |
| POST | `/api/contacts` | Create contact |
| PUT | `/api/contacts/[id]` | Update contact |

### AI Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | List agents |
| POST | `/api/agents` | Create agent |
| PUT | `/api/agents/[id]` | Update agent |
| DELETE | `/api/agents/[id]` | Delete agent |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/webhooks/whatsapp` | Webhook verification |
| POST | `/api/webhooks/whatsapp` | Receive messages |

## Database Schema

Key tables:
- `tenants` - Organizations/accounts
- `users` - User accounts
- `contacts` - Customer contacts
- `conversations` - Chat threads
- `messages` - Individual messages
- `campaigns` - Broadcast campaigns
- `message_templates` - WhatsApp templates
- `ai_agents` - AI agent configurations
- `flows` - Automation workflows
- `whatsapp_accounts` - Connected WhatsApp numbers

## Scripts

Diagnostic and fix scripts in the root directory:
- `diagnose-agent-whatsapp-link.mjs` - Debug tenant/agent linkage
- `fix-whatsapp-tenant-link.mjs` - Fix tenant associations

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t whatsflow .
docker run -p 3000:3000 --env-file .env.local whatsflow
```

## Troubleshooting

### Webhook not receiving messages
1. Verify your app URL is publicly accessible (HTTPS required)
2. Check `WHATSAPP_VERIFY_TOKEN` matches Meta configuration
3. Ensure webhook fields are subscribed (messages)
4. Run `node scripts/debug-webhook.mjs` for diagnostics

### AI not responding
1. Verify `OPENAI_API_KEY` is valid
2. Check AI agent is set as default for tenant
3. Ensure auto-respond is enabled in agent settings
4. Verify business hours configuration

### Messages failing to send
1. Check WhatsApp access token is valid and not expired
2. Verify phone number ID is correct
3. Ensure recipient has opted-in (for template messages)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, please contact the development team or open an issue on GitHub.
