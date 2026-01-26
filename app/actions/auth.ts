"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { signIn, signUp } from "../lib/auth"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const result = await signIn(email, password)

  if (!result) {
    return { error: "Invalid email or password" }
  }

  const cookieStore = await cookies()
  cookieStore.set("auth_token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  redirect("/dashboard")
}

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const companyName = formData.get("companyName") as string

  if (!email || !password || !name || !companyName) {
    return { error: "All fields are required" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  try {
    const result = await signUp(email, password, name, companyName)

    const cookieStore = await cookies()
    cookieStore.set("auth_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    redirect("/dashboard")
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) {
      return { error: "An account with this email already exists" }
    }
    throw error
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
  redirect("/login")
}
