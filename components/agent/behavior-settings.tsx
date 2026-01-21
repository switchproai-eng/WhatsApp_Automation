"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
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

export function BehaviorSettings() {
  const [settings, setSettings] = useState({
    enableAutoReplies: true,
    askContactDetails: true,
    enableBooking: false,
    enablePaymentCollection: false,
    enableSentimentDetection: true,
    responseDelay: 1,
    maxResponseLength: 300,
    enableTypingIndicator: true,
    enableReadReceipts: true,
    enableQuickReplies: true,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/agent/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "behavior", data: settings }),
      })
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
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Core Behaviors</CardTitle>
              <CardDescription>Configure fundamental AI agent behaviors</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-1/10">
                <MessageSquare className="w-4 h-4 text-chart-1" />
              </div>
              <div>
                <p className="font-medium text-foreground">Enable Auto-Replies</p>
                <p className="text-sm text-muted-foreground">
                  AI will automatically respond to incoming messages
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enableAutoReplies}
              onCheckedChange={() => toggleSetting("enableAutoReplies")}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <UserPlus className="w-4 h-4 text-chart-2" />
              </div>
              <div>
                <p className="font-medium text-foreground">Ask for Contact Details</p>
                <p className="text-sm text-muted-foreground">
                  Request name and email for lead capture
                </p>
              </div>
            </div>
            <Switch
              checked={settings.askContactDetails}
              onCheckedChange={() => toggleSetting("askContactDetails")}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-3/10">
                <Calendar className="w-4 h-4 text-chart-3" />
              </div>
              <div>
                <p className="font-medium text-foreground">Enable Booking</p>
                <p className="text-sm text-muted-foreground">
                  Allow customers to schedule appointments
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enableBooking}
              onCheckedChange={() => toggleSetting("enableBooking")}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-4/10">
                <CreditCard className="w-4 h-4 text-chart-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Enable Payment Collection</p>
                <p className="text-sm text-muted-foreground">
                  Send payment links during conversations
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enablePaymentCollection}
              onCheckedChange={() => toggleSetting("enablePaymentCollection")}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-5/10">
                <Heart className="w-4 h-4 text-chart-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Enable Sentiment Detection</p>
                <p className="text-sm text-muted-foreground">
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
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <Timer className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <CardTitle>Response Settings</CardTitle>
              <CardDescription>Fine-tune how the AI responds</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Response Delay</Label>
              <span className="text-sm text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
              Add a natural delay before responding to feel more human-like
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Max Response Length</Label>
              <span className="text-sm text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
              Limit response length for concise messages
            </p>
          </div>
        </CardContent>
      </Card>

      {/* UI Behaviors */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <MessageSquare className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <CardTitle>Chat Behaviors</CardTitle>
              <CardDescription>Control chat interface behaviors</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">Show Typing Indicator</p>
              <p className="text-sm text-muted-foreground">
                Display "typing..." while AI generates response
              </p>
            </div>
            <Switch
              checked={settings.enableTypingIndicator}
              onCheckedChange={() => toggleSetting("enableTypingIndicator")}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">Send Read Receipts</p>
              <p className="text-sm text-muted-foreground">
                Mark messages as read when processed
              </p>
            </div>
            <Switch
              checked={settings.enableReadReceipts}
              onCheckedChange={() => toggleSetting("enableReadReceipts")}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">Enable Quick Replies</p>
              <p className="text-sm text-muted-foreground">
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
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Behavior Settings"}
        </Button>
      </div>
    </div>
  )
}
