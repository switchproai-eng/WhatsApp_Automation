import { getCurrentTenant } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TemplatesList } from "@/components/templates/templates-list"
import { query } from "@/lib/db"

async function getTemplatesData(tenantId: string) {
  const templates = await query<{
    id: string
    name: string
    category: string
    language: string
    status: string
    components: unknown
    created_at: string
    updated_at: string
  }>(
    `SELECT id, name, category, language, status, components, created_at, updated_at
     FROM message_templates
     WHERE tenant_id = $1
     ORDER BY updated_at DESC`,
    [tenantId]
  )

  return { templates }
}

export default async function TemplatesPage() {
  const tenant = await getCurrentTenant()
  if (!tenant) redirect("/login")

  const { templates } = await getTemplatesData(tenant.id)

  return (
    <div className="space-y-6">
      <TemplatesList templates={templates} tenantId={tenant.id} />
    </div>
  )
}
