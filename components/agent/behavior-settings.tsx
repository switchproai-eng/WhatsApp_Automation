"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import {
  MessageSquare,
  UserPlus,
  Calendar,
  CreditCard,
  Heart,
  Save,
  Zap,
  Timer,
} from "lucide-react"

export function BehaviorSettings({ agentId, initialConfig = {}, onUpdate }: { agentId?: string; initialConfig?: any; onUpdate?: (updatedConfig: any) => void }) {
  const [settings, setSettings] = useState({
    enableAutoReplies: initialConfig.enableAutoReplies ?? true,
    askContactDetails: initialConfig.askContactDetails ?? true,
    enableBooking: initialConfig.enableBooking ?? false,
    enablePaymentCollection: initialConfig.enablePaymentCollection ?? false,
    enableSentimentDetection: initialConfig.enableSentimentDetection ?? true,
    responseDelay: initialConfig.responseDelay ?? 1,
    maxResponseLength: initialConfig.maxResponseLength ?? 300,
    enableTypingIndicator: initialConfig.enableTypingIndicator ?? true,
    enableReadReceipts: initialConfig.enableReadReceipts ?? true,
    enableQuickReplies: initialConfig.enableQuickReplies ?? true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load saved behavior settings when component mounts if no initial config provided
  useEffect(() => {
    if (!initialConfig || Object.keys(initialConfig).length === 0) {
      const loadSettings = async () => {
        try {
          const response = await fetch("/api/agent/config")
          if (response.ok) {
            const data = await response.json()
            if (data.config?.behavior) {
              setSettings(data.config.behavior)
            }
          }
        } catch (error) {
          console.error("Error loading behavior settings:", error)
        } finally {
          setIsLoading(false)
        }
      }

      loadSettings()
    }
  }, [])

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
            config: { ...agentData.agent.config, behavior: settings },
            is_default: agentData.agent.is_default
          }),
        })

        if (response.ok) {
          toast.success("Behavior settings saved successfully!")
          // Update parent component's state
          if (onUpdate) {
            onUpdate(settings);
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to save behavior settings:", errorText);
          toast.error("Failed to save behavior settings. Please try again.");
        }
      } else {
        // Use the old endpoint for backward compatibility
        const response = await fetch("/api/agent/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "behavior", data: settings }),
        })

        if (response.ok) {
          toast.success("Behavior settings saved successfully!")
          // Update parent component's state
          if (onUpdate) {
            onUpdate(settings);
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to save behavior settings:", errorText);
          toast.error("Failed to save behavior settings. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error saving behavior settings:", error);
      toast.error("An error occurred while saving the behavior settings.");
    } finally {
      setIsSaving(false)
    }
  }

  const toggleSetting = (key: keyof typeof settings) => {
    if (typeof settings[key] === "boolean") {
      setSettings({ ...settings, [key]: !settings[key] })
    }
  }

  return (
    <div className="space-y-6">
      {/* Core Behaviors */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Core Behaviors</CardTitle>
              <CardDescription className="text-gray-600">Configure fundamental AI agent behaviors</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Enable Auto-Replies</p>
                <p className="text-sm text-gray-600">
                  AI will automatically respond to incoming messages
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enableAutoReplies}
              onCheckedChange={() => toggleSetting("enableAutoReplies")}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <UserPlus className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Ask for Contact Details</p>
                <p className="text-sm text-gray-600">
                  Request name and email for lead capture
                </p>
              </div>
            </div>
            <Switch
              checked={settings.askContactDetails}
              onCheckedChange={() => toggleSetting("askContactDetails")}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Enable Booking</p>
                <p className="text-sm text-gray-600">
                  Allow customers to schedule appointments
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enableBooking}
              onCheckedChange={() => toggleSetting("enableBooking")}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <CreditCard className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Enable Payment Collection</p>
                <p className="text-sm text-gray-600">
                  Send payment links during conversations
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enablePaymentCollection}
              onCheckedChange={() => toggleSetting("enablePaymentCollection")}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Heart className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Enable Sentiment Detection</p>
                <p className="text-sm text-gray-600">
                  Detect customer emotions and adapt responses
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enableSentimentDetection}
              onCheckedChange={() => toggleSetting("enableSentimentDetection")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Response Settings */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Timer className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Response Settings</CardTitle>
              <CardDescription className="text-gray-600">Fine-tune how the AI responds</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700">Response Delay</Label>
              <span className="text-sm text-gray-600">
                {settings.responseDelay} second{settings.responseDelay !== 1 ? "s" : ""}
              </span>
            </div>
            <Slider
              value={[settings.responseDelay]}
              onValueChange={(value) => setSettings({ ...settings, responseDelay: value[0] })}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Add a natural delay before responding to feel more human-like
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700">Max Response Length</Label>
              <span className="text-sm text-gray-600">
                {settings.maxResponseLength} characters
              </span>
            </div>
            <Slider
              value={[settings.maxResponseLength]}
              onValueChange={(value) =>
                setSettings({ ...settings, maxResponseLength: value[0] })
              }
              min={50}
              max={1000}
              step={50}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Limit response length for concise messages
            </p>
          </div>
        </CardContent>
      </Card>

      {/* UI Behaviors */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Chat Behaviors</CardTitle>
              <CardDescription className="text-gray-600">Control chat interface behaviors</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Show Typing Indicator</p>
              <p className="text-sm text-gray-600">
                Display "typing..." while AI generates response
              </p>
            </div>
            <Switch
              checked={settings.enableTypingIndicator}
              onCheckedChange={() => toggleSetting("enableTypingIndicator")}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Send Read Receipts</p>
              <p className="text-sm text-gray-600">
                Mark messages as read when processed
              </p>
            </div>
            <Switch
              checked={settings.enableReadReceipts}
              onCheckedChange={() => toggleSetting("enableReadReceipts")}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Enable Quick Replies</p>
              <p className="text-sm text-gray-600">
                Show suggested response buttons when appropriate
              </p>
            </div>
            <Switch
              checked={settings.enableQuickReplies}
              onCheckedChange={() => toggleSetting("enableQuickReplies")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || isLoading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="w-4 h-4" />
          {(isSaving || isLoading) ? "Processing..." : "Save Behavior Settings"}
        </Button>
      </div>
    </div>
  )
}
