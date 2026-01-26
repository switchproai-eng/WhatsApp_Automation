import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agents = await query<any[]>(`
      SELECT id, name, config, is_default, created_at, updated_at
      FROM ai_agents
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `, [session.tenantId]);

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Agents GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, config = {} } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const newAgent = await sql`
      INSERT INTO ai_agents (tenant_id, name, config, is_default)
      VALUES (${session.tenantId}, ${name}, ${config}::jsonb, false)
      RETURNING id
    `.then(r => r[0]);

    // Unset other defaults if this is default (but default false by now)
    if (config.is_default) {
      await sql`UPDATE ai_agents SET is_default = false WHERE tenant_id = ${session.tenantId} AND id != ${newAgent.id};`;
    }

    const agent = await queryOne<any>(`
      SELECT id, name, config, is_default, created_at, updated_at
      FROM ai_agents
      WHERE id = $1 AND tenant_id = $2
    `, [newAgent.id, session.tenantId]);

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error('Agents POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
