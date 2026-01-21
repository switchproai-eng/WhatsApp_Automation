"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { X, Mail, Phone, MapPin, Tag, Calendar, Clock, User, MessageSquare } from "lucide-react"
import { format } from "date-fns"

interface Conversation {
  id: string
  contact_id: string
  contact_name: string | null
  contact_phone: string
  contact_avatar: string | null
  assigned_agent_id: string | null
  assigned_agent_name: string | null
  status: string
}

interface Agent {
  id: string
  name: string
  avatar_url: string | null
}

interface ConversationDetailsProps {
  conversation: Conversation
  agents: Agent[]
  onClose: () => void
}

export function ConversationDetails({ conversation, agents, onClose }: ConversationDetailsProps) {
  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Contact Details</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Contact Info */}
      <div className="p-4 flex flex-col items-center text-center border-b border-border">
        <Avatar className="w-20 h-20 mb-3">
          <AvatarImage src={conversation.contact_avatar || undefined} />
          <AvatarFallback className="bg-primary/20 text-primary text-2xl">
            {conversation.contact_name?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <h4 className="font-semibold text-foreground text-lg">
          {conversation.contact_name || "Unknown Contact"}
        </h4>
        <p className="text-sm text-muted-foreground">{conversation.contact_phone}</p>
        
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4 mr-1.5" />
            Call
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-1.5" />
            Email
          </Button>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Status
          </label>
          <Select defaultValue={conversation.status}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="spam">Spam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assigned Agent */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Assigned To
          </label>
          <Select defaultValue={conversation.assigned_agent_id || "unassigned"}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Contact Details */}
        <div className="space-y-3">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Contact Information
          </h5>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Phone className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm text-foreground">{conversation.contact_phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Mail className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm text-foreground">Not provided</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm text-foreground">Not available</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tags */}
        <div>
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Tags
          </h5>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">Customer</Badge>
            <Badge variant="secondary" className="text-xs">VIP</Badge>
            <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
              <Tag className="w-3 h-3 mr-1" />
              Add tag
            </Button>
          </div>
        </div>

        <Separator />

        {/* Activity */}
        <div>
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Activity
          </h5>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">First Contact</p>
                <p className="text-sm text-foreground">{format(new Date(), "MMM d, yyyy")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Messages</p>
                <p className="text-sm text-foreground">0 messages</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Response Time</p>
                <p className="text-sm text-foreground">--</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Handled By</p>
                <p className="text-sm text-foreground">
                  {conversation.assigned_agent_name || "Unassigned"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
