import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  contact_name: string
  contact_phone: string
  last_message: string | null
  last_message_at: string | null
  status: string
  unread_count: string
}

interface RecentConversationsProps {
  conversations: Conversation[]
}

const statusColors: Record<string, string> = {
  open: "bg-primary/20 text-primary border-primary/30",
  pending: "bg-warning/20 text-warning border-warning/30",
  resolved: "bg-muted text-muted-foreground border-border",
  spam: "bg-destructive/20 text-destructive border-destructive/30",
}

export function RecentConversations({ conversations }: RecentConversationsProps) {
  if (conversations.length === 0) {
    return (
      <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-base text-gray-900">Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              No conversations yet. Start by connecting your WhatsApp Business account.
            </p>
            <Button asChild>
              <Link href="/dashboard/settings/whatsapp">Setup WhatsApp</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base text-gray-900">Recent Conversations</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/inbox" className="text-blue-600">
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/dashboard/inbox/${conversation.id}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {conversation.contact_name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {conversation.contact_name}
                  </p>
                  {parseInt(conversation.unread_count) > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {conversation.last_message || "No messages yet"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs capitalize ${statusColors[conversation.status]}`}
                >
                  {conversation.status}
                </Badge>
                {conversation.last_message_at && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
