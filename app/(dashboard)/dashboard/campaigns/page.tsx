import { getCurrentTenant } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CampaignsList } from "@/components/campaigns/campaigns-list"
import { query } from "@/lib/db"

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
      id, name, description, status, scheduled_at, started_at, completed_at,
      total_recipients, sent_count, delivered_count, read_count, replied_count, failed_count,
      created_at
     FROM campaigns
     WHERE tenant_id = $1
     ORDER BY created_at DESC`,
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
    avgDeliveryRate:
      campaigns.length > 0
        ? Math.round(
            (campaigns.reduce((acc, c) => acc + (c.sent_count > 0 ? c.delivered_count / c.sent_count : 0), 0) /
              campaigns.length) *
              100
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
