"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare, Hand, AlertCircle, Calendar, CheckCircle, Save } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  icon: typeof MessageSquare
  content: string
  color: string
}

export function ResponseTemplates() {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "greeting",
      name: "Greeting",
      description: "First message when a conversation starts",
      icon: Hand,
      content:
        "Hi {{name}}! Welcome to {{business}}. I'm {{agent}}, your AI assistant. How can I help you today?",
      color: "bg-primary/10 text-primary",
    },
    {
      id: "fallback",
      name: "Fallback",
      description: "When AI doesn't understand the request",
      icon: AlertCircle,
      content:
        "I'm not quite sure I understood that. Could you please rephrase your question? Or if you'd like, I can connect you with a human agent.",
      color: "bg-chart-2/10 text-chart-2",
    },
    {
      id: "escalation",
      name: "Escalation",
      description: "When handing off to a human agent",
      icon: MessageSquare,
      content:
        "I'm going to connect you with one of our team members who can better assist you. Please hold on, someone will be with you shortly.",
      color: "bg-chart-3/10 text-chart-3",
    },
    {
      id: "booking",
      name: "Booking Confirmation",
      description: "After successfully booking an appointment",
      icon: Calendar,
      content:
        "Great! Your appointment has been confirmed for {{date}} at {{time}}. You'll receive a reminder 24 hours before. Is there anything else I can help with?",
      color: "bg-chart-4/10 text-chart-4",
    },
    {
      id: "closing",
      name: "Closing",
      description: "End of conversation message",
      icon: CheckCircle,
      content:
        "Thank you for chatting with us! If you have any more questions, feel free to message us anytime. Have a great day! 😊",
      color: "bg-chart-5/10 text-chart-5",
    },
  ])
  const [isSaving, setIsSaving] = useState(false)

  const updateTemplate = (id: string, content: string) => {
    setTemplates(templates.map((t) => (t.id === id ? { ...t, content } : t)))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/agent/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "templates", data: templates }),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Response Templates</CardTitle>
          <CardDescription>
            Customize the messages your AI agent sends in different situations. Use{" "}
            {"{{placeholders}}"} for dynamic content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border p-4 bg-secondary/30">
            <p className="text-sm font-medium text-foreground mb-2">Available Placeholders</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <code className="px-2 py-1 rounded bg-background text-muted-foreground">
                {"{{name}}"}
              </code>
              <code className="px-2 py-1 rounded bg-background text-muted-foreground">
                {"{{business}}"}
              </code>
              <code className="px-2 py-1 rounded bg-background text-muted-foreground">
                {"{{agent}}"}
              </code>
              <code className="px-2 py-1 rounded bg-background text-muted-foreground">
                {"{{date}}"}
              </code>
              <code className="px-2 py-1 rounded bg-background text-muted-foreground">
                {"{{time}}"}
              </code>
              <code className="px-2 py-1 rounded bg-background text-muted-foreground">
                {"{{email}}"}
              </code>
              <code className="px-2 py-1 rounded bg-background text-muted-foreground">
                {"{{phone}}"}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {templates.map((template) => {
        const Icon = template.icon

        return (
          <Card key={template.id} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${template.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor={template.id}>Message Template</Label>
                <Textarea
                  id={template.id}
                  value={template.content}
                  onChange={(e) => updateTemplate(template.id, e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Templates"}
        </Button>
      </div>
    </div>
  )
}
