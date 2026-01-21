import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Bot,
  Users,
  Zap,
  BarChart3,
  Shield,
  ArrowRight,
  Check,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Unified Inbox",
    description:
      "Manage all WhatsApp conversations in one place with real-time sync and team collaboration.",
  },
  {
    icon: Bot,
    title: "AI-Powered Automation",
    description:
      "Build intelligent chatbots and automation flows with our visual flow builder.",
  },
  {
    icon: Users,
    title: "Contact Management",
    description:
      "Organize contacts with tags, segments, and custom fields for targeted messaging.",
  },
  {
    icon: Zap,
    title: "Broadcast Campaigns",
    description:
      "Send personalized bulk messages with templates, scheduling, and analytics.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Track message delivery, agent performance, and customer engagement metrics.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-grade encryption, role-based access, and compliance with data regulations.",
  },
];

const plans = [
  {
    name: "Starter",
    price: 49,
    description: "For small businesses getting started",
    features: [
      "1,000 messages/month",
      "500 contacts",
      "2 team members",
      "Basic automation",
    ],
  },
  {
    name: "Professional",
    price: 149,
    description: "For growing teams that need more",
    features: [
      "10,000 messages/month",
      "5,000 contacts",
      "10 team members",
      "AI-powered replies",
      "Advanced analytics",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 499,
    description: "For large organizations",
    features: [
      "Unlimited messages",
      "Unlimited contacts",
      "Unlimited team members",
      "Custom integrations",
      "Dedicated support",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">WhatsFlow</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-foreground">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Official WhatsApp Business API Partner
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Automate Your WhatsApp Business at Scale
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty">
              The all-in-one platform for WhatsApp marketing, sales, and support.
              Build chatbots, send campaigns, and manage conversations with AI-powered automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 h-14">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-border bg-transparent">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10M+", label: "Messages Sent" },
              { value: "5,000+", label: "Active Businesses" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "150+", label: "Countries" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for WhatsApp Success
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features to automate conversations, engage customers, and grow your business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-xl border ${
                  plan.popular
                    ? "bg-primary/5 border-primary"
                    : "bg-card border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center p-12 rounded-2xl bg-primary/10 border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your WhatsApp Business?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using WhatsFlow to automate conversations and grow revenue.
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 h-14">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">WhatsFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2026 WhatsFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
