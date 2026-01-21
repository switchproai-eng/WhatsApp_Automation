"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { User, Tenant } from "@/lib/auth"
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Bot,
  Megaphone,
  FileText,
  Zap,
  BarChart3,
  Settings,
  HelpCircle,
  CreditCard,
  GitBranch, // Import GitBranch icon
} from "lucide-react"

interface DashboardSidebarProps {
  user: User
  tenant: Tenant
}

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: MessageSquare, label: "Inbox", href: "/dashboard/inbox" },
  { icon: Users, label: "Contacts", href: "/dashboard/contacts" },
  { icon: Bot, label: "AI Agent", href: "/dashboard/agent" },
  { icon: Megaphone, label: "Campaigns", href: "/dashboard/campaigns" },
  { icon: FileText, label: "Templates", href: "/dashboard/templates" },
  { icon: Zap, label: "Quick Replies", href: "/dashboard/quick-replies" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
]

const bottomNavItems = [
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  { icon: HelpCircle, label: "Help", href: "/dashboard/help" },
]

export function DashboardSidebar({ tenant }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">WhatsFlow</span>
        </Link>
      </div>

      {/* Tenant Selector */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-semibold text-sm">
            {tenant.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {tenant.name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{tenant.plan} plan</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
