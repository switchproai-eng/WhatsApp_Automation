"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Mail,
  MessageSquare,
  FileText,
  Shield,
  ExternalLink,
  Phone,
  Building2,
  Zap,
  Users,
  Bot,
  Settings,
} from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "How do I connect my WhatsApp Business account?",
    answer: "Go to Settings → WhatsApp Settings and click 'Connect with WhatsApp'. Follow the prompts to authorize your WhatsApp Business account. You'll need a Meta Business account with WhatsApp Business API access.",
  },
  {
    question: "How do I create an AI agent?",
    answer: "Navigate to the Agents page and click 'Create Agent'. Configure your agent's name, personality, business description, and response settings. You can customize the AI's tone, goals, and constraints to match your brand.",
  },
  {
    question: "Why isn't my agent responding to messages?",
    answer: "Make sure: 1) Your WhatsApp account is properly connected in Settings, 2) Your agent has auto-reply enabled, 3) The agent is set as default or assigned to the correct phone number, 4) Your webhook is properly configured in Meta Developer Console.",
  },
  {
    question: "How do I set up webhooks?",
    answer: "In your Meta Developer Console, go to WhatsApp → Configuration → Webhook. Set the callback URL to your app's webhook endpoint (e.g., https://yourdomain.com/api/webhooks/whatsapp) and use the verify token from your WhatsApp Settings.",
  },
  {
    question: "Can I use multiple WhatsApp numbers?",
    answer: "Yes! Each WhatsApp Business account can be connected separately. You can assign different AI agents to different phone numbers to handle specific customer segments or business lines.",
  },
  {
    question: "How do I manage contacts?",
    answer: "The Contacts page shows all customers who have messaged you. You can add tags, view conversation history, and manage opt-in status. Contacts are automatically created when someone messages your WhatsApp number.",
  },
  {
    question: "What message types are supported?",
    answer: "We support text messages, images, documents, audio, video, location sharing, interactive buttons, and list messages. Template messages can be sent for marketing campaigns after Meta approval.",
  },
  {
    question: "How do I create message templates?",
    answer: "Go to the Templates page to create and manage message templates. Templates must be approved by Meta before use. Use templates for notifications, marketing, and transactional messages outside the 24-hour window.",
  },
];

const quickLinks = [
  {
    title: "Privacy Policy",
    description: "Learn how we handle your data",
    href: "/privacy-policy",
    icon: Shield,
  },
  {
    title: "Terms of Service",
    description: "Our service agreement",
    href: "/terms-of-service",
    icon: FileText,
  },
  {
    title: "WhatsApp Business API Docs",
    description: "Official Meta documentation",
    href: "https://developers.facebook.com/docs/whatsapp/cloud-api",
    icon: ExternalLink,
    external: true,
  },
];

const features = [
  {
    icon: Bot,
    title: "AI Agents",
    description: "Create intelligent chatbots that respond to customers 24/7",
  },
  {
    icon: MessageSquare,
    title: "Unified Inbox",
    description: "Manage all conversations from one dashboard",
  },
  {
    icon: Users,
    title: "Contact Management",
    description: "Organize and segment your customer base",
  },
  {
    icon: Zap,
    title: "Automation",
    description: "Set up flows and quick replies for efficiency",
  },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <HelpCircle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground">Get help with WhatsFlow</p>
        </div>
      </div>

      {/* Contact Support Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Building2 className="h-5 w-5" />
            Contact Support
          </CardTitle>
          <CardDescription>
            Need help? Our team is here to assist you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg flex-1">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email Support</p>
                <a
                  href="mailto:switchpro.ai@gmail.com"
                  className="text-foreground font-medium hover:text-primary transition-colors"
                >
                  switchpro.ai@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg flex-1">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="text-foreground font-medium">Switch Pro AI</p>
              </div>
            </div>
          </div>
          <Button asChild className="w-fit">
            <a href="mailto:switchpro.ai@gmail.com">
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5" />
            Platform Features
          </CardTitle>
          <CardDescription>
            Overview of what you can do with WhatsFlow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-2 p-4 rounded-lg bg-secondary/30 border border-border"
              >
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Find answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ExternalLink className="h-5 w-5" />
            Quick Links
          </CardTitle>
          <CardDescription>
            Useful resources and documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors"
              >
                <link.icon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground flex items-center gap-1">
                    {link.title}
                    {link.external && <ExternalLink className="h-3 w-3" />}
                  </h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
