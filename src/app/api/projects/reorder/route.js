import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

async function isAuthenticated() {
    const cookieStore = await cookies();
    return cookieStore.has('admin_authenticated');
}

export async function PUT(request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        // Expect body to be an array of { id, rank }
        // or just an ordered array of IDs, in which case we assign rank based on index.

        // Let's support an ordered list of items, where index = rank.
        const { items } = body; // items: [{ id: '...', ... }, ...]

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
        }

        // We can run a transaction or multiple updates. 
        // For simplicity with Vercel Postgres, loops are fetching fine but batch is better.
        // We'll trust the array order.

        // Construct a large CASE statement or loop.
        // Loop is easier to write and debug for <100 items.

        for (let i = 0; i < items.length; i++) {
            const id = items[i].id;
            // Rank is simply the index in the array
            const rank = i;

            await sql`
            UPDATE projects 
            SET rank = ${rank}
            WHERE id = ${id}
        `;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reorder Error:', error);
        return NextResponse.json({ error: 'Failed to reorder projects' }, { status: 500 });
    }
}
