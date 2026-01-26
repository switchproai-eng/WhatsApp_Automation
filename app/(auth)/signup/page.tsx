import { SignupForm } from "@/components/auth/signup-form"
import { getCurrentUser } from "../../../lib/auth"
import { redirect } from "next/navigation"
import { MessageSquare, Check } from "lucide-react"
import Link from "next/link"

export default async function SignupPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect("/dashboard")
  }

  const features = [
    "Unlimited conversations",
    "AI-powered chatbots",
    "Visual flow builder",
    "Team collaboration",
    "Analytics & insights",
    "24/7 support",
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <MessageSquare className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold">WhatsFlow</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-balance">
            Start Your Free Trial Today
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md mb-8">
            Get started with WhatsFlow and transform how you communicate with 
            your customers.
          </p>
          
          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">WhatsFlow</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
            <p className="text-muted-foreground mt-2">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
