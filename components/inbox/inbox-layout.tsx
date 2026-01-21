"use client"

import { useState } from "react"
import { ConversationList } from "./conversation-list"
import { ChatPanel } from "./chat-panel"
import { ConversationDetails } from "./conversation-details"

interface Conversation {
  id: string
  contact_id: string
  contact_name: string | null
  contact_phone: string
  contact_avatar: string | null
  assigned_agent_id: string | null
  assigned_agent_name: string | null
  status: string
  last_message_at: string | null
  last_message: string | null
  last_message_type: string | null
  unread_count: string
}

interface Agent {
  id: string
  name: string
  avatar_url: string | null
}

interface QuickReply {
  id: string
  title: string
  shortcut: string
  content: string
}

interface InboxLayoutProps {
  conversations: Conversation[]
  agents: Agent[]
  quickReplies: QuickReply[]
  tenantId: string
}

export function InboxLayout({ conversations, agents, quickReplies, tenantId }: InboxLayoutProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversations[0]?.id || null
  )
  const [showDetails, setShowDetails] = useState(false)
  const [filter, setFilter] = useState<"all" | "open" | "pending" | "resolved">("all")

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  const filteredConversations = conversations.filter((c) => {
    if (filter === "all") return true
    return c.status === filter
  })

  return (
    <div className="flex h-[calc(100vh-7rem)] -m-6 bg-background">
      {/* Conversation List */}
      <ConversationList
        conversations={filteredConversations}
        selectedId={selectedConversationId}
        onSelect={setSelectedConversationId}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Chat Panel */}
      {selectedConversation ? (
        <ChatPanel
          conversation={selectedConversation}
          quickReplies={quickReplies}
          onToggleDetails={() => setShowDetails(!showDetails)}
          showDetails={showDetails}
          tenantId={tenantId}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-card">
          <div className="text-center">
            <p className="text-muted-foreground">Select a conversation to start chatting</p>
          </div>
        </div>
      )}

      {/* Conversation Details */}
      {showDetails && selectedConversation && (
        <ConversationDetails
          conversation={selectedConversation}
          agents={agents}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  )
}
