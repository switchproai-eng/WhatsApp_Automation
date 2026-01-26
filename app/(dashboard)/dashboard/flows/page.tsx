import { getCurrentTenant } from "../../../../lib/auth"
import { redirect } from "next/navigation"
import { FlowsList } from "@/components/flows/flows-list"
import { query } from "../../../../lib/db"

async function getFlowsData(tenantId: string) {
  const flows = await query<{
    id: string
    name: string
    description: string | null
    trigger_type: string
    is_active: boolean
    created_at: string
    updated_at: string
    executions_count: string
  }>(
    `SELECT 
      f.id,
      f.name,
      f.description,
      f.trigger_type,
      f.is_active,
      f.created_at,
      f.updated_at,
      (SELECT COUNT(*)::text FROM flow_executions WHERE flow_id = f.id) as executions_count
     FROM flows f
     WHERE f.tenant_id = $1
     ORDER BY f.updated_at DESC`,
    [tenantId]
  )

  return { flows }
}

export default async function FlowsPage() {
  const tenant = await getCurrentTenant()
  if (!tenant) redirect("/login")

  const { flows } = await getFlowsData(tenant.id)

  return (
    <div className="space-y-6">
      <FlowsList flows={flows} tenantId={tenant.id} />
    </div>
  )
}
