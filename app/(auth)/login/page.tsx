import { LoginForm } from "@/components/auth/login-form"
import { getCurrentUser } from "../../../lib/auth"
import { redirect } from "next/navigation"
import { MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect("/dashboard")
  }

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
            Automate Your WhatsApp Business Communications
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Build powerful chatbots, manage conversations, and grow your business 
            with AI-powered WhatsApp automation.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <div className="text-3xl font-bold">10M+</div>
              <div className="text-primary-foreground/70 text-sm">Messages Sent</div>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <div className="text-3xl font-bold">5,000+</div>
              <div className="text-primary-foreground/70 text-sm">Active Users</div>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">WhatsFlow</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to your account to continue
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
