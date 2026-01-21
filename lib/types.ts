export interface Contact {
  id: string
  tenant_id: string
  whatsapp_id: string
  phone_number: string
  name: string | null
  email: string | null
  avatar_url: string | null
  tags: string[]
  custom_fields: Record<string, unknown>
  opted_in: boolean
  opted_in_at: string | null
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  tenant_id: string
  contact_id: string
  assigned_agent_id: string | null
  status: "open" | "pending" | "resolved" | "spam"
  channel: string
  last_message_at: string | null
  created_at: string
  updated_at: string
  contact?: Contact
  assigned_agent?: {
    id: string
    name: string
    avatar_url: string | null
  }
  unread_count?: number
  last_message?: Message
}

export interface Message {
  id: string
  conversation_id: string
  sender_type: "contact" | "agent" | "bot" | "system"
  sender_id: string | null
  message_type: "text" | "image" | "video" | "audio" | "document" | "location" | "template" | "interactive"
  content: string | null
  media_url: string | null
  media_mime_type: string | null
  whatsapp_message_id: string | null
  status: "pending" | "sent" | "delivered" | "read" | "failed"
  metadata: Record<string, unknown>
  created_at: string
}

export interface Flow {
  id: string
  tenant_id: string
  name: string
  description: string | null
  trigger_type: "keyword" | "webhook" | "schedule" | "contact_event" | "manual"
  trigger_config: Record<string, unknown>
  nodes: FlowNode[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FlowNode {
  id: string
  type: "trigger" | "message" | "condition" | "delay" | "action" | "ai_response"
  position: { x: number; y: number }
  data: Record<string, unknown>
  connections: string[]
}

export interface Campaign {
  id: string
  tenant_id: string
  name: string
  description: string | null
  template_id: string | null
  status: "draft" | "scheduled" | "running" | "paused" | "completed" | "cancelled"
  scheduled_at: string | null
  started_at: string | null
  completed_at: string | null
  target_audience: Record<string, unknown>
  total_recipients: number
  sent_count: number
  delivered_count: number
  read_count: number
  replied_count: number
  failed_count: number
  created_at: string
  updated_at: string
}

export interface MessageTemplate {
  id: string
  tenant_id: string
  name: string
  category: "marketing" | "utility" | "authentication"
  language: string
  status: "pending" | "approved" | "rejected"
  components: TemplateComponent[]
  whatsapp_template_id: string | null
  created_at: string
  updated_at: string
}

export interface TemplateComponent {
  type: "header" | "body" | "footer" | "buttons"
  format?: "text" | "image" | "video" | "document"
  text?: string
  buttons?: TemplateButton[]
}

export interface TemplateButton {
  type: "quick_reply" | "url" | "phone_number"
  text: string
  url?: string
  phone_number?: string
}

export interface QuickReply {
  id: string
  tenant_id: string
  title: string
  shortcut: string
  content: string
  category: string | null
  created_at: string
}

export interface Tag {
  id: string
  tenant_id: string
  name: string
  color: string
  created_at: string
}

export interface Analytics {
  total_contacts: number
  total_conversations: number
  total_messages_sent: number
  total_messages_received: number
  active_conversations: number
  avg_response_time: number
  resolution_rate: number
}

export interface DashboardStats {
  conversations: {
    total: number
    open: number
    pending: number
    resolved: number
    trend: number
  }
  messages: {
    sent: number
    delivered: number
    read: number
    failed: number
    trend: number
  }
  contacts: {
    total: number
    new_this_week: number
    opted_in: number
    trend: number
  }
  campaigns: {
    active: number
    completed: number
    total_sent: number
    avg_open_rate: number
  }
}
