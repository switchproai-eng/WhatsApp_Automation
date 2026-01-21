"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Megaphone,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Trash2,
  Eye,
  Send,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface Campaign {
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
}

interface Template {
  id: string
  name: string
  status: string
}

interface CampaignsListProps {
  campaigns: Campaign[]
  templates: Template[]
  stats: {
    total: number
    active: number
    totalSent: number
    avgDeliveryRate: number
  }
  tenantId: string
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-chart-2/20 text-chart-2",
  running: "bg-primary/20 text-primary",
  paused: "bg-warning/20 text-warning",
  completed: "bg-chart-1/20 text-chart-1",
  cancelled: "bg-destructive/20 text-destructive",
}

export function CampaignsList({ campaigns, templates, stats, tenantId }: CampaignsListProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Suppress unused variable warning
  void tenantId

  async function handleCreateCampaign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          templateId: formData.get("templateId"),
          scheduledAt: formData.get("scheduledAt") || null,
        }),
      })

      if (response.ok) {
        const campaign = await response.json()
        setIsCreating(false)
        router.push(`/dashboard/campaigns/${campaign.id}`)
        router.refresh()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const statCards = [
    {
      title: "Total Campaigns",
      value: stats.total,
      icon: Megaphone,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Campaigns",
      value: stats.active,
      icon: Play,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Messages Sent",
      value: stats.totalSent.toLocaleString(),
      icon: Send,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Avg. Delivery Rate",
      value: `${stats.avgDeliveryRate}%`,
      icon: TrendingUp,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage broadcast campaigns to your audience
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogDescription>
                Set up a new broadcast campaign to send messages to your audience.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input id="name" name="name" placeholder="Black Friday Sale" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Campaign description..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateId">Message Template</Label>
                <Select name="templateId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No approved templates
                      </SelectItem>
                    ) : (
                      templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
                <Input
                  id="scheduledAt"
                  name="scheduledAt"
                  type="datetime-local"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaigns Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Megaphone className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Create your first campaign to start reaching your audience with broadcast messages.
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const deliveryRate =
                    campaign.sent_count > 0
                      ? Math.round((campaign.delivered_count / campaign.sent_count) * 100)
                      : 0
                  const readRate =
                    campaign.delivered_count > 0
                      ? Math.round((campaign.read_count / campaign.delivered_count) * 100)
                      : 0

                  return (
                    <TableRow key={campaign.id} className="border-border">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{campaign.name}</p>
                          {campaign.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {campaign.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("capitalize", statusColors[campaign.status])}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{campaign.total_recipients.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {campaign.sent_count} / {campaign.total_recipients}
                            </span>
                            <span className="font-medium">{deliveryRate}%</span>
                          </div>
                          <Progress value={deliveryRate} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-chart-1" />
                            <span>{readRate}% read</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Send className="w-3.5 h-3.5 text-chart-2" />
                            <span>{campaign.replied_count} replies</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {campaign.status === "draft" && (
                              <DropdownMenuItem>
                                <Play className="w-4 h-4 mr-2" />
                                Start Campaign
                              </DropdownMenuItem>
                            )}
                            {campaign.status === "running" && (
                              <DropdownMenuItem>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause Campaign
                              </DropdownMenuItem>
                            )}
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
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
