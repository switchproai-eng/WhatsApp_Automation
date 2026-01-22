"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bot, Save, Globe, Clock, Building2 } from "lucide-react"

const industries = [
  "E-commerce",
  "Healthcare",
  "Real Estate",
  "Education",
  "Finance",
  "Travel",
  "Food & Restaurant",
  "Automotive",
  "Technology",
  "Professional Services",
  "Retail",
  "Other",
]

const tones = [
  { value: "professional", label: "Professional", description: "Formal and business-like" },
  { value: "friendly", label: "Friendly", description: "Warm and approachable" },
  { value: "casual", label: "Casual", description: "Relaxed and conversational" },
  { value: "enthusiastic", label: "Enthusiastic", description: "Energetic and positive" },
  { value: "empathetic", label: "Empathetic", description: "Understanding and caring" },
]

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ar", name: "Arabic" },
  { code: "zh", name: "Chinese" },
  { code: "hi", name: "Hindi" },
]

export function AgentProfile() {
  const [profile, setProfile] = useState({
    name: "",
    industry: "",
    description: "",
    tone: "professional",
    language: "en",
    businessHoursStart: "09:00",
    businessHoursEnd: "18:00",
    timezone: "UTC",
    workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/agent/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "profile", data: profile }),
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleWorkDay = (day: string) => {
    setProfile((prev) => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter((d) => d !== day)
        : [...prev.workDays, day],
    }))
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="space-y-6">
      {/* Agent Identity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Agent Identity</CardTitle>
              <CardDescription>Define your AI agent's personality and role</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="e.g., Emma, Alex, Support Bot"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                This name will be used when the agent introduces itself
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={profile.industry}
                onValueChange={(value) => setProfile({ ...profile, industry: value })}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry.toLowerCase()}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your business and what your agent should know about it..."
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Help the AI understand your business context for better responses
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tone of Voice */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <Building2 className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <CardTitle>Tone of Voice</CardTitle>
              <CardDescription>Set how your agent communicates with customers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tones.map((tone) => (
              <button
                key={tone.value}
                onClick={() => setProfile({ ...profile, tone: tone.value })}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  profile.tone === tone.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="font-medium text-foreground">{tone.label}</p>
                <p className="text-sm text-muted-foreground">{tone.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language & Localization */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <Globe className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>Configure language preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language">Default Language</Label>
            <Select
              value={profile.language}
              onValueChange={(value) => setProfile({ ...profile, language: value })}
            >
              <SelectTrigger id="language" className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The agent can auto-detect and respond in the customer's language
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-4/10">
              <Clock className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Define when your business operates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={profile.businessHoursStart}
                onChange={(e) => setProfile({ ...profile, businessHoursStart: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={profile.businessHoursEnd}
                onChange={(e) => setProfile({ ...profile, businessHoursEnd: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={profile.timezone}
                onValueChange={(value) => setProfile({ ...profile, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Working Days</Label>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <Badge
                  key={day}
                  variant={profile.workDays.includes(day) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5"
                  onClick={() => toggleWorkDay(day)}
                >
                  {day}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  )
}
