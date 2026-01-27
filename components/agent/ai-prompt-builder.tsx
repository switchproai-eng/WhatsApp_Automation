"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Sparkles, Building2, Target, MessageSquare, ShieldAlert, Save, Copy, RefreshCw } from "lucide-react"

export function AIPromptBuilder({ agentId, initialConfig = {}, onUpdate }: { agentId?: string; initialConfig?: any; onUpdate?: (updatedConfig: any) => void }) {
  const [config, setConfig] = useState({
    businessDescription: initialConfig.businessDescription || "",
    goals: initialConfig.goals || [] as string[],
    tone: initialConfig.tone || "professional",
    constraints: initialConfig.constraints || [] as string[],
    customInstructions: initialConfig.customInstructions || "",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Load saved prompt configuration when component mounts if no initial config provided
  useEffect(() => {
    if (!initialConfig || Object.keys(initialConfig).length === 0) {
      const loadConfig = async () => {
        try {
          const response = await fetch("/api/agent/config")
          if (response.ok) {
            const data = await response.json()
            if (data.config?.prompt) {
              setConfig(data.config.prompt)
            }
          }
        } catch (error) {
          console.error("Error loading AI prompt configuration:", error)
        } finally {
          setIsLoading(false)
        }
      }

      loadConfig()
    }
  }, [])
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
      if (agentId) {
        // Check if this is a new agent being created (agentId is 'new')
        if (agentId === 'new') {
          // For new agents, we should trigger the parent's save mechanism instead
          // The parent component handles creating new agents
          toast.info("Please save the agent using the main save button above.");
          setIsSaving(false);
          return;
        }

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
            config: { ...agentData.agent.config, prompt: { ...config, generatedPrompt } },
            is_default: agentData.agent.is_default
          }),
        })

        if (response.ok) {
          toast.success("AI prompt configuration saved successfully!")
          // Update parent component's state
          if (onUpdate) {
            onUpdate({ ...config, generatedPrompt });
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to save AI prompt configuration:", errorText);
          toast.error("Failed to save AI prompt configuration. Please try again.");
        }
      } else {
        // Use the old endpoint for backward compatibility
        const response = await fetch("/api/agent/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "prompt", data: { ...config, generatedPrompt } }),
        })

        if (response.ok) {
          toast.success("AI prompt configuration saved successfully!")
          // Update parent component's state
          if (onUpdate) {
            onUpdate({ ...config, generatedPrompt });
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to save AI prompt configuration:", errorText);
          toast.error("Failed to save AI prompt configuration. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error saving AI prompt configuration:", error);
      toast.error("An error occurred while saving the AI prompt configuration.");
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
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Business Description</CardTitle>
              <CardDescription className="text-gray-600">
                Describe your business for the AI to understand context
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Textarea
            placeholder="e.g., We are a digital marketing agency specializing in social media management and paid advertising for small businesses..."
            value={config.businessDescription}
            onChange={(e) => setConfig({ ...config, businessDescription: e.target.value })}
            rows={3}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
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
              className="flex-1 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add custom goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal(newGoal)}
            />
            <Button onClick={() => addGoal(newGoal)} disabled={!newGoal} className="bg-blue-600 hover:bg-blue-700 text-white">
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
              className="flex-1 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add custom constraint..."
              value={newConstraint}
              onChange={(e) => setNewConstraint(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addConstraint(newConstraint)}
            />
            <Button onClick={() => addConstraint(newConstraint)} disabled={!newConstraint} className="bg-blue-600 hover:bg-blue-700 text-white">
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
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Generated System Prompt</CardTitle>
                <CardDescription className="text-gray-600">This prompt will guide your AI agent's behavior</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generatePrompt} className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-100">
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={copyPrompt} className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-100">
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 font-mono text-sm whitespace-pre-wrap text-gray-800 max-h-96 overflow-y-auto">
            {generatedPrompt}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || isLoading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="w-4 h-4" />
          {(isSaving || isLoading) ? "Processing..." : "Save AI Configuration"}
        </Button>
      </div>
    </div>
  )
}
