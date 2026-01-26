import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../lib/auth';
import { query, queryOne } from '../../../lib/db';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agents = await query<any[]>(`
      SELECT id, name, config, is_default, created_at, updated_at
      FROM ai_assistants
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

    const { name, config = {}, is_default = false } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const newAgent = await queryOne<any>(`
      INSERT INTO ai_assistants (tenant_id, name, config, is_default)
      VALUES ($1, $2, $3::jsonb, $4)
      RETURNING id, name, config, is_default, created_at, updated_at
    `, [session.tenantId, name, config, is_default]);

    if (is_default) {
      await query<any>(`
        UPDATE ai_assistants SET is_default = false WHERE tenant_id = $1 AND id != $2
      `, [session.tenantId, newAgent.id]);
      // Note: tenants table might not have default_agent_id column, so commenting out for now
      // await query<any>(`
      //   UPDATE tenants SET default_agent_id = $1 WHERE id = $2
      // `, [newAgent.id, session.tenantId]);
    }

    return NextResponse.json({ agent: newAgent }, { status: 201 });
  } catch (error) {
    console.error('Agents POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
