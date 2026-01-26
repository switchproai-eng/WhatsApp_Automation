import { getCurrentTenant } from "../../../../lib/auth"
import { redirect } from "next/navigation"
import { CampaignsList } from "@/components/campaigns/campaigns-list"
import { query } from "../../../../lib/db"

async function getCampaignsData(tenantId: string) {
  const campaigns = await query<{
    id: string
    name: string
    description: string | null
    status: string
    scheduled_at: string | null
    started_at: string | null
    completed_at: string | null
    total_recipients: number
    sent_count: number
    delivered_count: number
    read_count: number
    replied_count: number
    failed_count: number
    created_at: string
  }>(
    `SELECT
      c.id, c.name, c.description, c.status, c.scheduled_at, c.started_at, c.completed_at,
      c.total_recipients,
      COALESCE(sent_stats.sent_count, 0) as sent_count,
      COALESCE(delivery_stats.delivered_count, 0) as delivered_count,
      COALESCE(read_stats.read_count, 0) as read_count,
      COALESCE(reply_stats.replied_count, 0) as replied_count,
      COALESCE(failure_stats.failed_count, 0) as failed_count,
      c.created_at
     FROM campaigns c
     LEFT JOIN (
       SELECT campaign_id, COUNT(*) as sent_count
       FROM campaign_recipients
       WHERE status IN ('sent', 'delivered', 'read', 'failed')
       GROUP BY campaign_id
     ) sent_stats ON c.id = sent_stats.campaign_id
     LEFT JOIN (
       SELECT campaign_id, COUNT(*) as delivered_count
       FROM campaign_recipients
       WHERE status = 'delivered'
       GROUP BY campaign_id
     ) delivery_stats ON c.id = delivery_stats.campaign_id
     LEFT JOIN (
       SELECT campaign_id, COUNT(*) as read_count
       FROM campaign_recipients
       WHERE status = 'read'
       GROUP BY campaign_id
     ) read_stats ON c.id = read_stats.campaign_id
     LEFT JOIN (
       SELECT campaign_id, COUNT(*) as replied_count
       FROM campaign_recipients
       WHERE status = 'replied'
       GROUP BY campaign_id
     ) reply_stats ON c.id = reply_stats.campaign_id
     LEFT JOIN (
       SELECT campaign_id, COUNT(*) as failed_count
       FROM campaign_recipients
       WHERE status = 'failed'
       GROUP BY campaign_id
     ) failure_stats ON c.id = failure_stats.campaign_id
     WHERE c.tenant_id = $1
     ORDER BY c.created_at DESC`,
    [tenantId]
  )

  const templates = await query<{ id: string; name: string; status: string }>(
    `SELECT id, name, status FROM message_templates WHERE tenant_id = $1 AND status = 'approved'`,
    [tenantId]
  )

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "running").length,
    totalSent: campaigns.reduce((acc, c) => acc + c.sent_count, 0),
    avgDeliveryRate: campaigns.length > 0
      ? Math.round(
          (campaigns.reduce((acc, c) => {
            return acc + (c.sent_count > 0 ? c.delivered_count / c.sent_count : 0);
          }, 0) / campaigns.filter(c => c.sent_count > 0).length) * 100
        )
      : 0,
  }

  return { campaigns, templates, stats }
}

export default async function CampaignsPage() {
  const tenant = await getCurrentTenant()
  if (!tenant) redirect("/login")

  const { campaigns, templates, stats } = await getCampaignsData(tenant.id)

  return (
    <div className="space-y-6">
      <CampaignsList campaigns={campaigns} templates={templates} stats={stats} tenantId={tenant.id} />
    </div>
  )
}
