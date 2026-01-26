import { getCurrentUser, getCurrentTenant } from "../../../lib/auth"
import { redirect } from "next/navigation"
import { DashboardStats } from "@/components/dashboard/stats"
import { RecentConversations } from "@/components/dashboard/recent-conversations"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { query } from "../../../lib/db"

async function getDashboardData(tenantId: string) {
  const [
    conversationStats,
    contactStats,
    messageStats,
    recentConversations,
  ] = await Promise.all([
    query<{ status: string; count: string }>(
      `SELECT status, COUNT(*)::text as count FROM conversations WHERE tenant_id = $1 GROUP BY status`,
      [tenantId]
    ),
    query<{ total: string; new_this_week: string }>(
      `SELECT 
        COUNT(*)::text as total,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END)::text as new_this_week
       FROM contacts WHERE tenant_id = $1`,
      [tenantId]
    ),
    query<{ sent: string; delivered: string; read: string }>(
      `SELECT
        COUNT(CASE WHEN sender_type IN ('agent', 'bot') THEN 1 END)::text as sent,
        COUNT(CASE WHEN m.status = 'delivered' THEN 1 END)::text as delivered,
        COUNT(CASE WHEN m.status = 'read' THEN 1 END)::text as read
       FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE c.tenant_id = $1 AND m.created_at > NOW() - INTERVAL '30 days'`,
      [tenantId]
    ),
    query<{
      id: string
      contact_name: string
      contact_phone: string
      last_message: string
      last_message_at: string
      status: string
      unread_count: string
    }>(
      `SELECT
        c.id,
        COALESCE(co.name, co.phone_number) as contact_name,
        co.phone_number as contact_phone,
        m.content as last_message,
        c.last_message_at,
        c.status,
        (SELECT COUNT(*)::text FROM messages msg WHERE msg.conversation_id = c.id AND msg.status != 'read' AND msg.sender_type = 'contact') as unread_count
       FROM conversations c
       JOIN contacts co ON c.contact_id = co.id
       LEFT JOIN LATERAL (
         SELECT content FROM messages msg WHERE msg.conversation_id = c.id ORDER BY msg.created_at DESC LIMIT 1
       ) m ON true
       WHERE c.tenant_id = $1
       ORDER BY c.last_message_at DESC NULLS LAST
       LIMIT 5`,
      [tenantId]
    ),
  ])

  const conversationMap = conversationStats.reduce(
    (acc, { status, count }) => ({ ...acc, [status]: parseInt(count) }),
    { open: 0, pending: 0, resolved: 0, spam: 0 }
  )

  return {
    stats: {
      conversations: {
        total: Object.values(conversationMap).reduce((a, b) => a + b, 0),
        open: conversationMap.open,
        pending: conversationMap.pending,
        resolved: conversationMap.resolved,
      },
      contacts: {
        total: parseInt(contactStats[0]?.total || "0"),
        newThisWeek: parseInt(contactStats[0]?.new_this_week || "0"),
      },
      messages: {
        sent: parseInt(messageStats[0]?.sent || "0"),
        delivered: parseInt(messageStats[0]?.delivered || "0"),
        read: parseInt(messageStats[0]?.read || "0"),
      },
    },
    recentConversations,
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const tenant = await getCurrentTenant()
  if (!tenant) redirect("/login")

  const { stats, recentConversations } = await getDashboardData(tenant.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your WhatsApp business today.
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsChart tenantId={tenant.id} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      <RecentConversations conversations={recentConversations} />
    </div>
  )
}
