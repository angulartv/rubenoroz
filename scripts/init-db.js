const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
try {
    const envConfig = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1'); // Remove quotes if any
            process.env[key] = value;
        }
    });
} catch (e) {
    console.log('Note: No .env.local file found or error reading it.');
}

async function main() {
    try {
        console.log('🚀 Initializing database...');

        // 1. Create Table
        await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        link TEXT,
        category TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('✅ Table "projects" created (or already exists).');

        // 2. Migrate Data
        const jsonPath = path.join(process.cwd(), 'src/app/data/projects.json');
        if (fs.existsSync(jsonPath)) {
            const rawData = fs.readFileSync(jsonPath, 'utf8');
            const projects = JSON.parse(rawData);

            if (projects.length > 0) {
                console.log(`📦 Found ${projects.length} projects to migrate...`);

                for (const p of projects) {
                    // Check if exists
                    const { rows } = await sql`SELECT id FROM projects WHERE id = ${p.id}`;
                    if (rows.length === 0) {
                        await sql`
              INSERT INTO projects (id, title, description, image_url, link, category, created_at)
              VALUES (${p.id}, ${p.name}, ${p.description}, ${p.preview || ''}, ${p.url}, ${p.category}, ${p.createdAt})
            `;
                        console.log(`   + Migrated: ${p.name}`);
                    } else {
                        console.log(`   . Skipped (already exists): ${p.name}`);
                    }
                }
            }
        } else {
            console.log('No local data file found to migrate.');
        }

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    } finally {
        // There is no explicit "close" for the serverless driver, but we can just exit.
        console.log('✨ Done.');
        process.exit(0);
    }
}

main();
