import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { signUp } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, companyName } = body

    if (!email || !password || !name || !companyName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const result = await signUp(email, password, name, companyName)

    const cookieStore = await cookies()
    cookieStore.set("auth_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({ user: result.user })
  } catch (error) {
    console.error("Signup error:", error)
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
