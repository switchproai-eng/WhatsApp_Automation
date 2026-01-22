import { getCurrentTenant } from "@/lib/auth"
import { redirect } from "next/navigation"
import { FlowBuilder } from "@/components/flows/flow-builder"

export default async function NewFlowPage() {
  const tenant = await getCurrentTenant()
  if (!tenant) redirect("/login")

  return <FlowBuilder tenantId={tenant.id} />
}
