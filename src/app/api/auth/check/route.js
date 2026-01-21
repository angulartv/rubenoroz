import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.has('admin_authenticated');
    return NextResponse.json({ isAuthenticated });
}
