import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.has('admin_authenticated');
}

// Helper to format DB row to Frontend expected format
const formatProject = (row) => ({
  id: row.id,
  name: row.title,
  description: row.description,
  url: row.link,
  category: row.category,
  tags: row.tags || [],
  preview: row.image_url,
  createdAt: row.created_at,
});

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
    const projects = rows.map(formatProject);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, url, category, preview, tags } = body;
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();

    // Ensure tags is an array
    const tagsArray = Array.isArray(tags) ? tags : [];

    await sql`
      INSERT INTO projects (id, title, description, link, category, image_url, tags, created_at)
      VALUES (${id}, ${name}, ${description}, ${url}, ${category}, ${preview}, ${tagsArray}, ${createdAt})
    `;

    return NextResponse.json({
      id,
      name,
      description,
      url,
      category,
      preview,
      tags: tagsArray,
      createdAt
    }, { status: 201 });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, description, url, category, preview, tags } = body;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const tagsArray = Array.isArray(tags) ? tags : [];

    await sql`
      UPDATE projects 
      SET title = ${name}, 
          description = ${description}, 
          link = ${url}, 
          category = ${category}, 
          image_url = ${preview},
          tags = ${tagsArray}
      WHERE id = ${id}
    `;

    // Return the updated object
    return NextResponse.json({ id, name, description, url, category, preview, tags: tagsArray });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await sql`DELETE FROM projects WHERE id = ${id}`;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
