"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Save,
  Play,
  Plus,
  MessageSquare,
  Clock,
  GitBranch,
  Zap,
  Bot,
  Trash2,
  GripVertical,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FlowNode {
  id: string
  type: "trigger" | "message" | "condition" | "delay" | "action" | "ai_response"
  data: Record<string, unknown>
}

interface FlowBuilderProps {
  tenantId: string
  existingFlow?: {
    id: string
    name: string
    description: string | null
    trigger_type: string
    nodes: FlowNode[]
  }
}

const nodeTypes = [
  {
    type: "message",
    label: "Send Message",
    icon: MessageSquare,
    color: "bg-primary/10 text-primary",
    description: "Send a text, image, or template message",
  },
  {
    type: "delay",
    label: "Wait/Delay",
    icon: Clock,
    color: "bg-chart-2/10 text-chart-2",
    description: "Wait for a specified time before continuing",
  },
  {
    type: "condition",
    label: "Condition",
    icon: GitBranch,
    color: "bg-chart-3/10 text-chart-3",
    description: "Branch based on conditions",
  },
  {
    type: "ai_response",
    label: "AI Response",
    icon: Bot,
    color: "bg-chart-4/10 text-chart-4",
    description: "Generate AI-powered response",
  },
  {
    type: "action",
    label: "Action",
    icon: Zap,
    color: "bg-chart-5/10 text-chart-5",
    description: "Perform an action (tag, assign, webhook)",
  },
]

