"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Clock, Bell, Link2, Save, ExternalLink } from "lucide-react"

export function BookingSettings({ agentId, initialConfig = {}, onUpdate }: { agentId?: string; initialConfig?: any; onUpdate?: (updatedConfig: any) => void }) {
  const [settings, setSettings] = useState({
    enableBooking: initialConfig.enableBooking ?? false,
    calendarProvider: initialConfig.calendarProvider ?? "none",
    calendarUrl: initialConfig.calendarUrl ?? "",
    slotDuration: initialConfig.slotDuration ?? 30,
    bufferTime: initialConfig.bufferTime ?? 15,
    maxAdvanceBooking: initialConfig.maxAdvanceBooking ?? 30,
    minAdvanceBooking: initialConfig.minAdvanceBooking ?? 24,
    availableDays: initialConfig.availableDays ?? ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startTime: initialConfig.startTime ?? "09:00",
    endTime: initialConfig.endTime ?? "17:00",
    enableReminders: initialConfig.enableReminders ?? true,
    reminderTime: initialConfig.reminderTime ?? 24,
    confirmationMessage: initialConfig.confirmationMessage ?? "Your appointment has been booked for {{date}} at {{time}}.",
    reminderMessage: initialConfig.reminderMessage ?? "Reminder: You have an appointment tomorrow at {{time}}.",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Load saved booking settings when component mounts if no initial config provided
  useEffect(() => {
    if (!initialConfig || Object.keys(initialConfig).length === 0) {
      const loadSettings = async () => {
        try {
          const response = await fetch("/api/agent/config")
          if (response.ok) {
            const data = await response.json()
            if (data.config?.booking) {
              setSettings(data.config.booking)
            }
          }
        } catch (error) {
          console.error("Error loading booking settings:", error)
        } finally {
          setIsLoading(false)
        }
      }

      loadSettings()
    }
  }, [])
  const [isSaving, setIsSaving] = useState(false)

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
            config: { ...agentData.agent.config, booking: settings },
            is_default: agentData.agent.is_default
          }),
        })

        if (response.ok) {
          toast.success("Booking settings saved successfully!")
          // Update parent component's state
          if (onUpdate) {
            onUpdate(settings);
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to save booking settings:", errorText);
          toast.error("Failed to save booking settings. Please try again.");
        }
      } else {
        // Use the old endpoint for backward compatibility
        const response = await fetch("/api/agent/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "booking", data: settings }),
        })

        if (response.ok) {
          toast.success("Booking settings saved successfully!")
          // Update parent component's state
          if (onUpdate) {
            onUpdate(settings);
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to save booking settings:", errorText);
          toast.error("Failed to save booking settings. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error saving booking settings:", error);
      toast.error("An error occurred while saving the booking settings.");
    } finally {
      setIsSaving(false)
    }
  }

  const toggleDay = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }))
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="space-y-6">
      {/* Enable Booking */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Booking System</CardTitle>
                <CardDescription className="text-gray-600">Allow customers to schedule appointments</CardDescription>
              </div>
            </div>
            <Switch
              checked={settings.enableBooking}
              onCheckedChange={(checked) => setSettings({ ...settings, enableBooking: checked })}
            />
          </div>
        </CardHeader>
      </Card>

      {settings.enableBooking && (
        <>
          {/* Calendar Integration */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Link2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-gray-900">Calendar Integration</CardTitle>
                  <CardDescription className="text-gray-600">Connect your calendar for real-time availability</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label className="text-gray-700">Calendar Provider</Label>
                <Select
                  value={settings.calendarProvider}
                  onValueChange={(value) => setSettings({ ...settings, calendarProvider: value })}
                >
                  <SelectTrigger className="text-gray-900 bg-white">
                    <SelectValue className="text-gray-900" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No integration</SelectItem>
                    <SelectItem value="google">Google Calendar</SelectItem>
                    <SelectItem value="outlook">Microsoft Outlook</SelectItem>
                    <SelectItem value="calendly">Calendly</SelectItem>
                    <SelectItem value="cal">Cal.com</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.calendarProvider !== "none" && (
                <div className="space-y-2">
                  <Label className="text-gray-700">Calendar URL / API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={settings.calendarUrl}
                      onChange={(e) => setSettings({ ...settings, calendarUrl: e.target.value })}
                      placeholder="Enter calendar integration URL or API key"
                      className="text-gray-900 bg-white"
                    />
                    <Button variant="outline" className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-100">
                      <ExternalLink className="w-4 h-4" />
                      Connect
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-gray-900">Availability</CardTitle>
                  <CardDescription className="text-gray-600">Set when appointments can be booked</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label className="text-gray-700">Available Days</Label>
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <Badge
                      key={day}
                      variant={settings.availableDays.includes(day) ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 ${settings.availableDays.includes(day) ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-700 border-gray-300'}`}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Start Time</Label>
                  <Input
                    type="time"
                    value={settings.startTime}
                    onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
                    className="text-gray-900 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">End Time</Label>
                  <Input
                    type="time"
                    value={settings.endTime}
                    onChange={(e) => setSettings({ ...settings, endTime: e.target.value })}
                    className="text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Slot Duration (minutes)</Label>
                  <Select
                    value={settings.slotDuration.toString()}
                    onValueChange={(value) =>
                      setSettings({ ...settings, slotDuration: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="text-gray-900 bg-white">
                      <SelectValue className="text-gray-900" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Buffer Between Slots (minutes)</Label>
                  <Select
                    value={settings.bufferTime.toString()}
                    onValueChange={(value) =>
                      setSettings({ ...settings, bufferTime: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="text-gray-900 bg-white">
                      <SelectValue className="text-gray-900" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Minimum Advance Booking (hours)</Label>
                  <Input
                    type="number"
                    value={settings.minAdvanceBooking}
                    onChange={(e) =>
                      setSettings({ ...settings, minAdvanceBooking: parseInt(e.target.value) })
                    }
                    min={1}
                    className="text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-600">
                    How far in advance appointments must be booked
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Maximum Advance Booking (days)</Label>
                  <Input
                    type="number"
                    value={settings.maxAdvanceBooking}
                    onChange={(e) =>
                      setSettings({ ...settings, maxAdvanceBooking: parseInt(e.target.value) })
                    }
                    min={1}
                    className="text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-600">
                    How far into the future appointments can be booked
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Bell className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900">Reminders</CardTitle>
                    <CardDescription className="text-gray-600">Send appointment reminders to customers</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={settings.enableReminders}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableReminders: checked })
                  }
                />
              </div>
            </CardHeader>
            {settings.enableReminders && (
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label className="text-gray-700">Send Reminder Before (hours)</Label>
                  <Select
                    value={settings.reminderTime.toString()}
                    onValueChange={(value) =>
                      setSettings({ ...settings, reminderTime: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-full md:w-48 text-gray-900 bg-white">
                      <SelectValue className="text-gray-900" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Confirmation Message</Label>
                  <Input
                    value={settings.confirmationMessage}
                    onChange={(e) =>
                      setSettings({ ...settings, confirmationMessage: e.target.value })
                    }
                    className="text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-600">
                    {"Use {{date}}, {{time}}, {{name}} as placeholders"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Reminder Message</Label>
                  <Input
                    value={settings.reminderMessage}
                    onChange={(e) =>
                      setSettings({ ...settings, reminderMessage: e.target.value })
                    }
                    className="text-gray-900 bg-white"
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || isLoading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="w-4 h-4" />
          {(isSaving || isLoading) ? "Processing..." : "Save Booking Settings"}
        </Button>
      </div>
    </div>
  )
}
