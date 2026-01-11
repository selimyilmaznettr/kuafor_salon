
import pg from 'pg';

const connectionString = "postgresql://neondb_owner:npg_2vV4CWOkfhGo@ep-broad-bird-afk1qly0-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";

console.log("WARNING: Wiping database completely...");

const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
});

async function reset() {
    const client = await pool.connect();
    try {
        console.log("Dropping schema public...");
        await client.query('DROP SCHEMA IF EXISTS public CASCADE');
        console.log("Recreating schema public...");
        await client.query('CREATE SCHEMA public');
        console.log("Database wiped successfully.");
    } catch (err) {
        console.error("Reset failed:", err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

reset();
