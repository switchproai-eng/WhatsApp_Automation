"use client"

import { useState, useEffect } from "react"
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
import { toast } from "sonner"
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

export function AgentProfile({ agentId, initialConfig = {}, onUpdate }: { agentId?: string; initialConfig?: any; onUpdate?: (updatedConfig: any) => void }) {
  const [profile, setProfile] = useState({
    name: initialConfig.name || "",
    industry: initialConfig.industry || "",
    description: initialConfig.description || "",
    tone: initialConfig.tone || "professional",
    language: initialConfig.language || "en",
    businessHoursStart: initialConfig.businessHoursStart || "09:00",
    businessHoursEnd: initialConfig.businessHoursEnd || "18:00",
    timezone: initialConfig.timezone || "UTC",
    workDays: initialConfig.workDays || ["Mon", "Tue", "Wed", "Thu", "Fri"],
    phoneNumber: initialConfig.phoneNumber || "",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Load saved profile data when component mounts if no initial config provided
  useEffect(() => {
    if (!initialConfig || Object.keys(initialConfig).length === 0) {
      const loadProfile = async () => {
        try {
          const response = await fetch("/api/agent/config")
          if (response.ok) {
            const data = await response.json()
            if (data.config?.profile) {
              setProfile(data.config.profile)
            }
          }
        } catch (error) {
          console.error("Error loading profile:", error)
        } finally {
          setIsLoading(false)
        }
      }

      loadProfile()
    }
  }, [])

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (agentId) {
        // Check if this is a new agent being created (agentId is 'new')
        if (agentId === 'new') {
          // For new agents, we should trigger the parent's save mechanism instead
          // The parent component handles creating new agents
          toast.info("Please save the agent using the main save button above.");
          setIsSaving(false);
          return;
        }

        // Get current agent to preserve is_default status
        const agentResponse = await fetch(`/api/agents/${agentId}`);
        if (!agentResponse.ok) {
          throw new Error("Failed to fetch agent details");
        }
        const agentData = await agentResponse.json();

        // Update the specific agent - also update the main name if it differs from the profile name
        const response = await fetch(`/api/agents/${agentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: profile.name || agentData.agent.name, // Use profile name if available, otherwise keep existing name
            config: { ...agentData.agent.config, profile },
            is_default: agentData.agent.is_default
          }),
        })

        if (response.ok) {
          toast.success("Profile saved successfully!")
          // Update parent component's state
          if (onUpdate) {
            onUpdate(profile);
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to save profile:", errorText);
          toast.error("Failed to save profile. Please try again.");
        }
      } else {
        // Use the old endpoint for backward compatibility
        const response = await fetch("/api/agent/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "profile", data: profile }),
        })

        if (response.ok) {
          toast.success("Profile saved successfully!")
          // Update parent component's state
          if (onUpdate) {
            onUpdate(profile);
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to save profile:", errorText);
          toast.error("Failed to save profile. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("An error occurred while saving the profile.");
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
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Agent Identity</CardTitle>
              <CardDescription className="text-gray-600">Define your AI agent's personality and role</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Agent Name</Label>
              <Input
                id="name"
                placeholder="e.g., Emma, Alex, Support Bot"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
              />
              <p className="text-xs text-gray-500">
                This name will be used when the agent introduces itself
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-gray-700">Industry</Label>
              <Select
                value={profile.industry}
                onValueChange={(value) => setProfile({ ...profile, industry: value })}
              >
                <SelectTrigger id="industry" className="border-gray-300 text-gray-900 bg-white">
                  <SelectValue placeholder="Select industry" className="text-gray-900" />
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
            <Label htmlFor="description" className="text-gray-700">Business Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your business and what your agent should know about it..."
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              rows={4}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
            />
            <p className="text-xs text-gray-500">
              Help the AI understand your business context for better responses
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-gray-700">WhatsApp Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="+1234567890"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
            />
            <p className="text-xs text-gray-500">
              Enter the WhatsApp number associated with this agent (e.g., +1234567890)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tone of Voice */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Tone of Voice</CardTitle>
              <CardDescription className="text-gray-600">Set how your agent communicates with customers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tones.map((tone) => (
              <button
                key={tone.value}
                onClick={() => setProfile({ ...profile, tone: tone.value })}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  profile.tone === tone.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <p className="font-medium text-gray-900">{tone.label}</p>
                <p className="text-sm text-gray-600">{tone.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language & Localization */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Language Settings</CardTitle>
              <CardDescription className="text-gray-600">Configure language preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label htmlFor="language" className="text-gray-700">Default Language</Label>
            <Select
              value={profile.language}
              onValueChange={(value) => setProfile({ ...profile, language: value })}
            >
              <SelectTrigger id="language" className="w-full md:w-64 border-gray-300 text-gray-900 bg-white">
                <SelectValue className="text-gray-900" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              The agent can auto-detect and respond in the customer's language
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Business Hours</CardTitle>
              <CardDescription className="text-gray-600">Define when your business operates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Start Time</Label>
              <Input
                type="time"
                value={profile.businessHoursStart}
                onChange={(e) => setProfile({ ...profile, businessHoursStart: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">End Time</Label>
              <Input
                type="time"
                value={profile.businessHoursEnd}
                onChange={(e) => setProfile({ ...profile, businessHoursEnd: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Timezone</Label>
              <Select
                value={profile.timezone}
                onValueChange={(value) => setProfile({ ...profile, timezone: value })}
              >
                <SelectTrigger className="border-gray-300 text-gray-900 bg-white">
                  <SelectValue className="text-gray-900" />
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
            <Label className="text-gray-700">Working Days</Label>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <Badge
                  key={day}
                  variant={profile.workDays.includes(day) ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1.5 ${profile.workDays.includes(day) ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-700 border-gray-300'}`}
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
        <Button onClick={handleSave} disabled={isSaving || isLoading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="w-4 h-4" />
          {(isSaving || isLoading) ? "Processing..." : "Save Profile"}
        </Button>
      </div>
    </div>
  )
}
