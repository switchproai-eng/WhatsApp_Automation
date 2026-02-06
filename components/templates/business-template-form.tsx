"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Facebook, Instagram, Twitter, Linkedin, Globe, Save } from "lucide-react";
import Image from "next/image";

interface BusinessTemplateFormProps {
  initialData?: BusinessTemplateData;
  onSave: (data: BusinessTemplateData) => void;
  isSaving?: boolean;
}

export interface BusinessTemplateData {
  id?: string;
  name: string;
  businessName: string;
  businessLogo?: string;
  businessLogoFile?: File;
  description: string;
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  welcomeMessage?: string;
  greetingMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function BusinessTemplateForm({ 
  initialData = {
    name: "",
    businessName: "",
    description: "",
    websiteUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    linkedinUrl: "",
    email: "",
    phone: "",
    address: ""
  }, 
  onSave, 
  isSaving = false 
}: BusinessTemplateFormProps) {
  const [formData, setFormData] = useState<BusinessTemplateData>(initialData);
  const [previewImage, setPreviewImage] = useState<string | null>(initialData.businessLogo || null);

  const handleChange = (field: keyof BusinessTemplateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Set the file for later upload
      setFormData(prev => ({
        ...prev,
        businessLogoFile: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    
    if (!formData.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }
    
    // Prepare the data to save
    const dataToSave: BusinessTemplateData = {
      ...formData,
      businessLogoFile: formData.businessLogoFile // Include the file for upload processing
    };
    
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Add your business details to the template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name *</Label>
            <Input
              id="templateName"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter template name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              placeholder="Enter business name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logoUpload">Business Logo</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Business logo preview"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-xs text-center">No logo</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo</span>
                  </div>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, or SVG. Max 5MB.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your business..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Add your contact details to the template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@business.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Business address"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.websiteUrl || ''}
              onChange={(e) => handleChange('websiteUrl', e.target.value)}
              placeholder="https://www.business.com"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Welcome Messages</CardTitle>
          <CardDescription>Configure messages that appear when users contact your agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Textarea
              id="welcomeMessage"
              value={formData.welcomeMessage || ''}
              onChange={(e) => handleChange('welcomeMessage', e.target.value)}
              placeholder="Welcome! How can I help you today?"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent when a user first contacts your agent
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="greetingMessage">Greeting Message</Label>
            <Textarea
              id="greetingMessage"
              value={formData.greetingMessage || ''}
              onChange={(e) => handleChange('greetingMessage', e.target.value)}
              placeholder="Hello! I'm your AI assistant. How can I assist you?"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent as a greeting when users interact with your agent
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>Add your social media profiles to the template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <Facebook className="w-4 h-4" />
              Facebook
            </Label>
            <Input
              id="facebook"
              type="url"
              value={formData.facebookUrl || ''}
              onChange={(e) => handleChange('facebookUrl', e.target.value)}
              placeholder="https://facebook.com/yourbusiness"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              Instagram
            </Label>
            <Input
              id="instagram"
              type="url"
              value={formData.instagramUrl || ''}
              onChange={(e) => handleChange('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/yourbusiness"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              Twitter
            </Label>
            <Input
              id="twitter"
              type="url"
              value={formData.twitterUrl || ''}
              onChange={(e) => handleChange('twitterUrl', e.target.value)}
              placeholder="https://twitter.com/yourbusiness"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              type="url"
              value={formData.linkedinUrl || ''}
              onChange={(e) => handleChange('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/company/yourbusiness"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Template"}
        </Button>
      </div>
    </form>
  );
}