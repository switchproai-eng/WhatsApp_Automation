import Link from "next/link";
import Image from "next/image";
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
  Target,
  TrendingUp,
  Clock,
  Headphones,
  Languages,
  RefreshCw,
  Calendar,
  Megaphone,
  ChevronDown,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const features = [
  {
    icon: Bot,
    title: "AI-Powered WhatsApp Conversations",
    description:
      "Respond instantly to customer inquiries with intelligent, context-aware AI that understands intent and delivers relevant responses.",
  },
  {
    icon: Target,
    title: "Meta Ads Campaign Creation",
    description:
      "Create and manage Facebook and Instagram ad campaigns that send leads directly to WhatsApp conversations.",
  },
  {
    icon: Users,
    title: "Automated Lead Capture",
    description:
      "Capture leads from Meta Ads, website forms, and WhatsApp entry points automatically without manual intervention.",
  },
  {
    icon: TrendingUp,
    title: "AI Lead Qualification & Routing",
    description:
      "Ask qualifying questions, score leads, and route high-intent prospects to sales teams instantly.",
  },
  {
    icon: Zap,
    title: "Custom Chatbot Workflows",
    description:
      "Build structured conversation flows for FAQs, sales, onboarding, and support without coding.",
  },
  {
    icon: Headphones,
    title: "Human & AI Collaboration",
    description:
      "Seamlessly transfer conversations from AI to human agents when personal touch is needed.",
  },
  {
    icon: Languages,
    title: "Multi-Language Support",
    description:
      "Engage customers in multiple languages automatically with intelligent language detection.",
  },
  {
    icon: RefreshCw,
    title: "CRM & System Integrations",
    description:
      "Sync conversations and leads with CRMs, databases, and internal tools seamlessly.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Conversion Tracking",
    description:
      "Track ad performance, lead quality, conversion rates, and customer engagement in real time.",
  },
  {
    icon: Clock,
    title: "Automated Follow-Ups",
    description:
      "Trigger WhatsApp messages, reminders, offers, and follow-ups to increase conversion rates.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant Infrastructure",
    description:
      "Enterprise-grade security and data protection standards to keep your data safe.",
  },
  {
    icon: Globe,
    title: "Built as a Global-First Platform",
    description:
      "Scalable infrastructure, multilingual AI, and high-volume message handling for businesses worldwide.",
  },
];

const useCases = [
  {
    icon: Target,
    title: "Lead Generation & Sales Automation",
    description: "Convert Meta Ads traffic into qualified WhatsApp leads and customers automatically.",
  },
  {
    icon: Headphones,
    title: "Customer Support Automation",
    description: "Handle FAQs, order tracking, troubleshooting, and post-sales support effortlessly.",
  },
  {
    icon: Megaphone,
    title: "E-commerce & Retail",
    description: "Drive product discovery, promotions, payments, and order updates through WhatsApp.",
  },
  {
    icon: Calendar,
    title: "Appointments & Bookings",
    description: "Automate bookings, confirmations, and reminders for service-based businesses.",
  },
];

const benefits = [
  "End-to-end automation from ads to conversion",
  "Faster response times and higher lead engagement",
  "Reduced customer service and sales costs",
  "Improved conversion and retention rates",
  "Scalable AI infrastructure",
  "Full control over customer data and workflows",
];

const faqs = [
  {
    question: "Can I run Meta Ads directly from SwitchPro?",
    answer: "Yes. SwitchPro allows you to create and manage Meta Ads that connect directly to WhatsApp conversations, streamlining your entire ad-to-conversation workflow.",
  },
  {
    question: "Does the AI qualify and score leads automatically?",
    answer: "Yes. Leads are qualified based on your custom criteria before being routed or followed up. The AI asks qualifying questions and scores leads to prioritize high-intent prospects.",
  },
  {
    question: "Can I track conversions from ads to WhatsApp?",
    answer: "Yes. Track campaign performance, lead quality, and conversion metrics in one unified dashboard with real-time analytics.",
  },
  {
    question: "Can I combine AI and human agents?",
    answer: "Yes. Conversations can be handed over to human agents at any time. The system seamlessly transfers context so agents can continue conversations naturally.",
  },
  {
    question: "Is customer data secure?",
    answer: "Yes. SwitchPro follows strict data security and compliance standards with enterprise-grade encryption and protection.",
  },
];

