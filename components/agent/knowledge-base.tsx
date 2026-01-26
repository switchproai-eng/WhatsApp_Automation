"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  HelpCircle,
  Package,
  FileText,
  Upload,
  Plus,
  Trash2,
  Save,
  Edit,
  X,
  Check,
  StickyNote,
} from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
}

interface Product {
  id: string
  name: string
  description: string
  price: string
  features: string[]
}

interface Document {
  id: string
  name: string
  type: string
  uploadedAt: string
}

export function KnowledgeBase({ agentId, initialConfig = {}, onUpdate }: { agentId?: string; initialConfig?: any; onUpdate?: (updatedConfig: any) => void }) {
  const [faqs, setFaqs] = useState<FAQ[]>(
    initialConfig.faqs || [
      {
        id: "1",
        question: "What are your business hours?",
        answer: "We're open Monday to Friday, 9 AM to 6 PM.",
      },
      {
        id: "2",
        question: "How can I track my order?",
        answer: "You can track your order using the tracking link sent to your email.",
      },
    ]
  )
  const [products, setProducts] = useState<Product[]>(
    initialConfig.products || [
      {
        id: "1",
        name: "Basic Plan",
        description: "Perfect for small businesses",
        price: "$29/mo",
        features: ["500 messages/mo", "1 agent", "Email support"],
      },
    ]
  )
  const [documents, setDocuments] = useState<Document[]>(initialConfig.documents || [])
  const [policies, setPolicies] = useState(initialConfig.policies || "")
  const [customNotes, setCustomNotes] = useState(initialConfig.customNotes || "")
  const [editingFaq, setEditingFaq] = useState<string | null>(null)
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" })
  const [showAddFaq, setShowAddFaq] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    features: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const addFaq = () => {
    if (newFaq.question && newFaq.answer) {
      setFaqs([...faqs, { id: Date.now().toString(), ...newFaq }])
      setNewFaq({ question: "", answer: "" })
      setShowAddFaq(false)
    }
  }

  const deleteFaq = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id))
  }

  const updateFaq = (id: string, data: Partial<FAQ>) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, ...data } : f)))
  }

  const addProduct = () => {
    if (newProduct.name) {
      setProducts([
        ...products,
        {
          id: Date.now().toString(),
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          features: newProduct.features.split(",").map((f) => f.trim()),
        },
      ])
      setNewProduct({ name: "", description: "", price: "", features: "" })
      setShowAddProduct(false)
    }
  }

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newDocs: Document[] = Array.from(files).map((file) => ({
        id: Date.now().toString() + file.name,
        name: file.name,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      }))
      setDocuments([...documents, ...newDocs])
    }
  }

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id))
  }

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
            config: {
              ...agentData.agent.config,
              knowledge: { faqs, products, documents, policies, customNotes }
            },
            is_default: agentData.agent.is_default
          }),
        })

        if (response.ok) {
          toast.success("Knowledge base saved successfully!")
          // Update parent component's state
          if (onUpdate) {
            onUpdate({ faqs, products, documents, policies, customNotes });
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to save knowledge base:", errorText);
          toast.error("Failed to save knowledge base. Please try again.");
        }
      } else {
        // Use the old endpoint for backward compatibility
        const response = await fetch("/api/agent/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: "knowledge",
            data: { faqs, products, documents, policies, customNotes },
          }),
        })

        if (response.ok) {
          toast.success("Knowledge base saved successfully!")
          // Update parent component's state
          if (onUpdate) {
            onUpdate({ faqs, products, documents, policies, customNotes });
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to save knowledge base:", errorText);
          toast.error("Failed to save knowledge base. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error saving knowledge base:", error);
      toast.error("An error occurred while saving the knowledge base.");
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* FAQs */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>FAQs</CardTitle>
                <CardDescription>Common questions and answers for the AI to use</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddFaq(true)}
              className="gap-2 bg-transparent"
            >
              <Plus className="w-4 h-4" />
              Add FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showAddFaq && (
            <div className="p-4 rounded-lg border border-primary/50 bg-primary/5 space-y-3">
              <Input
                placeholder="Question"
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
              />
              <Textarea
                placeholder="Answer"
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddFaq(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={addFaq}>
                  Add
                </Button>
              </div>
            </div>
          )}

          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
            >
              {editingFaq === faq.id ? (
                <div className="space-y-3">
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFaq(faq.id, { question: e.target.value })}
                  />
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(faq.id, { answer: e.target.value })}
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingFaq(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingFaq(null)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{faq.question}</p>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingFaq(faq.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteFaq(faq.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {faqs.length === 0 && !showAddFaq && (
            <div className="text-center py-8 text-muted-foreground">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No FAQs added yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products/Services */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <Package className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <CardTitle>Products & Services</CardTitle>
                <CardDescription>Information about what you offer</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddProduct(true)}
              className="gap-2 bg-transparent"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showAddProduct && (
            <div className="p-4 rounded-lg border border-primary/50 bg-primary/5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Product name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <Input
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                rows={2}
              />
              <Input
                placeholder="Features (comma separated)"
                value={newProduct.features}
                onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddProduct(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={addProduct}>
                  Add
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm font-semibold text-primary">{product.price}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteProduct(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                <div className="flex flex-wrap gap-1">
                  {product.features.map((feature, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && !showAddProduct && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No products added yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <FileText className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Upload files for the AI to reference</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop files or click to upload
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Supports PDF, DOCX, TXT (max 10MB each)
            </p>
            <Input
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              className="hidden"
              id="document-upload"
              onChange={handleFileUpload}
            />
            <Button variant="outline" asChild className="bg-transparent">
              <label htmlFor="document-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
          </div>

          {documents.length > 0 && (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteDocument(doc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Policies */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-4/10">
              <FileText className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <CardTitle>Policies</CardTitle>
              <CardDescription>Return, refund, and other policies</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your business policies here (return policy, refund policy, shipping info, etc.)"
            value={policies}
            onChange={(e) => setPolicies(e.target.value)}
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Custom Notes */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-5/10">
              <StickyNote className="w-5 h-5 text-chart-5" />
            </div>
            <div>
              <CardTitle>Custom Notes</CardTitle>
              <CardDescription>Additional context for the AI</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any additional information the AI should know..."
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Knowledge Base"}
        </Button>
      </div>
    </div>
  )
}
