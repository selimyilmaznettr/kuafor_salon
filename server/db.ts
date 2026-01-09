import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. Database features will fail.");
    // Provide a dummy string to prevent crash during import, but connection will fail if used.
    // This allows the app to start and report specific errors later.
}

export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

// Log pool errors (unexpected backend issues)
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit process in serverless, just log
});

export const db = drizzle(pool, { schema });