const steps = [
  {
    number: "01",
    title: "Launch Meta Ads",
    description: "Create Facebook and Instagram campaigns that direct users to WhatsApp conversations.",
  },
  {
    number: "02",
    title: "Capture & Qualify Leads",
    description: "AI engages leads instantly, asks qualifying questions, and collects customer information.",
  },
  {
    number: "03",
    title: "Convert Through WhatsApp",
    description: "AI nurtures prospects, answers objections, schedules calls, or hands over to sales teams.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/images/Frame 1.png"
                alt="WhatsFlow Logo"
                width={1400}
                height={700}
                className="h-20 w-auto object-contain"
              />
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                How It Works
              </a>
              <a href="#use-cases" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Use Cases
              </a>
              <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                FAQ
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 mb-6">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">
                  WhatsApp Business API Partner
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                AI-Powered WhatsApp Conversations That <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Convert Leads Into Customers</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                SwitchPro WhatsApp Chat Agent enables businesses to automate customer conversations,
                run Meta ad campaigns, capture leads, and convert them into paying customers using
                AI-powered WhatsApp automation. Manage the full customer journey from ad click to WhatsApp conversation to conversion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8 h-14 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300">
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/images/hero-dashboard.png"
                alt="WhatsApp Business Dashboard"
                width={600}
                height={400}
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Benefits */}
      <section id="benefits" className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SwitchPro
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Transform your customer engagement with cutting-edge AI technology</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: Globe,
                title: "Built as a Global-First Platform",
                description: "Scalable infrastructure, multilingual AI, and high-volume message handling."
              },
              {
                icon: TrendingUp,
                title: "AI That Goes Beyond Support",
                description: "Combines WhatsApp AI with Meta Ads integration to drive revenue."
              },
              {
                icon: BarChart3,
                title: "Reduce Costs, Increase Conversions",
                description: "Automate lead qualification, follow-ups, and sales conversations."
              },
              {
                icon: Clock,
                title: "Always-On Sales and Support",
                description: "Engage prospects and customers 24/7, even when your team is offline."
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="group text-center p-6 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mx-auto mb-5">
                    <Icon className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to automate WhatsApp conversations, capture leads, and convert customers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-6 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-5">
                    <Icon className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-20 md:py-32 border-y border-white/10 bg-white/5 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Three simple steps to transform your WhatsApp into a lead generation and conversion machine.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2">
                  <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-white/70">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 right-0 translate-x-1/2 group-hover:translate-x-1/3 transition-transform duration-300">
                    <ArrowRight className="h-8 w-8 text-purple-400/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Use Cases
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              SwitchPro adapts to your business needs across various industries and use cases.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 transition-colors shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 flex-shrink-0">
                      <Icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                      <p className="text-gray-600">{useCase.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Businesses Choose SwitchPro */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Businesses Choose SwitchPro
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg mb-4 bg-white">
                  <AccordionTrigger className="text-left text-gray-900 hover:text-indigo-600 px-4 py-3">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 px-4 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center p-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Turning Conversations Into Revenue
            </h2>
            <p className="text-lg text-white/80 mb-4">
              SwitchPro WhatsApp Chat Agent
            </p>
            <p className="text-xl text-white mb-8 font-medium">
              Run ads. Capture leads. Convert customers. Automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 h-14 bg-white text-indigo-600 hover:bg-gray-100">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-white text-white hover:bg-white hover:text-indigo-600">
                Book a Demo
              </Button>
            </div>
            <p className="text-sm text-white/70 mt-6">
              Custom pricing available based on ad volume, automation complexity, and integrations.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <a href="#" className="text-sm text-white/80 hover:underline">Compare Plans</a>
              <span className="text-white/60">|</span>
              <a href="#" className="text-sm text-white/80 hover:underline">Contact Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/Frame 1.png"
                alt="Company Logo"
                width={250}
                height={70}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-gray-600">
              2026 SwitchPro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
