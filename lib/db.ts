import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function query<T>(
  queryText: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await sql.query(queryText, params)
  return result.rows as T[]
}

export async function queryOne<T>(
  queryText: string,
  params: unknown[] = []
): Promise<T | null> {
  const result = await query<T>(queryText, params)
  return result[0] || null
}

export { sql }
