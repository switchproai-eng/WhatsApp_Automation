"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentProfile } from "@/components/agent/agent-profile"
import { KnowledgeBase } from "@/components/agent/knowledge-base"
import { BehaviorSettings } from "@/components/agent/behavior-settings"
import { EscalationRules } from "@/components/agent/escalation-rules"
import { BookingSettings } from "@/components/agent/booking-settings"
import { CampaignRules } from "@/components/agent/campaign-rules"
import { ResponseTemplates } from "@/components/agent/response-templates"
import { AIPromptBuilder } from "@/components/agent/ai-prompt-builder"
import {
  Bot,
  BookOpen,
  Settings,
  AlertTriangle,
  Calendar,
  Megaphone,
  MessageSquare,
  Sparkles,
} from "lucide-react"

import { redirect } from 'next/navigation';

export default function AgentConfigPage() {
  redirect('/dashboard/agents');
}
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", label: "Agent Profile", icon: Bot },
    { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
    { id: "behavior", label: "Behavior", icon: Settings },
    { id: "escalation", label: "Escalation", icon: AlertTriangle },
    { id: "booking", label: "Booking", icon: Calendar },
    { id: "campaigns", label: "Campaigns", icon: Megaphone },
    { id: "templates", label: "Templates", icon: MessageSquare },
    { id: "prompt", label: "AI Prompt", icon: Sparkles },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Agent Configuration</h1>
        <p className="text-muted-foreground">
          Configure your AI agent's behavior, knowledge, and responses
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-gray-200 p-1 h-auto flex-wrap gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700"
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <AgentProfile />
        </TabsContent>

        <TabsContent value="knowledge" className="mt-6">
          <KnowledgeBase />
        </TabsContent>

        <TabsContent value="behavior" className="mt-6">
          <BehaviorSettings />
        </TabsContent>

        <TabsContent value="escalation" className="mt-6">
          <EscalationRules />
        </TabsContent>

        <TabsContent value="booking" className="mt-6">
          <BookingSettings />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <CampaignRules />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <ResponseTemplates />
        </TabsContent>

        <TabsContent value="prompt" className="mt-6">
          <AIPromptBuilder />
        </TabsContent>
      </Tabs>
    </div>
  )
}
