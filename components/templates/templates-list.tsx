"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  FileText,
  Plus,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Building,
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { BusinessTemplateForm, BusinessTemplateData } from "./business-template-form";
import { BusinessTemplateDisplay } from "./business-template-display";

interface Template {
  id: string
  name: string
  category: string
  language: string
  status: string
  components: unknown
  created_at: string
  updated_at: string
}

interface BusinessTemplate {
  id: string;
  name: string;
  business_name: string;
  business_logo_url: string | null;
  description: string;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  welcome_message: string | null;
  greeting_message: string | null;
  created_at: string;
  updated_at: string;
}

interface TemplatesListProps {
  templates: Template[];
  businessTemplates: BusinessTemplate[];
  tenantId: string;
}

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/20 text-warning",
  approved: "bg-chart-1/20 text-chart-1",
  rejected: "bg-destructive/20 text-destructive",
}

const categoryLabels: Record<string, string> = {
  marketing: "Marketing",
  utility: "Utility",
  authentication: "Authentication",
}

export function TemplatesList({ templates, businessTemplates, tenantId }: TemplatesListProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [isCreatingBusiness, setIsCreatingBusiness] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Suppress unused variable warning
  void tenantId

  async function handleCreateTemplate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          category: formData.get("category"),
          language: formData.get("language"),
          bodyText: formData.get("bodyText"),
        }),
      })

      if (response.ok) {
        setIsCreating(false)
        router.refresh()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveBusinessTemplate = async (data: BusinessTemplateData) => {
    setIsSubmitting(true);
    try {
      // Prepare form data for submission
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'businessLogoFile') {
          formData.append(key, value.toString());
        }
      });

      // If there's a file to upload, handle it separately
      if (data.businessLogoFile) {
        formData.append('businessLogoFile', data.businessLogoFile);
      }

      const response = await fetch('/api/business-templates', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setIsCreatingBusiness(false);
        router.refresh(); // Refresh the page to show the new template
        toast.success(`Business template "${data.name}" saved successfully!`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save business template');
      }
    } catch (error) {
      console.error("Error saving business template:", error);
      toast.error("Error saving business template. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Message Templates</h1>
          <p className="text-muted-foreground">
            Create and manage WhatsApp message templates
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreatingBusiness} onOpenChange={setIsCreatingBusiness}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Building className="w-4 h-4" />
                Create Business Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Business Template</DialogTitle>
                <DialogDescription>
                  Create a template with your business information, logo, and social media links.
                </DialogDescription>
              </DialogHeader>
              <BusinessTemplateForm 
                onSave={handleSaveBusinessTemplate} 
                isSaving={isSubmitting}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Message Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Message Template</DialogTitle>
                <DialogDescription>
                  Create a new template for broadcast messages. Templates must be approved by WhatsApp.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="order_confirmation"
                    required
                    pattern="[a-z0-9_]+"
                    title="Only lowercase letters, numbers, and underscores"
                  />
                  <p className="text-xs text-muted-foreground">
                    Only lowercase letters, numbers, and underscores
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue="marketing">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="utility">Utility</SelectItem>
                        <SelectItem value="authentication">Authentication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select name="language" defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyText">Message Body</Label>
                  <Textarea
                    id="bodyText"
                    name="bodyText"
                    placeholder="Hello {{1}}, your order {{2}} has been confirmed!"
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {"Use {{1}}, {{2}}, etc. for dynamic variables"}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Template"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Business Templates Section */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Business Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businessTemplates.length > 0 ? (
            businessTemplates.map((template) => (
              <BusinessTemplateDisplay 
                key={template.id}
                template={{
                  id: template.id,
                  name: template.name,
                  businessName: template.business_name,
                  businessLogo: template.business_logo_url || undefined,
                  description: template.description,
                  websiteUrl: template.website_url || undefined,
                  facebookUrl: template.facebook_url || undefined,
                  instagramUrl: template.instagram_url || undefined,
                  twitterUrl: template.twitter_url || undefined,
                  linkedinUrl: template.linkedin_url || undefined,
                  email: template.email || undefined,
                  phone: template.phone || undefined,
                  address: template.address || undefined
                }}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Building className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No business templates yet</h3>
              <p className="text-gray-600 mb-4 max-w-sm">
                Create business templates with your logo and social media links.
              </p>
              <Button 
                onClick={() => setIsCreatingBusiness(true)} 
                variant="outline" 
                className="gap-2"
              >
                <Building className="w-4 h-4" />
                Create Business Template
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Message Templates Section */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">WhatsApp Message Templates</h2>
        {templates.length === 0 ? (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h3>
              <p className="text-gray-600 mb-4 max-w-sm">
                Create message templates to use in your broadcast campaigns.
              </p>
              <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              const StatusIcon = statusIcons[template.status] || Clock

              return (
                <Card key={template.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base text-gray-900">{template.name}</CardTitle>
                          <p className="text-xs text-gray-500 capitalize">
                            {categoryLabels[template.category]} • {template.language.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-gray-700">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-700">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-700">
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="flex items-center justify-between">
                      <Badge className={cn("capitalize gap-1 px-2 py-1", statusColors[template.status])}>
                        <StatusIcon className="w-3 h-3" />
                        {template.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(template.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