export function FlowBuilder({ tenantId, existingFlow }: FlowBuilderProps) {
  const router = useRouter()
  const [name, setName] = useState(existingFlow?.name || "")
  const [description, setDescription] = useState(existingFlow?.description || "")
  const [triggerType, setTriggerType] = useState(existingFlow?.trigger_type || "keyword")
  const [triggerConfig, setTriggerConfig] = useState<Record<string, string>>({})
  const [nodes, setNodes] = useState<FlowNode[]>(existingFlow?.nodes || [])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Suppress unused variable warning
  void tenantId

  const addNode = useCallback((type: FlowNode["type"]) => {
    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type,
      data: type === "message" ? { content: "" } : {},
    }
    setNodes((prev) => [...prev, newNode])
    setSelectedNodeId(newNode.id)
  }, [])

  const updateNode = useCallback((id: string, data: Record<string, unknown>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...data } } : node))
    )
  }, [])

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id))
    if (selectedNodeId === id) {
      setSelectedNodeId(null)
    }
  }, [selectedNodeId])

  const handleSave = async () => {
    if (!name.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/flows", {
        method: existingFlow ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: existingFlow?.id,
          name,
          description,
          triggerType,
          triggerConfig,
          nodes,
        }),
      })

      if (response.ok) {
        router.push("/dashboard/flows")
        router.refresh()
      }
    } finally {
      setIsSaving(false)
    }
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-6">
      {/* Header */}
      <div className="h-14 px-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Flow name..."
            className="w-64 bg-transparent border-none text-lg font-semibold focus-visible:ring-0 px-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Play className="w-4 h-4" />
            Test Flow
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Flow"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Node Types */}
        <div className="w-64 border-r border-border bg-card p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-foreground mb-3">Add Node</h3>
          <div className="space-y-2">
            {nodeTypes.map((nodeType) => (
              <button
                key={nodeType.type}
                onClick={() => addNode(nodeType.type as FlowNode["type"])}
                className="w-full p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", nodeType.color)}>
                    <nodeType.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{nodeType.label}</p>
                    <p className="text-xs text-muted-foreground">{nodeType.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center - Flow Canvas */}
        <div className="flex-1 bg-background p-6 overflow-y-auto">
          {/* Trigger Card */}
          <Card className="bg-card border-border mb-4 max-w-md mx-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-base">Trigger</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword">Keyword Match</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="schedule">Scheduled</SelectItem>
                  <SelectItem value="contact_event">Contact Event</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>

              {triggerType === "keyword" && (
                <Input
                  placeholder="Enter trigger keywords (comma separated)"
                  value={triggerConfig.keywords || ""}
                  onChange={(e) =>
                    setTriggerConfig({ ...triggerConfig, keywords: e.target.value })
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Flow Nodes */}
          <div className="space-y-4 max-w-md mx-auto">
            {nodes.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Add nodes from the left panel to build your flow
                </p>
              </div>
            ) : (
              nodes.map((node, index) => {
                const nodeType = nodeTypes.find((t) => t.type === node.type)
                const Icon = nodeType?.icon || Zap

                return (
                  <div key={node.id}>
                    {/* Connector Line */}
                    {index > 0 && (
                      <div className="flex justify-center py-2">
                        <div className="w-0.5 h-6 bg-border" />
                      </div>
                    )}
                    {index === 0 && (
                      <div className="flex justify-center py-2">
                        <div className="w-0.5 h-6 bg-border" />
                      </div>
                    )}

                    <Card
                      className={cn(
                        "bg-card border-border cursor-pointer transition-colors",
                        selectedNodeId === node.id && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedNodeId(node.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <div className={cn("p-2 rounded-lg", nodeType?.color)}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {nodeType?.label}
                              </p>
                              {node.type === "message" && node.data.content && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {node.data.content as string}
                                </p>
                              )}
                              {node.type === "delay" && node.data.duration && (
                                <p className="text-xs text-muted-foreground">
                                  Wait {node.data.duration as string} {node.data.unit as string}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNode(node.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })
            )}

            {/* Add Node Button */}
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-muted-foreground bg-transparent"
                onClick={() => addNode("message")}
              >
                <Plus className="w-4 h-4" />
                Add Step
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Node Settings */}
        <div className="w-80 border-l border-border bg-card p-4 overflow-y-auto">
          {selectedNode ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Node Settings</h3>
              </div>

              {selectedNode.type === "message" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Message Content
                    </label>
                    <Textarea
                      placeholder="Enter your message..."
                      value={(selectedNode.data.content as string) || ""}
                      onChange={(e) => updateNode(selectedNode.id, { content: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Message Type
                    </label>
                    <Select
                      value={(selectedNode.data.messageType as string) || "text"}
                      onValueChange={(value) => updateNode(selectedNode.id, { messageType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                        <SelectItem value="interactive">Interactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {selectedNode.type === "delay" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Duration</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="5"
                        value={(selectedNode.data.duration as string) || ""}
                        onChange={(e) => updateNode(selectedNode.id, { duration: e.target.value })}
                        className="flex-1"
                      />
                      <Select
                        value={(selectedNode.data.unit as string) || "minutes"}
                        onValueChange={(value) => updateNode(selectedNode.id, { unit: value })}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seconds">Seconds</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {selectedNode.type === "condition" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Condition Type
                    </label>
                    <Select
                      value={(selectedNode.data.conditionType as string) || "message_contains"}
                      onValueChange={(value) =>
                        updateNode(selectedNode.id, { conditionType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="message_contains">Message Contains</SelectItem>
                        <SelectItem value="contact_tag">Contact Has Tag</SelectItem>
                        <SelectItem value="time_of_day">Time of Day</SelectItem>
                        <SelectItem value="custom">Custom Expression</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Value</label>
                    <Input
                      placeholder="Enter condition value..."
                      value={(selectedNode.data.conditionValue as string) || ""}
                      onChange={(e) =>
                        updateNode(selectedNode.id, { conditionValue: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === "ai_response" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      AI Instructions
                    </label>
                    <Textarea
                      placeholder="Instructions for the AI..."
                      value={(selectedNode.data.instructions as string) || ""}
                      onChange={(e) =>
                        updateNode(selectedNode.id, { instructions: e.target.value })
                      }
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Tone</label>
                    <Select
                      value={(selectedNode.data.tone as string) || "professional"}
                      onValueChange={(value) => updateNode(selectedNode.id, { tone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {selectedNode.type === "action" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Action Type
                    </label>
                    <Select
                      value={(selectedNode.data.actionType as string) || "add_tag"}
                      onValueChange={(value) => updateNode(selectedNode.id, { actionType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add_tag">Add Tag</SelectItem>
                        <SelectItem value="remove_tag">Remove Tag</SelectItem>
                        <SelectItem value="assign_agent">Assign to Agent</SelectItem>
                        <SelectItem value="webhook">Call Webhook</SelectItem>
                        <SelectItem value="update_contact">Update Contact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Value</label>
                    <Input
                      placeholder="Enter action value..."
                      value={(selectedNode.data.actionValue as string) || ""}
                      onChange={(e) =>
                        updateNode(selectedNode.id, { actionValue: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Settings className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Select a node to configure its settings
              </p>
            </div>
          )}

          {/* Flow Description */}
          <div className="mt-6 pt-6 border-t border-border">
            <label className="text-sm text-muted-foreground mb-1.5 block">Flow Description</label>
            <Textarea
              placeholder="Describe what this flow does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
