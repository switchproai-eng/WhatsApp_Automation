import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  MessageSquare, 
  Users, 
  GitBranch, 
  Megaphone,
  FileText,
  Settings,
  ArrowRight
} from "lucide-react"

const actions = [
  {
    title: "Start Conversation",
    description: "Send a new message to a contact",
    icon: MessageSquare,
    href: "/dashboard/inbox?new=true",
    color: "text-primary",
  },
  {
    title: "Add Contact",
    description: "Import or create new contacts",
    icon: Users,
    href: "/dashboard/contacts?new=true",
    color: "text-chart-2",
  },
  {
    title: "Create Flow",
    description: "Build an automation workflow",
    icon: GitBranch,
    href: "/dashboard/flows/new",
    color: "text-chart-3",
  },
  {
    title: "Launch Campaign",
    description: "Send broadcast messages",
    icon: Megaphone,
    href: "/dashboard/campaigns/new",
    color: "text-chart-4",
  },
  {
    title: "Create Template",
    description: "Design a message template",
    icon: FileText,
    href: "/dashboard/templates/new",
    color: "text-chart-5",
  },
  {
    title: "WhatsApp Setup",
    description: "Configure your WhatsApp API",
    icon: Settings,
    href: "/dashboard/settings/whatsapp",
    color: "text-muted-foreground",
  },
]

export function QuickActions() {
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group"
          >
            <div className={`p-2 rounded-lg bg-secondary ${action.color}`}>
              <action.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{action.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {action.description}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
