"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Info,
  ImageIcon,
  Mic,
  Zap,
  Bot,
  CheckCheck,
  Check,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import useSWR from "swr"

interface Message {
  id: string
  sender_type: "contact" | "agent" | "bot" | "system"
  sender_id: string | null
  message_type: string
  content: string | null
  media_url: string | null
  status: string
  created_at: string
}

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

interface QuickReply {
  id: string
  title: string
  shortcut: string
  content: string
}

interface ChatPanelProps {
  conversation: Conversation
  quickReplies: QuickReply[]
  onToggleDetails: () => void
  showDetails: boolean
  tenantId: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ChatPanel({
  conversation,
  quickReplies,
  onToggleDetails,
  showDetails,
  tenantId,
}: ChatPanelProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Suppress unused variable warning
  void tenantId

  const { data: messages = [], mutate } = useSWR<Message[]>(
    `/api/conversations/${conversation.id}/messages`,
    fetcher,
    { refreshInterval: 3000 }
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!message.trim() || isSending) return

    setIsSending(true)
    try {
      await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message, messageType: "text" }),
      })
      setMessage("")
      mutate()
    } finally {
      setIsSending(false)
    }
  }

  function handleQuickReplySelect(reply: QuickReply) {
    setMessage(reply.content)
    setShowQuickReplies(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    
    // Check for quick reply shortcuts
    if (message.startsWith("/")) {
      const shortcut = message.slice(1).toLowerCase()
      const reply = quickReplies.find((r) => r.shortcut.toLowerCase() === shortcut)
      if (reply && e.key === "Tab") {
        e.preventDefault()
        setMessage(reply.content)
      }
    }
  }

  const statusIcon = {
    pending: <Clock className="w-3 h-3" />,
    sent: <Check className="w-3 h-3" />,
    delivered: <CheckCheck className="w-3 h-3" />,
    read: <CheckCheck className="w-3 h-3 text-primary" />,
    failed: <span className="text-destructive text-xs">Failed</span>,
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="h-16 px-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={conversation.contact_avatar || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {conversation.contact_name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-foreground">
              {conversation.contact_name || conversation.contact_phone}
            </h3>
            <p className="text-xs text-muted-foreground">{conversation.contact_phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Badge
            variant="outline"
            className={cn(
              "capitalize",
              conversation.status === "open" && "border-primary text-primary",
              conversation.status === "pending" && "border-yellow-500 text-yellow-500",
              conversation.status === "resolved" && "border-muted-foreground text-muted-foreground"
            )}
          >
            {conversation.status}
          </Badge>
          <Button variant="ghost" size="icon">
            <Phone className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDetails}
            className={cn(showDetails && "bg-secondary")}
          >
            <Info className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as resolved</DropdownMenuItem>
              <DropdownMenuItem>Assign to agent</DropdownMenuItem>
              <DropdownMenuItem>Add tags</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Mark as spam</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOutgoing = msg.sender_type === "agent" || msg.sender_type === "bot"

          return (
            <div
              key={msg.id}
              className={cn("flex", isOutgoing ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2.5",
                  isOutgoing
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                )}
              >
                {msg.sender_type === "bot" && (
                  <div className="flex items-center gap-1 mb-1">
                    <Bot className="w-3 h-3" />
                    <span className="text-xs opacity-70">AI Assistant</span>
                  </div>
                )}
                {msg.message_type === "image" && msg.media_url && (
                  <img
                    src={msg.media_url || "/placeholder.svg"}
                    alt="Shared image"
                    className="rounded-lg max-w-full mb-2"
                  />
                )}
                {msg.content && (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
                <div
                  className={cn(
                    "flex items-center gap-1.5 mt-1",
                    isOutgoing ? "justify-end" : "justify-start"
                  )}
                >
                  <span className={cn("text-xs", isOutgoing ? "opacity-70" : "text-muted-foreground")}>
                    {format(new Date(msg.created_at), "HH:mm")}
                  </span>
                  {isOutgoing && statusIcon[msg.status as keyof typeof statusIcon]}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies Popup */}
      {showQuickReplies && quickReplies.length > 0 && (
        <div className="border-t border-border bg-card p-2 max-h-40 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {quickReplies.map((reply) => (
              <button
                key={reply.id}
                onClick={() => handleQuickReplySelect(reply)}
                className="text-left p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <p className="text-sm font-medium text-foreground">{reply.title}</p>
                <p className="text-xs text-muted-foreground truncate">{reply.content}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end gap-2">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("text-muted-foreground", showQuickReplies && "bg-secondary text-primary")}
              onClick={() => setShowQuickReplies(!showQuickReplies)}
            >
              <Zap className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10 bg-secondary border-border"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Mic className="w-5 h-5" />
            </Button>
            <Button size="icon" onClick={handleSend} disabled={!message.trim() || isSending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
