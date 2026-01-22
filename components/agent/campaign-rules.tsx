"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Megaphone, Moon, Gauge, FileText, Save } from "lucide-react"

export function CampaignRules() {
  const [settings, setSettings] = useState({
    enableQuietHours: true,
    quietHoursStart: "21:00",
    quietHoursEnd: "09:00",
    respectTimezone: true,
    messagesPerMinute: 20,
    messagesPerHour: 200,
    messagesPerDay: 1000,
    enableRateLimiting: true,
    allowedTemplateTypes: ["marketing", "utility", "authentication"],
    requireOptIn: true,
    optOutKeywords: ["stop", "unsubscribe", "opt out"],
    autoRemoveOptedOut: true,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/agent/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "campaigns", data: settings }),
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTemplateType = (type: string) => {
    setSettings((prev) => ({
      ...prev,
      allowedTemplateTypes: prev.allowedTemplateTypes.includes(type)
        ? prev.allowedTemplateTypes.filter((t) => t !== type)
        : [...prev.allowedTemplateTypes, type],
    }))
  }

  const templateTypes = [
    { value: "marketing", label: "Marketing", description: "Promotional messages" },
    { value: "utility", label: "Utility", description: "Transactional updates" },
    { value: "authentication", label: "Authentication", description: "OTPs and verification" },
  ]

  return (
    <div className="space-y-6">
      {/* Quiet Hours */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Moon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Quiet Hours</CardTitle>
                <CardDescription>Don't send messages during specified times</CardDescription>
              </div>
            </div>
            <Switch
              checked={settings.enableQuietHours}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableQuietHours: checked })
              }
            />
          </div>
        </CardHeader>
        {settings.enableQuietHours && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time (No messages after)</Label>
                <Input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) => setSettings({ ...settings, quietHoursStart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time (Resume messages at)</Label>
                <Input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) => setSettings({ ...settings, quietHoursEnd: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Respect Contact Timezone</p>
                <p className="text-sm text-muted-foreground">
                  Use contact's timezone for quiet hours calculation
                </p>
              </div>
              <Switch
                checked={settings.respectTimezone}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, respectTimezone: checked })
                }
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Rate Limits */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <Gauge className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <CardTitle>Rate Limits</CardTitle>
                <CardDescription>Control message sending speed</CardDescription>
              </div>
            </div>
            <Switch
              checked={settings.enableRateLimiting}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableRateLimiting: checked })
              }
            />
          </div>
        </CardHeader>
        {settings.enableRateLimiting && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Messages per Minute</Label>
                <Input
                  type="number"
                  value={settings.messagesPerMinute}
                  onChange={(e) =>
                    setSettings({ ...settings, messagesPerMinute: parseInt(e.target.value) })
                  }
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Messages per Hour</Label>
                <Input
                  type="number"
                  value={settings.messagesPerHour}
                  onChange={(e) =>
                    setSettings({ ...settings, messagesPerHour: parseInt(e.target.value) })
                  }
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Messages per Day</Label>
                <Input
                  type="number"
                  value={settings.messagesPerDay}
                  onChange={(e) =>
                    setSettings({ ...settings, messagesPerDay: parseInt(e.target.value) })
                  }
                  min={1}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Rate limits help comply with WhatsApp policies and prevent account restrictions
            </p>
          </CardContent>
        )}
      </Card>

      {/* Template Types */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <FileText className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <CardTitle>Allowed Template Types</CardTitle>
              <CardDescription>Select which message templates can be used</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {templateTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => toggleTemplateType(type.value)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  settings.allowedTemplateTypes.includes(type.value)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="font-medium text-foreground">{type.label}</p>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opt-In/Out Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-4/10">
              <Megaphone className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <CardTitle>Opt-In/Out Settings</CardTitle>
              <CardDescription>Manage subscription preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">Require Opt-In</p>
              <p className="text-sm text-muted-foreground">
                Only send to contacts who have opted in
              </p>
            </div>
            <Switch
              checked={settings.requireOptIn}
              onCheckedChange={(checked) => setSettings({ ...settings, requireOptIn: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">Auto-Remove Opted Out</p>
              <p className="text-sm text-muted-foreground">
                Automatically remove contacts who opt out
              </p>
            </div>
            <Switch
              checked={settings.autoRemoveOptedOut}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoRemoveOptedOut: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Opt-Out Keywords</Label>
            <div className="flex flex-wrap gap-2">
              {settings.optOutKeywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="px-3 py-1">
                  {keyword}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Messages containing these words will trigger opt-out
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Campaign Rules"}
        </Button>
      </div>
    </div>
  )
}
