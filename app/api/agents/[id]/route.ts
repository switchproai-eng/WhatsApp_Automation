import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/auth';
import { query, queryOne } from '../../../../lib/db';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await queryOne<any>(`
      SELECT id, name, config, is_default, created_at, updated_at
      FROM ai_assistants
      WHERE id = $1 AND tenant_id = $2
    `, [id, session.tenantId]);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Agent GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, config = {}, is_default = false } = await request.json();

    await query<any>(`
      UPDATE ai_assistants SET name = $1, config = $2::jsonb, is_default = $3
      WHERE id = $4 AND tenant_id = $5
    `, [name, config, is_default, id, session.tenantId]);

    if (is_default) {
      await query<any>(`
        UPDATE ai_assistants SET is_default = false WHERE tenant_id = $1 AND id != $2
      `, [session.tenantId, id]);
      await query<any>(`
        UPDATE tenants SET default_agent_id = $1 WHERE id = $2
      `, [id, session.tenantId]);
    }

    const agent = await queryOne<any>(`
      SELECT id, name, config, is_default, created_at, updated_at
      FROM ai_assistants
      WHERE id = $1 AND tenant_id = $2
    `, [id, session.tenantId]);

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Agent PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the agent to check if it's the default
    const agentToDelete = await queryOne<any>(`
      SELECT id, is_default FROM ai_assistants WHERE id = $1 AND tenant_id = $2
    `, [id, session.tenantId]);

    if (!agentToDelete) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    await query(`
      DELETE FROM ai_assistants WHERE id = $1 AND tenant_id = $2
    `, [id, session.tenantId]);

    // If the deleted agent was the default agent, update tenant's default_agent_id
    if (agentToDelete.is_default) {
      // Try to set another agent as default if available
      const otherAgent = await queryOne<any>(`
        SELECT id FROM ai_assistants WHERE tenant_id = $1 LIMIT 1
      `, [session.tenantId]);

      if (otherAgent) {
        // Set another agent as default
        await query(`
          UPDATE ai_assistants SET is_default = true WHERE id = $1
        `, [otherAgent.id]);

        // Update tenant's default_agent_id
        await query(`
          UPDATE tenants SET default_agent_id = $1 WHERE id = $2
        `, [otherAgent.id, session.tenantId]);
      } else {
        // No other agents exist, null the tenant's default
        await query(`
          UPDATE tenants SET default_agent_id = NULL WHERE id = $1
        `, [session.tenantId]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Agent DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
