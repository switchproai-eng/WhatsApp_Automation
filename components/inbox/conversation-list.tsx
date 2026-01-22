"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Search, Filter, MessageSquarePlus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Conversation {
  id: string
  contact_name: string | null
  contact_phone: string
  contact_avatar: string | null
  status: string
  last_message_at: string | null
  last_message: string | null
  last_message_type: string | null
  unread_count: string
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  filter: "all" | "open" | "pending" | "resolved"
  onFilterChange: (filter: "all" | "open" | "pending" | "resolved") => void
}

const statusColors: Record<string, string> = {
  open: "bg-primary",
  pending: "bg-yellow-500",
  resolved: "bg-muted-foreground",
  spam: "bg-destructive",
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
}: ConversationListProps) {
  const [search, setSearch] = useState("")

  const filteredConversations = conversations.filter((c) => {
    if (!search) return true
    const name = c.contact_name?.toLowerCase() || ""
    const phone = c.contact_phone.toLowerCase()
    const searchLower = search.toLowerCase()
    return name.includes(searchLower) || phone.includes(searchLower)
  })

  const filterLabels = {
    all: "All",
    open: "Open",
    pending: "Pending",
    resolved: "Resolved",
  }

  return (
    <div className="w-80 border-r border-border flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Inbox</h2>
          <Button size="sm" className="gap-1.5">
            <MessageSquarePlus className="w-4 h-4" />
            New
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 bg-secondary"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
                <Filter className="w-4 h-4" />
                {filterLabels[filter]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(filterLabels).map(([key, label]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onFilterChange(key as typeof filter)}
                  className={cn(filter === key && "bg-secondary")}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "w-full p-3 flex items-start gap-3 hover:bg-secondary transition-colors border-b border-border text-left",
                selectedId === conversation.id && "bg-secondary"
              )}
            >
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={conversation.contact_avatar || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {conversation.contact_name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                    statusColors[conversation.status]
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-foreground truncate">
                    {conversation.contact_name || conversation.contact_phone}
                  </span>
                  {conversation.last_message_at && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(conversation.last_message_at), {
                        addSuffix: false,
                      })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.last_message_type === "image"
                      ? "Sent an image"
                      : conversation.last_message_type === "audio"
                        ? "Sent a voice message"
                        : conversation.last_message || "No messages yet"}
                  </p>
                  {parseInt(conversation.unread_count) > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0 h-5 min-w-5 flex items-center justify-center">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
