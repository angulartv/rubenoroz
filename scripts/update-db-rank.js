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
            const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
            process.env[key] = value;
        }
    });
} catch (e) {
    console.log('Note: No .env.local file found or error reading it.');
}

async function main() {
    try {
        console.log('🚀 Updating database schema (adding rank)...');

        // Add rank column if it doesn't exist
        // defaulting to 0 or a timestamp to keep some order initially
        await sql`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS rank INTEGER DEFAULT 0;
    `;
        console.log('✅ Column "rank" added (or already exists).');

    } catch (error) {
        console.error('❌ Error updating database:', error);
        process.exit(1);
    } finally {
        console.log('✨ Done.');
        process.exit(0);
    }
}

main();
