"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, Target, MessageSquare, Heart, Clock, Plus, X, Save } from "lucide-react"

export function EscalationRules() {
  const [rules, setRules] = useState({
    confidenceThreshold: 70,
    enableConfidenceEscalation: true,
    keywordTriggers: ["urgent", "speak to human", "manager", "complaint", "cancel"],
    enableKeywordEscalation: true,
    sentimentTriggers: ["angry", "frustrated"],
    enableSentimentEscalation: true,
    maxAIReplies: 5,
    enableReplyLimitEscalation: true,
    afterHoursRouting: "queue",
    escalationMessage:
      "I'm connecting you with a human agent who can better assist you. Please hold on.",
  })
  const [newKeyword, setNewKeyword] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const addKeyword = () => {
    if (newKeyword && !rules.keywordTriggers.includes(newKeyword.toLowerCase())) {
      setRules({
        ...rules,
        keywordTriggers: [...rules.keywordTriggers, newKeyword.toLowerCase()],
      })
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setRules({
      ...rules,
      keywordTriggers: rules.keywordTriggers.filter((k) => k !== keyword),
    })
  }

  const toggleSentiment = (sentiment: string) => {
    setRules({
      ...rules,
      sentimentTriggers: rules.sentimentTriggers.includes(sentiment)
        ? rules.sentimentTriggers.filter((s) => s !== sentiment)
        : [...rules.sentimentTriggers, sentiment],
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/agent/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "escalation", data: rules }),
      })
    } finally {
      setIsSaving(false)
    }
  }

  const sentiments = ["angry", "frustrated", "confused", "sad", "disappointed"]

  return (
    <div className="space-y-6">
      {/* Confidence Threshold */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Confidence Threshold</CardTitle>
                <CardDescription>
                  Escalate when AI confidence drops below threshold
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={rules.enableConfidenceEscalation}
              onCheckedChange={(checked) =>
                setRules({ ...rules, enableConfidenceEscalation: checked })
              }
            />
          </div>
        </CardHeader>
        {rules.enableConfidenceEscalation && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Minimum Confidence Level</Label>
              <span className="text-sm font-medium text-primary">
                {rules.confidenceThreshold}%
              </span>
            </div>
            <Slider
              value={[rules.confidenceThreshold]}
              onValueChange={(value) => setRules({ ...rules, confidenceThreshold: value[0] })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>More escalations</span>
              <span>Fewer escalations</span>
            </div>
            <p className="text-sm text-muted-foreground">
              When AI confidence is below {rules.confidenceThreshold}%, the conversation will be
              escalated to a human agent.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Keyword Triggers */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <MessageSquare className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <CardTitle>Keyword Triggers</CardTitle>
                <CardDescription>Escalate when specific words are detected</CardDescription>
              </div>
            </div>
            <Switch
              checked={rules.enableKeywordEscalation}
              onCheckedChange={(checked) =>
                setRules({ ...rules, enableKeywordEscalation: checked })
              }
            />
          </div>
        </CardHeader>
        {rules.enableKeywordEscalation && (
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              />
              <Button onClick={addKeyword} className="gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {rules.keywordTriggers.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="gap-1 pl-3 pr-1 py-1.5">
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {rules.keywordTriggers.length === 0 && (
              <p className="text-sm text-muted-foreground">No keyword triggers configured</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Sentiment Triggers */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-3/10">
                <Heart className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <CardTitle>Sentiment Triggers</CardTitle>
                <CardDescription>Escalate based on detected emotions</CardDescription>
              </div>
            </div>
            <Switch
              checked={rules.enableSentimentEscalation}
              onCheckedChange={(checked) =>
                setRules({ ...rules, enableSentimentEscalation: checked })
              }
            />
          </div>
        </CardHeader>
        {rules.enableSentimentEscalation && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sentiments.map((sentiment) => (
                <Badge
                  key={sentiment}
                  variant={rules.sentimentTriggers.includes(sentiment) ? "default" : "outline"}
                  className="cursor-pointer capitalize px-4 py-2"
                  onClick={() => toggleSentiment(sentiment)}
                >
                  {sentiment}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Conversations will escalate when customers show selected emotions
            </p>
          </CardContent>
        )}
      </Card>

      {/* Reply Limit */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-4/10">
                <AlertTriangle className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <CardTitle>Reply Limit</CardTitle>
                <CardDescription>Maximum AI replies before handoff</CardDescription>
              </div>
            </div>
            <Switch
              checked={rules.enableReplyLimitEscalation}
              onCheckedChange={(checked) =>
                setRules({ ...rules, enableReplyLimitEscalation: checked })
              }
            />
          </div>
        </CardHeader>
        {rules.enableReplyLimitEscalation && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Max AI Replies</Label>
              <span className="text-sm font-medium text-primary">{rules.maxAIReplies}</span>
            </div>
            <Slider
              value={[rules.maxAIReplies]}
              onValueChange={(value) => setRules({ ...rules, maxAIReplies: value[0] })}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              After {rules.maxAIReplies} AI replies, the conversation will be escalated to a
              human
            </p>
          </CardContent>
        )}
      </Card>

      {/* After Hours Routing */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-5/10">
              <Clock className="w-5 h-5 text-chart-5" />
            </div>
            <div>
              <CardTitle>After-Hours Routing</CardTitle>
              <CardDescription>How to handle messages outside business hours</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Routing Option</Label>
            <Select
              value={rules.afterHoursRouting}
              onValueChange={(value) => setRules({ ...rules, afterHoursRouting: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="queue">Queue for next business day</SelectItem>
                <SelectItem value="ai_only">AI responds only</SelectItem>
                <SelectItem value="voicemail">Collect contact & callback request</SelectItem>
                <SelectItem value="emergency">Route to on-call agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Message */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Escalation Message</CardTitle>
              <CardDescription>Message sent when escalating to human</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            value={rules.escalationMessage}
            onChange={(e) => setRules({ ...rules, escalationMessage: e.target.value })}
            placeholder="Enter escalation message..."
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Escalation Rules"}
        </Button>
      </div>
    </div>
  )
}
