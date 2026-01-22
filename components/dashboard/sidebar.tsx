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
    <aside className="w-64 bg-gradient-to-br from-slate-900/80 to-purple-900/80 backdrop-blur border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-white">WhatsFlow</span>
        </Link>
      </div>

      {/* Tenant Selector */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-white font-semibold text-sm">
            {tenant.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/90 truncate">
              {tenant.name}
            </p>
            <p className="text-xs text-white/60 capitalize">{tenant.plan} plan</p>
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-white shadow-lg"
                  : "text-white/80 hover:text-white hover:bg-white/10 hover:translate-x-1"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-white shadow-lg"
                  : "text-white/80 hover:text-white hover:bg-white/10 hover:translate-x-1"
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
