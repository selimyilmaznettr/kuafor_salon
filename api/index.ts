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
let isReady = false;
const setupPromise = (async () => {
    await registerRoutes(httpServer, app);
    isReady = true;
})();

app.use((req, res, next) => {
    console.log(`[API REQUEST] ${req.method} ${req.url}`);
    next();
});

app.use(async (req, _res, next) => {
    try {
        if (!isReady) {
            await setupPromise;
        }
        next();
    } catch (err) {
        console.error("Failed to initialize routes:", err);
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
