import { cookies } from "next/headers"
import { query, queryOne } from "./db"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
)

export interface User {
  id: string
  tenant_id: string
  email: string
  name: string
  role: string
  avatar_url: string | null
}

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: string
  whatsapp_phone_number_id: string | null
  whatsapp_business_account_id: string | null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  const user = await queryOne<User>(
    `SELECT id, tenant_id, email, name, role, avatar_url 
     FROM users WHERE id = $1`,
    [payload.userId]
  )

  return user
}

export async function getCurrentTenant(): Promise<Tenant | null> {
  const user = await getCurrentUser()
  if (!user) return null

  // Get tenant info with associated WhatsApp account details if available
  const result = await queryOne<{
    id: string,
    name: string,
    slug: string,
    plan: string,
    temp_phone_number_id?: string,
    temp_waba_id?: string
  }>(
    `SELECT t.id, t.name, t.slug, t.plan, wa.phone_number_id as temp_phone_number_id, wa.waba_id as temp_waba_id
     FROM tenants t
     LEFT JOIN whatsapp_accounts wa ON t.id = wa.tenant_id
     WHERE t.id = $1
     LIMIT 1`,
    [user.tenant_id]
  )

  if (!result) return null

  // Construct the tenant object with the WhatsApp account info
  const tenant: Tenant = {
    id: result.id,
    name: result.name,
    slug: result.slug,
    plan: result.plan,
    whatsapp_phone_number_id: result.temp_phone_number_id || null,
    whatsapp_business_account_id: result.temp_waba_id || null
  }

  return tenant
}

export async function requireAuth(): Promise<{ user: User; tenant: Tenant }> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  const tenant = await getCurrentTenant()
  if (!tenant) {
    throw new Error("Tenant not found")
  }

  return { user, tenant }
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  tenantName: string
): Promise<{ user: User; token: string }> {
  // Check if user already exists
  const existingUser = await queryOne<{ id: string }>(
    `SELECT id FROM users WHERE email = $1`,
    [email]
  )
  if (existingUser) {
    throw new Error("An account with this email already exists")
  }

  const hashedPassword = await hashPassword(password)
  const baseSlug = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  
  // Generate unique slug
  let slug = baseSlug
  let counter = 0
  while (true) {
    const existingTenant = await queryOne<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1`,
      [slug]
    )
    if (!existingTenant) break
    counter++
    slug = `${baseSlug}-${counter}`
  }

  // Create tenant
  const tenantResult = await query<{ id: string }>(
    `INSERT INTO tenants (name, slug, plan) 
     VALUES ($1, $2, 'free') 
     RETURNING id`,
    [tenantName, slug]
  )
  const tenantId = tenantResult[0].id

  // Create user
  const userResult = await query<User>(
    `INSERT INTO users (tenant_id, email, password_hash, name, role) 
     VALUES ($1, $2, $3, $4, 'admin') 
     RETURNING id, tenant_id, email, name, role, avatar_url`,
    [tenantId, email, hashedPassword, name]
  )
  const user = userResult[0]

  const token = await createToken(user.id)

  return { user, token }
}

export interface Session {
  userId: string
  tenantId: string
  role: string
}

export async function verifySession(
  request: Request
): Promise<Session | null> {
  // Try to get token from Authorization header first
  const authHeader = request.headers.get("Authorization")
  let token: string | null = null

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7)
  } else {
    // Try to get from cookies
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        acc[key] = value
        return acc
      }, {} as Record<string, string>)
      token = cookies["auth_token"]
    }
  }

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  const user = await queryOne<{ id: string; tenant_id: string; role: string }>(
    `SELECT id, tenant_id, role FROM users WHERE id = $1`,
    [payload.userId]
  )

  if (!user) return null

  return {
    userId: user.id,
    tenantId: user.tenant_id,
    role: user.role,
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  const userWithPassword = await queryOne<User & { password_hash: string }>(
    `SELECT id, tenant_id, email, name, role, avatar_url, password_hash 
     FROM users WHERE email = $1`,
    [email]
  )

  if (!userWithPassword) return null

  const isValid = await verifyPassword(password, userWithPassword.password_hash)
  if (!isValid) return null

  const { password_hash, ...user } = userWithPassword
  const token = await createToken(user.id)

  return { user, token }
}
