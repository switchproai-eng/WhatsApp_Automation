"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Bot, MessageCircle, Clock, Settings, Save, Zap, Shield, Volume2 } from "lucide-react"

export function ResponseSettings({ agentId, initialConfig = {}, onUpdate }: { agentId?: string; initialConfig?: any; onUpdate?: (updatedConfig: any) => void }) {
  const [settings, setSettings] = useState({
    autoRespond: initialConfig.autoRespond || false,
    businessHoursOnly: initialConfig.businessHoursOnly || false,
    responseDelay: initialConfig.responseDelay || "immediate", // immediate, delayed, random
    delayTime: initialConfig.delayTime || 2, // seconds
    escalationKeywords: initialConfig.escalationKeywords || [],
    fallbackThreshold: initialConfig.fallbackThreshold || 0.6,
    readReceipts: initialConfig.readReceipts || true,
    markAsRead: initialConfig.markAsRead || true,
    responseTemplates: initialConfig.responseTemplates || [],
    enableTypingIndicator: initialConfig.enableTypingIndicator || true,
    autoCloseConversation: initialConfig.autoCloseConversation || false,
    autoCloseTimeout: initialConfig.autoCloseTimeout || 24, // hours
  })
  
  const [newKeyword, setNewKeyword] = useState("")
  const [newTemplate, setNewTemplate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load saved settings when component mounts if no initial config provided
  useEffect(() => {
    if (!initialConfig || Object.keys(initialConfig).length === 0) {
      const loadSettings = async () => {
        try {
          const response = await fetch("/api/agent/config")
          if (response.ok) {
            const data = await response.json()
            if (data.config?.response) {
              setSettings(data.config.response)
            }
          }
        } catch (error) {
          console.error("Error loading response settings:", error)
        } finally {
          setIsLoading(false)
        }
      }

      loadSettings()
    }
  }, [])

  const addEscalationKeyword = () => {
    if (newKeyword.trim() && !settings.escalationKeywords.includes(newKeyword.trim().toLowerCase())) {
      setSettings({
        ...settings,
        escalationKeywords: [...settings.escalationKeywords, newKeyword.trim().toLowerCase()]
      })
      setNewKeyword("")
    }
  }

  const removeEscalationKeyword = (keyword: string) => {
    setSettings({
      ...settings,
      escalationKeywords: settings.escalationKeywords.filter((k: string) => k !== keyword)
    })
  }

  const addResponseTemplate = () => {
    if (newTemplate.trim()) {
      setSettings({
        ...settings,
        responseTemplates: [...settings.responseTemplates, newTemplate.trim()]
      })
      setNewTemplate("")
    }
  }

  const removeResponseTemplate = (template: string) => {
    setSettings({
      ...settings,
      responseTemplates: settings.responseTemplates.filter((t: string) => t !== template)
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (agentId) {
        // Get current agent to preserve other config sections
        const agentResponse = await fetch(`/api/agents/${agentId}`);
        if (!agentResponse.ok) {
          throw new Error("Failed to fetch agent details");
        }
        const agentData = await agentResponse.json();

        // Update the specific agent
        const response = await fetch(`/api/agents/${agentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: agentData.agent.name,
            config: { ...agentData.agent.config, response: settings },
            is_default: agentData.agent.is_default
          }),
        })

        if (response.ok) {
          toast.success("Response settings saved successfully!")
          // Update parent component's state
          if (onUpdate) {
            onUpdate(settings);
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to save response settings:", errorText);
          toast.error("Failed to save response settings. Please try again.");
        }
      } else {
        // Use the old endpoint for backward compatibility
        const response = await fetch("/api/agent/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "response", data: settings }),
        })

        if (response.ok) {
          toast.success("Response settings saved successfully!")
          // Update parent component's state
          if (onUpdate) {
            onUpdate(settings);
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to save response settings:", errorText);
          toast.error("Failed to save response settings. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error saving response settings:", error);
      toast.error("An error occurred while saving the response settings.");
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Auto-Reply Settings */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Auto-Reply Settings</CardTitle>
              <CardDescription className="text-gray-600">Configure automatic responses to incoming messages</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-lg font-medium text-gray-900">Enable Auto-Reply</Label>
              <p className="text-sm text-gray-600">Automatically respond to incoming messages</p>
            </div>
            <Switch
              checked={settings.autoRespond}
              onCheckedChange={(checked) => setSettings({ ...settings, autoRespond: checked })}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          <div className="flex items-center justify-between pl-2">
            <div>
              <Label className="text-base font-medium text-gray-800">Business Hours Only</Label>
              <p className="text-sm text-gray-600">Only auto-reply during configured business hours</p>
            </div>
            <Switch
              checked={settings.businessHoursOnly}
              onCheckedChange={(checked) => setSettings({ ...settings, businessHoursOnly: checked })}
              disabled={!settings.autoRespond}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          <div className="flex items-center justify-between pl-2">
            <div>
              <Label className="text-base font-medium text-gray-800">Enable Typing Indicator</Label>
              <p className="text-sm text-gray-600">Show typing indicator when generating responses</p>
            </div>
            <Switch
              checked={settings.enableTypingIndicator}
              onCheckedChange={(checked) => setSettings({ ...settings, enableTypingIndicator: checked })}
              disabled={!settings.autoRespond}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Response Timing */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Response Timing</CardTitle>
              <CardDescription className="text-gray-600">Control when and how quickly responses are sent</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700">Response Delay</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: "immediate", label: "Immediate", desc: "Respond as quickly as possible" },
                { value: "delayed", label: "Delayed", desc: "Wait before responding" },
                { value: "random", label: "Random", desc: "Random delay between 1-5 seconds" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, responseDelay: option.value })}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    settings.responseDelay === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {settings.responseDelay !== "immediate" && (
            <div className="space-y-2">
              <Label htmlFor="delayTime" className="text-gray-700">Delay Time (seconds)</Label>
              <input
                id="delayTime"
                type="range"
                min="1"
                max="10"
                value={settings.delayTime}
                onChange={(e) => setSettings({ ...settings, delayTime: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>1s</span>
                <span className="font-medium">{settings.delayTime}s</span>
                <span>10s</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Escalation Keywords */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Escalation Keywords</CardTitle>
              <CardDescription className="text-gray-600">Words that trigger escalation to human agents</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700">Add Escalation Keyword</Label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., manager, supervisor, complaint..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEscalationKeyword()}
              />
              <Button onClick={addEscalationKeyword} disabled={!newKeyword.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                Add
              </Button>
            </div>
          </div>

          {settings.escalationKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {settings.escalationKeywords.map((keyword: string) => (
                <Badge key={keyword} variant="destructive" className="gap-1 pl-3 pr-1 py-1.5">
                  {keyword}
                  <button 
                    onClick={() => removeEscalationKeyword(keyword)} 
                    className="ml-1 hover:text-destructive-foreground"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Label className="text-gray-700">Fallback Confidence Threshold</Label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.fallbackThreshold}
                onChange={(e) => setSettings({ ...settings, fallbackThreshold: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-sm font-medium text-gray-700 w-12">{(settings.fallbackThreshold * 100).toFixed(0)}%</span>
            </div>
            <p className="text-xs text-gray-500">
              If AI confidence is below this threshold, escalate to human agent
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Management */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Conversation Management</CardTitle>
              <CardDescription className="text-gray-600">Control how conversations are handled</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium text-gray-800">Auto-Close Conversations</Label>
              <p className="text-sm text-gray-600">Automatically close inactive conversations</p>
            </div>
            <Switch
              checked={settings.autoCloseConversation}
              onCheckedChange={(checked) => setSettings({ ...settings, autoCloseConversation: checked })}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {settings.autoCloseConversation && (
            <div className="space-y-2 pl-2">
              <Label htmlFor="autoCloseTimeout" className="text-gray-700">Close After (hours)</Label>
              <input
                id="autoCloseTimeout"
                type="number"
                min="1"
                max="168"
                value={settings.autoCloseTimeout}
                onChange={(e) => setSettings({ ...settings, autoCloseTimeout: parseInt(e.target.value) || 24 })}
                className="w-24 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Close conversations after this many hours of inactivity
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium text-gray-800">Mark Messages as Read</Label>
              <p className="text-sm text-gray-600">Automatically mark received messages as read</p>
            </div>
            <Switch
              checked={settings.markAsRead}
              onCheckedChange={(checked) => setSettings({ ...settings, markAsRead: checked })}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || isLoading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="w-4 h-4" />
          {(isSaving || isLoading) ? "Processing..." : "Save Response Settings"}
        </Button>
      </div>
    </div>
  )
}