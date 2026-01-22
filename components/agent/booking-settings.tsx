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
import { Calendar, Clock, Bell, Link2, Save, ExternalLink } from "lucide-react"

export function BookingSettings() {
  const [settings, setSettings] = useState({
    enableBooking: false,
    calendarProvider: "none",
    calendarUrl: "",
    slotDuration: 30,
    bufferTime: 15,
    maxAdvanceBooking: 30,
    minAdvanceBooking: 24,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startTime: "09:00",
    endTime: "17:00",
    enableReminders: true,
    reminderTime: 24,
    confirmationMessage: "Your appointment has been booked for {{date}} at {{time}}.",
    reminderMessage: "Reminder: You have an appointment tomorrow at {{time}}.",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/agent/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "booking", data: settings }),
      })
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
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Booking System</CardTitle>
                <CardDescription>Allow customers to schedule appointments</CardDescription>
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
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-2/10">
                  <Link2 className="w-5 h-5 text-chart-2" />
                </div>
                <div>
                  <CardTitle>Calendar Integration</CardTitle>
                  <CardDescription>Connect your calendar for real-time availability</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Calendar Provider</Label>
                <Select
                  value={settings.calendarProvider}
                  onValueChange={(value) => setSettings({ ...settings, calendarProvider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                  <Label>Calendar URL / API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={settings.calendarUrl}
                      onChange={(e) => setSettings({ ...settings, calendarUrl: e.target.value })}
                      placeholder="Enter calendar integration URL or API key"
                    />
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <ExternalLink className="w-4 h-4" />
                      Connect
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-3/10">
                  <Clock className="w-5 h-5 text-chart-3" />
                </div>
                <div>
                  <CardTitle>Availability</CardTitle>
                  <CardDescription>Set when appointments can be booked</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Available Days</Label>
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <Badge
                      key={day}
                      variant={settings.availableDays.includes(day) ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2"
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={settings.startTime}
                    onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={settings.endTime}
                    onChange={(e) => setSettings({ ...settings, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slot Duration (minutes)</Label>
                  <Select
                    value={settings.slotDuration.toString()}
                    onValueChange={(value) =>
                      setSettings({ ...settings, slotDuration: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>Buffer Between Slots (minutes)</Label>
                  <Select
                    value={settings.bufferTime.toString()}
                    onValueChange={(value) =>
                      setSettings({ ...settings, bufferTime: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>Minimum Advance Booking (hours)</Label>
                  <Input
                    type="number"
                    value={settings.minAdvanceBooking}
                    onChange={(e) =>
                      setSettings({ ...settings, minAdvanceBooking: parseInt(e.target.value) })
                    }
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    How far in advance appointments must be booked
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Maximum Advance Booking (days)</Label>
                  <Input
                    type="number"
                    value={settings.maxAdvanceBooking}
                    onChange={(e) =>
                      setSettings({ ...settings, maxAdvanceBooking: parseInt(e.target.value) })
                    }
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    How far into the future appointments can be booked
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-4/10">
                    <Bell className="w-5 h-5 text-chart-4" />
                  </div>
                  <div>
                    <CardTitle>Reminders</CardTitle>
                    <CardDescription>Send appointment reminders to customers</CardDescription>
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
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Send Reminder Before (hours)</Label>
                  <Select
                    value={settings.reminderTime.toString()}
                    onValueChange={(value) =>
                      setSettings({ ...settings, reminderTime: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue />
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
                  <Label>Confirmation Message</Label>
                  <Input
                    value={settings.confirmationMessage}
                    onChange={(e) =>
                      setSettings({ ...settings, confirmationMessage: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {"Use {{date}}, {{time}}, {{name}} as placeholders"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Reminder Message</Label>
                  <Input
                    value={settings.reminderMessage}
                    onChange={(e) =>
                      setSettings({ ...settings, reminderMessage: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Booking Settings"}
        </Button>
      </div>
    </div>
  )
}
