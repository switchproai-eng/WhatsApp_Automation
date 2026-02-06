import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifySession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session from token
    const session = await verifySession(request);
    if (!session || !session.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query<{
      id: string;
      name: string;
      business_name: string;
      business_logo_url: string | null;
      description: string;
      website_url: string | null;
      facebook_url: string | null;
      instagram_url: string | null;
      twitter_url: string | null;
      linkedin_url: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
      welcome_message: string | null;
      greeting_message: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, name, business_name, business_logo_url, description,
              website_url, facebook_url, instagram_url, twitter_url, linkedin_url,
              email, phone, address, welcome_message, greeting_message, created_at, updated_at
       FROM business_templates
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [session.tenantId]
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching business templates:", error);
    return NextResponse.json({ error: "Failed to fetch business templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session from token
    const session = await verifySession(request);
    if (!session || !session.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the request is form data (for file uploads) or JSON
    const contentType = request.headers.get('content-type');
    
    let body;
    if (contentType?.includes('multipart/form-data')) {
      // Handle form data with file uploads
      const formData = await request.formData();
      
      body = {
        name: formData.get('name') as string,
        businessName: formData.get('businessName') as string,
        businessLogo: formData.get('businessLogo') as string,
        description: formData.get('description') as string,
        websiteUrl: formData.get('websiteUrl') as string,
        facebookUrl: formData.get('facebookUrl') as string,
        instagramUrl: formData.get('instagramUrl') as string,
        twitterUrl: formData.get('twitterUrl') as string,
        linkedinUrl: formData.get('linkedinUrl') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
      };
    } else {
      // Handle JSON request
      body = await request.json();
    }
    
    // Extract business template data
    const {
      name,
      businessName,
      businessLogo,
      description,
      websiteUrl,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      linkedinUrl,
      email,
      phone,
      address,
    } = body;

    // Validation
    if (!name || !businessName) {
      return NextResponse.json({ error: "Name and business name are required" }, { status: 400 });
    }

    // Insert the business template into the database
    const insertResult = await query<{
      id: string;
      name: string;
      business_name: string;
      business_logo_url: string | null;
      description: string;
      website_url: string | null;
      facebook_url: string | null;
      instagram_url: string | null;
      twitter_url: string | null;
      linkedin_url: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
      welcome_message: string | null;
      greeting_message: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `INSERT INTO business_templates 
       (tenant_id, name, business_name, business_logo_url, description, 
        website_url, facebook_url, instagram_url, twitter_url, linkedin_url, 
        email, phone, address, welcome_message, greeting_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id, name, business_name, business_logo_url, description, 
                 website_url, facebook_url, instagram_url, twitter_url, linkedin_url, 
                 email, phone, address, welcome_message, greeting_message, created_at, updated_at`,
      [
        session.tenantId, name, businessName, businessLogo, description,
        websiteUrl, facebookUrl, instagramUrl, twitterUrl, linkedinUrl,
        email, phone, address, body.welcomeMessage, body.greetingMessage
      ]
    );

    return NextResponse.json(insertResult[0]);
  } catch (error) {
    console.error("Error creating business template:", error);
    return NextResponse.json({ error: "Failed to create business template" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get session from token
    const session = await verifySession(request);
    if (!session || !session.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    // Check if the template belongs to the current tenant
    const existingTemplateResult = await query<{ id: string }>(
      'SELECT id FROM business_templates WHERE id = $1 AND tenant_id = $2',
      [id, session.tenantId]
    );

    if (existingTemplateResult.length === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Build the update query dynamically
    const fields = [];
    const values = [];
    let paramIndex = 3;

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // Add the id and tenant_id to the values
    values.unshift(id, session.tenantId); // Add id as $1, tenant_id as $2

    const updateQuery = `
      UPDATE business_templates 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND tenant_id = $2
      RETURNING id, name, business_name, business_logo_url, description,
                website_url, facebook_url, instagram_url, twitter_url, linkedin_url,
                email, phone, address, welcome_message, greeting_message, created_at, updated_at
    `;

    const updateResult = await query<{
      id: string;
      name: string;
      business_name: string;
      business_logo_url: string | null;
      description: string;
      website_url: string | null;
      facebook_url: string | null;
      instagram_url: string | null;
      twitter_url: string | null;
      linkedin_url: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
      welcome_message: string | null;
      greeting_message: string | null;
      created_at: string;
      updated_at: string;
    }>(updateQuery, values);

    return NextResponse.json(updateResult[0]);
  } catch (error) {
    console.error("Error updating business template:", error);
    return NextResponse.json({ error: "Failed to update business template" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get session from token
    const session = await verifySession(request);
    if (!session || !session.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    // Delete the business template from the database
    const deleteResult = await query(
      'DELETE FROM business_templates WHERE id = $1 AND tenant_id = $2',
      [id, session.tenantId]
    );

    if (deleteResult.length === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Business template deleted successfully" });
  } catch (error) {
    console.error("Error deleting business template:", error);
    return NextResponse.json({ error: "Failed to delete business template" }, { status: 500 });
  }
}