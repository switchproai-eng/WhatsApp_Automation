"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Building2, Target, MessageSquare, ShieldAlert, Save, Copy, RefreshCw } from "lucide-react"

export function AIPromptBuilder() {
  const [config, setConfig] = useState({
    businessDescription: "",
    goals: [] as string[],
    tone: "professional",
    constraints: [] as string[],
    customInstructions: "",
  })
  const [newGoal, setNewGoal] = useState("")
  const [newConstraint, setNewConstraint] = useState("")
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const defaultGoals = [
    "Answer customer questions",
    "Capture leads",
    "Schedule appointments",
    "Provide product info",
    "Handle support tickets",
  ]

  const defaultConstraints = [
    "Never share competitor information",
    "Don't make promises about delivery times",
    "Always recommend consulting a professional for legal/medical advice",
    "Don't discuss pricing without confirming with team",
    "Never share internal processes",
  ]

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "casual", label: "Casual" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "empathetic", label: "Empathetic" },
  ]

  const addGoal = (goal: string) => {
    if (goal && !config.goals.includes(goal)) {
      setConfig({ ...config, goals: [...config.goals, goal] })
      setNewGoal("")
    }
  }

  const removeGoal = (goal: string) => {
    setConfig({ ...config, goals: config.goals.filter((g) => g !== goal) })
  }

  const addConstraint = (constraint: string) => {
    if (constraint && !config.constraints.includes(constraint)) {
      setConfig({ ...config, constraints: [...config.constraints, constraint] })
      setNewConstraint("")
    }
  }

  const removeConstraint = (constraint: string) => {
    setConfig({ ...config, constraints: config.constraints.filter((c) => c !== constraint) })
  }

  const generatePrompt = () => {
    const prompt = `You are an AI customer service agent for ${config.businessDescription || "[Business Name]"}.

## Personality & Tone
- Communicate in a ${config.tone} manner
- Be helpful, accurate, and concise
- Always maintain a positive attitude

## Primary Goals
${config.goals.length > 0 ? config.goals.map((g) => `- ${g}`).join("\n") : "- Assist customers with their inquiries"}

## Constraints & Guidelines
${config.constraints.length > 0 ? config.constraints.map((c) => `- ${c}`).join("\n") : "- Follow company policies and guidelines"}

## Additional Instructions
${config.customInstructions || "Respond naturally and helpfully to customer messages."}

Remember to:
1. Greet customers warmly
2. Listen to their needs
3. Provide accurate information
4. Offer to escalate to a human when necessary
5. Thank them for their interaction`

    setGeneratedPrompt(prompt)
  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/agent/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "prompt", data: { ...config, generatedPrompt } }),
      })
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    generatePrompt()
  }, [config])

  return (
    <div className="space-y-6">
      {/* Business Description */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Business Description</CardTitle>
              <CardDescription>
                Describe your business for the AI to understand context
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., We are a digital marketing agency specializing in social media management and paid advertising for small businesses..."
            value={config.businessDescription}
            onChange={(e) => setConfig({ ...config, businessDescription: e.target.value })}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Goals */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <Target className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <CardTitle>Goals</CardTitle>
              <CardDescription>What should your AI agent accomplish?</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground mb-2 block">Quick Add</Label>
            <div className="flex flex-wrap gap-2">
              {defaultGoals
                .filter((g) => !config.goals.includes(g))
                .map((goal) => (
                  <Badge
                    key={goal}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => addGoal(goal)}
                  >
                    + {goal}
                  </Badge>
                ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-foreground"
              placeholder="Add custom goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal(newGoal)}
            />
            <Button onClick={() => addGoal(newGoal)} disabled={!newGoal}>
              Add
            </Button>
          </div>

          {config.goals.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {config.goals.map((goal) => (
                <Badge key={goal} variant="secondary" className="gap-1 pl-3 pr-1 py-1.5">
                  {goal}
                  <button onClick={() => removeGoal(goal)} className="ml-1 hover:text-destructive">
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tone */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <MessageSquare className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <CardTitle>Tone</CardTitle>
              <CardDescription>How should your AI communicate?</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tones.map((tone) => (
              <Badge
                key={tone.value}
                variant={config.tone === tone.value ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setConfig({ ...config, tone: tone.value })}
              >
                {tone.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Constraints */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-4/10">
              <ShieldAlert className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <CardTitle>Constraints</CardTitle>
              <CardDescription>What should your AI avoid doing?</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground mb-2 block">Quick Add</Label>
            <div className="flex flex-wrap gap-2">
              {defaultConstraints
                .filter((c) => !config.constraints.includes(c))
                .slice(0, 3)
                .map((constraint) => (
                  <Badge
                    key={constraint}
                    variant="outline"
                    className="cursor-pointer hover:bg-destructive/10 text-xs"
                    onClick={() => addConstraint(constraint)}
                  >
                    + {constraint.slice(0, 30)}...
                  </Badge>
                ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-foreground"
              placeholder="Add custom constraint..."
              value={newConstraint}
              onChange={(e) => setNewConstraint(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addConstraint(newConstraint)}
            />
            <Button onClick={() => addConstraint(newConstraint)} disabled={!newConstraint}>
              Add
            </Button>
          </div>

          {config.constraints.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {config.constraints.map((constraint) => (
                <Badge
                  key={constraint}
                  variant="secondary"
                  className="gap-1 pl-3 pr-1 py-1.5 text-xs"
                >
                  {constraint.length > 40 ? `${constraint.slice(0, 40)}...` : constraint}
                  <button
                    onClick={() => removeConstraint(constraint)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Instructions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-5/10">
              <Sparkles className="w-5 h-5 text-chart-5" />
            </div>
            <div>
              <CardTitle>Custom Instructions</CardTitle>
              <CardDescription>Additional specific instructions for your AI</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Always mention our current promotion. Suggest scheduling a call for complex inquiries..."
            value={config.customInstructions}
            onChange={(e) => setConfig({ ...config, customInstructions: e.target.value })}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Generated Prompt */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Generated System Prompt</CardTitle>
                <CardDescription>This prompt will guide your AI agent's behavior</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generatePrompt} className="gap-2 bg-transparent">
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={copyPrompt} className="gap-2 bg-transparent">
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-background p-4 font-mono text-sm whitespace-pre-wrap text-muted-foreground max-h-96 overflow-y-auto">
            {generatedPrompt}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save AI Configuration"}
        </Button>
      </div>
    </div>
  )
}
