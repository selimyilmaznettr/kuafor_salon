import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. Database features will fail.");
    // Provide a dummy string to prevent crash during import, but connection will fail if used.
    // This allows the app to start and report specific errors later.
}

// Use a dummy connection string if missing to prevent 'localhost' defaults which crash Vercel
// Use a dummy connection string if missing to prevent 'localhost' defaults which crash Vercel
console.log("Initializing DB Pool...");

// Support standard DATABASE_URL or Vercel/Neon specific POSTGRES_URL
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "postgres://user:pass@nonexistent-host:5432/db";

// Masked log for debugging
const maskedUrl = dbUrl.replace(/:[^:@]*@/, ":***@");
console.log(`Using Database URL: ${maskedUrl}`);

export const pool = new pg.Pool({
    connectionString: dbUrl,
    // If the URL already has sslmode, pg might complain if we override. 
    // But for Neon/Vercel production, explicit ssl: true (or rejectUnauthorized: false) is standard.
    // We will trust the URL params if present, otherwise enforce production SSL.
    ssl: dbUrl.includes("sslmode=")
        ? undefined
        : (process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined),
    connectionTimeoutMillis: 5000,
});

// Log pool errors (unexpected backend issues)
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema });
