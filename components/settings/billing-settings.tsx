"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Check,
  Zap,
  Building2,
  Rocket,
  MessageSquare,
  Users,
  Bot,
  BarChart3,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  limits: {
    messages: number;
    contacts: number;
    agents: number;
    flows: number;
  };
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    description: "Perfect for small businesses getting started",
    features: [
      "1,000 messages/month",
      "500 contacts",
      "2 team members",
      "5 automation flows",
      "Basic analytics",
      "Email support",
    ],
    limits: {
      messages: 1000,
      contacts: 500,
      agents: 2,
      flows: 5,
    },
  },
  {
    id: "professional",
    name: "Professional",
    price: 149,
    description: "For growing teams that need more power",
    features: [
      "10,000 messages/month",
      "5,000 contacts",
      "10 team members",
      "Unlimited flows",
      "Advanced analytics",
      "AI-powered replies",
      "Priority support",
    ],
    limits: {
      messages: 10000,
      contacts: 5000,
      agents: 10,
      flows: -1,
    },
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 499,
    description: "For large organizations with custom needs",
    features: [
      "Unlimited messages",
      "Unlimited contacts",
      "Unlimited team members",
      "Unlimited flows",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "SSO/SAML",
    ],
    limits: {
      messages: -1,
      contacts: -1,
      agents: -1,
      flows: -1,
    },
  },
];

export function BillingSettings() {
  const [currentPlan] = useState("professional");
  const [usage] = useState({
    messages: 7234,
    contacts: 2891,
    agents: 4,
  });

  const activePlan = plans.find((p) => p.id === currentPlan)!;

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return "Unlimited";
    return limit.toLocaleString();
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>
                You are currently on the {activePlan.name} plan
              </CardDescription>
            </div>
            <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
              {activePlan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Messages</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {usage.messages.toLocaleString()} / {formatLimit(activePlan.limits.messages)}
                </span>
              </div>
              <Progress
                value={getUsagePercentage(usage.messages, activePlan.limits.messages)}
                className="h-2"
              />
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Contacts</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {usage.contacts.toLocaleString()} / {formatLimit(activePlan.limits.contacts)}
                </span>
              </div>
              <Progress
                value={getUsagePercentage(usage.contacts, activePlan.limits.contacts)}
                className="h-2"
              />
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Team Members</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {usage.agents} / {formatLimit(activePlan.limits.agents)}
                </span>
              </div>
              <Progress
                value={getUsagePercentage(usage.agents, activePlan.limits.agents)}
                className="h-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
            <div>
              <p className="font-medium text-foreground">Next billing date</p>
              <p className="text-sm text-muted-foreground">February 1, 2026</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">${activePlan.price}</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="h-5 w-5" />
            Available Plans
          </CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrentPlan = plan.id === currentPlan;
              const PlanIcon =
                plan.id === "starter"
                  ? Building2
                  : plan.id === "professional"
                  ? Zap
                  : Rocket;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-lg border p-6 ${
                    plan.popular
                      ? "border-primary bg-primary/5"
                      : "border-border bg-secondary/30"
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          plan.popular ? "bg-primary/10" : "bg-secondary"
                        }`}
                      >
                        <PlanIcon
                          className={`h-5 w-5 ${
                            plan.popular ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={isCurrentPlan ? "outline" : plan.popular ? "default" : "outline"}
                      disabled={isCurrentPlan}
                      className={isCurrentPlan ? "border-border" : ""}
                    >
                      {isCurrentPlan ? (
                        "Current Plan"
                      ) : (
                        <>
                          {plan.price > activePlan.price ? "Upgrade" : "Downgrade"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            View your past invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-border">
            {[
              { date: "Jan 1, 2026", amount: 149, status: "Paid" },
              { date: "Dec 1, 2025", amount: 149, status: "Paid" },
              { date: "Nov 1, 2025", amount: 149, status: "Paid" },
              { date: "Oct 1, 2025", amount: 49, status: "Paid" },
            ].map((invoice, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-foreground">{invoice.date}</p>
                  <p className="text-sm text-muted-foreground">Professional Plan</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="border-primary/50 text-primary bg-primary/10"
                  >
                    {invoice.status}
                  </Badge>
                  <span className="font-medium text-foreground">${invoice.amount}</span>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
