import { getCurrentTenant } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ContactsTable } from "@/components/contacts/contacts-table"
import { ContactsHeader } from "@/components/contacts/contacts-header"
import { query } from "@/lib/db"

async function getContactsData(tenantId: string) {
  const contacts = await query<{
    id: string
    whatsapp_id: string
    phone_number: string
    name: string | null
    email: string | null
    avatar_url: string | null
    tags: string[]
    opted_in: boolean
    last_message_at: string | null
    created_at: string
    conversation_count: string
    total_messages: string
  }>(
    `SELECT 
      c.id,
      c.whatsapp_id,
      c.phone_number,
      c.name,
      c.email,
      c.avatar_url,
      c.tags,
      c.opted_in,
      c.last_message_at,
      c.created_at,
      (SELECT COUNT(*)::text FROM conversations WHERE contact_id = c.id) as conversation_count,
      (SELECT COUNT(*)::text FROM messages m JOIN conversations cv ON m.conversation_id = cv.id WHERE cv.contact_id = c.id) as total_messages
     FROM contacts c
     WHERE c.tenant_id = $1
     ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC`,
    [tenantId]
  )

  const tags = await query<{ id: string; name: string; color: string }>(
    `SELECT id, name, color FROM tags WHERE tenant_id = $1 ORDER BY name`,
    [tenantId]
  )

  const stats = {
    total: contacts.length,
    optedIn: contacts.filter((c) => c.opted_in).length,
    newThisWeek: contacts.filter((c) => {
      const created = new Date(c.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return created > weekAgo
    }).length,
  }

  return { contacts, tags, stats }
}

export default async function ContactsPage() {
  const tenant = await getCurrentTenant()
  if (!tenant) redirect("/login")

  const { contacts, tags, stats } = await getContactsData(tenant.id)

  return (
    <div className="space-y-6">
      <ContactsHeader stats={stats} tenantId={tenant.id} />
      <ContactsTable contacts={contacts} tags={tags} tenantId={tenant.id} />
    </div>
  )
}
