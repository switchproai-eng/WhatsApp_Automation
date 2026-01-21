import { getCurrentTenant } from "@/lib/auth"
import { redirect } from "next/navigation"
import { InboxLayout } from "@/components/inbox/inbox-layout"
import { query } from "@/lib/db"

async function getInboxData(tenantId: string) {
  const conversations = await query<{
    id: string
    contact_id: string
    contact_name: string | null
    contact_phone: string
    contact_avatar: string | null
    assigned_agent_id: string | null
    assigned_agent_name: string | null
    status: string
    last_message_at: string | null
    last_message: string | null
    last_message_type: string | null
    unread_count: string
  }>(
    `SELECT 
      c.id,
      c.contact_id,
      COALESCE(co.name, co.phone_number) as contact_name,
      co.phone_number as contact_phone,
      co.avatar_url as contact_avatar,
      c.assigned_agent_id,
      u.name as assigned_agent_name,
      c.status,
      c.last_message_at,
      m.content as last_message,
      m.message_type as last_message_type,
      (SELECT COUNT(*)::text FROM messages WHERE conversation_id = c.id AND status != 'read' AND sender_type = 'contact') as unread_count
     FROM conversations c
     JOIN contacts co ON c.contact_id = co.id
     LEFT JOIN users u ON c.assigned_agent_id = u.id
     LEFT JOIN LATERAL (
       SELECT content, message_type FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
     ) m ON true
     WHERE c.tenant_id = $1
     ORDER BY c.last_message_at DESC NULLS LAST`,
    [tenantId]
  )

  const agents = await query<{ id: string; name: string; avatar_url: string | null }>(
    `SELECT id, name, avatar_url FROM users WHERE tenant_id = $1 AND role IN ('admin', 'agent')`,
    [tenantId]
  )

  const quickReplies = await query<{ id: string; title: string; shortcut: string; content: string }>(
    `SELECT id, title, shortcut, content FROM quick_replies WHERE tenant_id = $1 ORDER BY title`,
    [tenantId]
  )

  return { conversations, agents, quickReplies }
}

export default async function InboxPage() {
  const tenant = await getCurrentTenant()
  if (!tenant) redirect("/login")

  const { conversations, agents, quickReplies } = await getInboxData(tenant.id)

  return (
    <InboxLayout 
      conversations={conversations} 
      agents={agents}
      quickReplies={quickReplies}
      tenantId={tenant.id}
    />
  )
}
