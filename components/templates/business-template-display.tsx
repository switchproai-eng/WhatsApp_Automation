import { BusinessTemplateData } from "./business-template-form";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Linkedin, Globe, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";

interface BusinessTemplateDisplayProps {
  template: BusinessTemplateData;
  className?: string;
}

export function BusinessTemplateDisplay({ template, className }: BusinessTemplateDisplayProps) {
  const hasSocialLinks = 
    template.facebookUrl || 
    template.instagramUrl || 
    template.twitterUrl || 
    template.linkedinUrl;

  const hasContactInfo = 
    template.email || 
    template.phone || 
    template.address || 
    template.websiteUrl;

  const hasWelcomeMessage = 
    template.welcomeMessage || 
    template.greetingMessage;

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Business Logo Section */}
      {template.businessLogo && (
        <div className="p-6 pb-0">
          <div className="flex justify-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
              <Image
                src={template.businessLogo}
                alt={`${template.businessName} logo`}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      <CardHeader className="text-center pt-4 pb-2">
        <h3 className="text-xl font-bold">{template.businessName}</h3>
        {template.description && (
          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
        )}
      </CardHeader>

      <CardContent className="pb-4">
        {/* Welcome/Greeting Message Preview - WhatsApp-style */}
        {hasWelcomeMessage && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-green-800 mb-1">WhatsApp Welcome Message</h4>
                {template.welcomeMessage && (
                  <div className="text-sm text-green-700 bg-white p-2 rounded border border-green-200 mb-1">
                    {template.welcomeMessage}
                  </div>
                )}
                {template.greetingMessage && (
                  <div className="text-sm text-green-700 bg-white p-2 rounded border border-green-200">
                    {template.greetingMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        {hasContactInfo && (
          <div className="mb-4 space-y-2">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Contact Info</h4>
            
            <div className="space-y-1">
              {template.websiteUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <Link 
                    href={template.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {template.websiteUrl.replace(/^https?:\/\//, '')}
                  </Link>
                </div>
              )}
              
              {template.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <Link 
                    href={`mailto:${template.email}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {template.email}
                  </Link>
                </div>
              )}
              
              {template.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <Link 
                    href={`tel:${template.phone}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {template.phone}
                  </Link>
                </div>
              )}
              
              {template.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{template.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Media Links */}
        {hasSocialLinks && (
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">Follow Us</h4>
            <div className="flex gap-3">
              {template.facebookUrl && (
                <Link 
                  href={template.facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </Link>
              )}
              
              {template.instagramUrl && (
                <Link 
                  href={template.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </Link>
              )}
              
              {template.twitterUrl && (
                <Link 
                  href={template.twitterUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors"
                  title="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </Link>
              )}
              
              {template.linkedinUrl && (
                <Link 
                  href={template.linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-center pb-4">
        <span className="text-xs text-muted-foreground">
          {template.name ? `Template: ${template.name}` : 'Business Template'}
        </span>
      </CardFooter>
    </Card>
  );
}