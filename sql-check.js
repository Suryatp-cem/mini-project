const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: "postgresql://landslide_owner:LYQDJdrw8x1U@ep-gentle-sun-a1yk8k2p-pooler.ap-southeast-1.aws.neon.tech/landslide?sslmode=require&channel_binding=require",
    });

    try {
        await client.connect();
        const res = await client.query('SELECT id, name, email, role FROM "user"');
        console.log('--- USER ROLES ---');
        console.log(JSON.stringify(res.rows, null, 2));
        console.log('------------------');
    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        await client.end();
    }
}

main();
