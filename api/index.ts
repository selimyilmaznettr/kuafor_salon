import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Simple middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes (this must be async-aware but for Vercel exports we do it top-level or handled)
// Since registerRoutes is async, we need to handle it.
// However, registerRoutes mostly sets up express routes.

// We wrap it in a promise-based handler for Vercel
// Health check - Bypass DB to verify function runtime
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        env: {
            nodeEnv: process.env.NODE_ENV,
            hasDbUrl: !!process.env.DATABASE_URL
        }
    });
});

let isReady = false;
let startupError: Error | null = null;

const setupPromise = (async () => {
    try {
        console.log("Starting route registration...");
        // const { registerRoutes } = await import("../server/routes"); // Reverted to static to fix bundling
        await registerRoutes(httpServer, app);
        isReady = true;
        console.log("Routes initialized successfully");
    } catch (err) {
        console.error("Critical: Failed to initialize routes:", err);
        startupError = err as Error;
        // Do not throw here to prevent process crash on cold start
    }
})();

app.use((req, res, next) => {
    console.log(`[API REQUEST] ${req.method} ${req.url}`);
    next();
});

app.use(async (req, _res, next) => {
    // If health check, skip initialization check
    if (req.path === '/api/health') return next();

    if (startupError) {
        return next(startupError);
    }

    try {
        if (!isReady) {
            await setupPromise;
            // Check again in case it failed during await
            if (startupError) return next(startupError);
        }
        next();
    } catch (err) {
        console.error("Failed to initialize routes (middleware catch):", err);
        next(err);
    }
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("API Error (Global):", err);
    res.status(status).json({
        message,
        details: err instanceof Error ? err.message : String(err)
    });
});

export default app;
