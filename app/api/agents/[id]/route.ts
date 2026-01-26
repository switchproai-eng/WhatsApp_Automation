import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { neon } from '@neondatabase/serverless';

const ID_PARAM = '[id]';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await queryOne<any>(`
      SELECT id, name, config, is_default, created_at, updated_at
      FROM ai_agents
      WHERE id = $1 AND tenant_id = $2
    `, [params.id, session.tenantId]);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Agent GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, config = {} } = await request.json();

    const sql = neon(process.env.DATABASE_URL!);
    await sql`UPDATE ai_agents SET name = ${name}, config = ${config}::jsonb WHERE id = ${params.id} AND tenant_id = ${session.tenantId};`;

    if (config.is_default) {
      await sql`UPDATE ai_agents SET is_default = false WHERE tenant_id = ${session.tenantId} AND id != ${params.id};`;
      await sql`UPDATE ai_agents SET is_default = true WHERE id = ${params.id};`;
      // Update tenant default
      await sql`UPDATE tenants SET default_agent_id = ${params.id} WHERE id = ${session.tenantId};`;
    }

    const agent = await queryOne<any>(`
      SELECT id, name, config, is_default, created_at, updated_at
      FROM ai_agents
      WHERE id = $1 AND tenant_id = $2
    `, [params.id, session.tenantId]);

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Agent PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await query(`
      DELETE FROM ai_agents WHERE id = $1 AND tenant_id = $2
    `, [params.id, session.tenantId]);

    // If was default, null tenant's default
    await query(`
      UPDATE tenants SET default_agent_id = NULL WHERE id = $1 AND default_agent_id = $2
    `, [session.tenantId, params.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Agent DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
