"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function AgentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const agentId = params.id as string;
  const isNew = agentId === 'new';
  const [agent, setAgent] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) {
      createNewAgent();
    } else {
      fetchAgent();
    }
  }, [agentId]);

  const createNewAgent = async () => {
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Agent', config: {} })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/agents/${data.agent.id}`);
      } else {
        toast({ title: "Error", description: "Failed to create agent" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create agent" });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgent = async () => {
    try {
      const res = await fetch(`/api/agents/${agentId}`);
      if (res.ok) {
        const data = await res.json();
        setAgent(data.agent);
      } else {
        toast({ title: "Error", description: "Agent not found" });
        router.push('/dashboard/agents');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load agent" });
      router.push('/dashboard/agents');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!agent) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: agent.name, config: agent.config })
      });
      if (res.ok) {
        toast({ title: "Success", description: "Agent saved" });
      } else {
        toast({ title: "Error", description: "Failed to save agent" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save agent" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center">Loading agent...</div>;

  if (!agent) return null;

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
          <Button onClick={handleSaveAll} disabled={saving}>
            {saving ? 'Saving...' : 'Save All'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/agents')}>
            Back to Agents
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
