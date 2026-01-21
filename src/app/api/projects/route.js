import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'src/app/data/projects.json');

async function getProjects() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Return empty array if file doesn't exist yet
      return [];
    }
    throw error;
  }
}

async function saveProjects(projects) {
  await fs.writeFile(dataFilePath, JSON.stringify(projects, null, 2));
}

export async function GET() {
  try {
    const projects = await getProjects();
    // Sort by newest by default
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}


async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.has('admin_authenticated');
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const projects = await getProjects();

    const newProject = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...body,
    };

    projects.push(newProject);
    await saveProjects(projects);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    let projects = await getProjects();
    const index = projects.findIndex(p => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update fields
    projects[index] = { ...projects[index], ...updates };

    await saveProjects(projects);

    return NextResponse.json(projects[index]);
  } catch (error) {
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

    let projects = await getProjects();
    const initialLength = projects.length;
    projects = projects.filter(p => p.id !== id);

    if (projects.length === initialLength) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await saveProjects(projects);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
