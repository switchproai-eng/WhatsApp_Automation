import { getCurrentTenant } from "../../../../lib/auth"
import { redirect } from "next/navigation"
import { TemplatesList } from "@/components/templates/templates-list"
import { query } from "../../../../lib/db"

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

  // Fetch business templates
  const businessTemplates = await query<{
    id: string
    name: string
    business_name: string
    business_logo_url: string | null
    description: string
    website_url: string | null
    facebook_url: string | null
    instagram_url: string | null
    twitter_url: string | null
    linkedin_url: string | null
    email: string | null
    phone: string | null
    address: string | null
    welcome_message: string | null
    greeting_message: string | null
    created_at: string
    updated_at: string
  }>(
    `SELECT id, name, business_name, business_logo_url, description,
            website_url, facebook_url, instagram_url, twitter_url, linkedin_url,
            email, phone, address, welcome_message, greeting_message, created_at, updated_at
     FROM business_templates
     WHERE tenant_id = $1
     ORDER BY updated_at DESC`,
    [tenantId]
  )

  return { templates, businessTemplates }
}

export default async function TemplatesPage() {
  const tenant = await getCurrentTenant()
  if (!tenant) redirect("/login")

  const { templates, businessTemplates } = await getTemplatesData(tenant.id)

  return (
    <div className="space-y-6">
      <TemplatesList 
        templates={templates} 
        businessTemplates={businessTemplates} 
        tenantId={tenant.id} 
      />
    </div>
  )
}
