import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Users, Send, TrendingUp } from "lucide-react"

interface StatsProps {
  stats: {
    conversations: {
      total: number
      open: number
      pending: number
      resolved: number
    }
    contacts: {
      total: number
      newThisWeek: number
    }
    messages: {
      sent: number
      delivered: number
      read: number
    }
  }
}

export function DashboardStats({ stats }: StatsProps) {
  const statCards = [
    {
      title: "Active Conversations",
      value: stats.conversations.open + stats.conversations.pending,
      subtitle: `${stats.conversations.open} open, ${stats.conversations.pending} pending`,
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Contacts",
      value: stats.contacts.total,
      subtitle: `+${stats.contacts.newThisWeek} this week`,
      icon: Users,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Messages Sent",
      value: stats.messages.sent,
      subtitle: `${stats.messages.delivered} delivered`,
      icon: Send,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Read Rate",
      value: stats.messages.sent > 0 
        ? `${Math.round((stats.messages.read / stats.messages.sent) * 100)}%`
        : "0%",
      subtitle: `${stats.messages.read} messages read`,
      icon: TrendingUp,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {typeof stat.value === "number" 
                    ? stat.value.toLocaleString() 
                    : stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
