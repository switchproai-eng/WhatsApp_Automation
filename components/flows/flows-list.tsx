"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  GitBranch,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Trash2,
  Edit,
  Zap,
  Clock,
  Webhook,
  MessageSquare,
  Calendar,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Flow {
  id: string
  name: string
  description: string | null
  trigger_type: string
  is_active: boolean
  created_at: string
  updated_at: string
  executions_count: string
}

interface FlowsListProps {
  flows: Flow[]
  tenantId: string
}

const triggerIcons: Record<string, typeof Zap> = {
  keyword: MessageSquare,
  webhook: Webhook,
  schedule: Calendar,
  contact_event: Zap,
  manual: Play,
}

const triggerLabels: Record<string, string> = {
  keyword: "Keyword Trigger",
  webhook: "Webhook Trigger",
  schedule: "Scheduled",
  contact_event: "Contact Event",
  manual: "Manual Trigger",
}

export function FlowsList({ flows, tenantId }: FlowsListProps) {
  const router = useRouter()

  // Suppress unused variable warning
  void tenantId

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Flows</h1>
          <p className="text-muted-foreground">
            Build automated workflows to engage your customers
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/flows/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Flow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <GitBranch className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{flows.length}</p>
              <p className="text-sm text-muted-foreground">Total Flows</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-chart-1/10">
              <Play className="w-5 h-5 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {flows.filter((f) => f.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Flows</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-chart-2/10">
              <Zap className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {flows.reduce((acc, f) => acc + parseInt(f.executions_count), 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Executions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flows Grid */}
      {flows.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <GitBranch className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No flows yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Create your first automation flow to start engaging with customers automatically.
            </p>
            <Button onClick={() => router.push("/dashboard/flows/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Flow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flows.map((flow) => {
            const TriggerIcon = triggerIcons[flow.trigger_type] || Zap

            return (
              <Card
                key={flow.id}
                className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/flows/${flow.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TriggerIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{flow.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {triggerLabels[flow.trigger_type]}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Flow
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {flow.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {flow.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Zap className="w-3.5 h-3.5" />
                        {parseInt(flow.executions_count).toLocaleString()} runs
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDistanceToNow(new Date(flow.updated_at), { addSuffix: true })}
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Badge
                        variant={flow.is_active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {flow.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Switch checked={flow.is_active} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
