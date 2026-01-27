"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Bot, BookOpen, Settings, Calendar, Megaphone, MessageSquare, FileText } from "lucide-react";
import { AgentProfile } from "@/components/agent/agent-profile";
import { AIPromptBuilder } from "@/components/agent/ai-prompt-builder";
import { BehaviorSettings } from "@/components/agent/behavior-settings";
import { BookingSettings } from "@/components/agent/booking-settings";
import { EscalationRules } from "@/components/agent/escalation-rules";
import { CampaignRules } from "@/components/agent/campaign-rules";
import { KnowledgeBase } from "@/components/agent/knowledge-base";
import { ResponseTemplates } from "@/components/agent/response-templates";
import { ResponseSettings } from "@/components/agent/response-settings";

interface AgentConfig {
  id: string;
  name: string;
  config: any;
  is_default: boolean;
}

export default function NewAgentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [agent, setAgent] = useState<AgentConfig>({
    id: 'new',
    name: 'New Agent',
    config: {},
    is_default: false
  });
  const [saving, setSaving] = useState(false);

  const createNewAgent = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: agent.name, 
          config: agent.config,
          is_default: agent.is_default
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        toast({ title: "Success", description: "Agent created successfully" });
        // Redirect to the newly created agent's page
        router.push(`/dashboard/agents/${data.agent.id}`);
        router.refresh(); // Refresh to update the UI
      } else {
        const errorText = await res.text();
        console.error("Failed to create agent:", errorText);
        toast({ title: "Error", description: "Failed to create agent" });
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      toast({ title: "Error", description: "Failed to create agent" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
            <Badge variant={agent.is_default ? "default" : "secondary"}>{agent.is_default ? "Default" : ""}</Badge>
          </div>
          <p className="text-muted-foreground">Configure your AI agent settings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNewAgent} disabled={saving}>
            {saving ? 'Creating...' : 'Create Agent'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/agents')}>
            Cancel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <TabsTrigger value="profile">
            <Bot className="mr-2 h-4 w-4" />
            Agent Profile
          </TabsTrigger>
          <TabsTrigger value="prompt">
            <MessageSquare className="mr-2 h-4 w-4" />
            AI Prompt
          </TabsTrigger>
          <TabsTrigger value="responses">
            <MessageSquare className="mr-2 h-4 w-4" />
            Response Settings
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            <BookOpen className="mr-2 h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <Settings className="mr-2 h-4 w-4" />
            Behavior
          </TabsTrigger>
          <TabsTrigger value="booking">
            <Calendar className="mr-2 h-4 w-4" />
            Booking
          </TabsTrigger>
          <TabsTrigger value="escalation">
            <Megaphone className="mr-2 h-4 w-4" />
            Escalation
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <AgentProfile
            agentId={agent.id}
            initialConfig={agent.config.profile || {}}
            onUpdate={(updatedConfig) => {
              // If the profile name has changed, update the agent's main name as well
              const newAgentName = updatedConfig.name || agent.name;
              setAgent({
                ...agent,
                name: newAgentName,
                config: {...agent.config, profile: updatedConfig}
              });
            }}
          />
        </TabsContent>
        <TabsContent value="prompt" className="mt-6">
          <AIPromptBuilder
            agentId={agent.id}
            initialConfig={agent.config.prompt || {}}
            onUpdate={(updatedConfig) => setAgent({...agent, config: {...agent.config, prompt: updatedConfig}})}
          />
        </TabsContent>
        <TabsContent value="knowledge" className="mt-6">
          <KnowledgeBase
            agentId={agent.id}
            initialConfig={agent.config.knowledge || {}}
            onUpdate={(updatedConfig) => setAgent({...agent, config: {...agent.config, knowledge: updatedConfig}})}
          />
        </TabsContent>
        <TabsContent value="behavior" className="mt-6">
          <BehaviorSettings
            agentId={agent.id}
            initialConfig={agent.config.behavior || {}}
            onUpdate={(updatedConfig) => setAgent({...agent, config: {...agent.config, behavior: updatedConfig}})}
          />
        </TabsContent>
        <TabsContent value="booking" className="mt-6">
          <BookingSettings
            agentId={agent.id}
            initialConfig={agent.config.booking || {}}
            onUpdate={(updatedConfig) => setAgent({...agent, config: {...agent.config, booking: updatedConfig}})}
          />
        </TabsContent>
        <TabsContent value="escalation" className="mt-6">
          <EscalationRules
            agentId={agent.id}
            initialConfig={agent.config.escalation || {}}
            onUpdate={(updatedConfig) => setAgent({...agent, config: {...agent.config, escalation: updatedConfig}})}
          />
        </TabsContent>
        <TabsContent value="templates" className="mt-6">
          <ResponseTemplates
            agentId={agent.id}
            initialConfig={agent.config.templates || {}}
            onUpdate={(updatedConfig) => setAgent({...agent, config: {...agent.config, templates: updatedConfig}})}
          />
        </TabsContent>
        <TabsContent value="responses" className="mt-6">
          <ResponseSettings
            agentId={agent.id}
            initialConfig={agent.config.response || {}}
            onUpdate={(updatedConfig) => setAgent({...agent, config: {...agent.config, response: updatedConfig}})}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}