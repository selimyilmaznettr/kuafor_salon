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

app.use(async (req, res, next) => {
    if (!isReady) {
        await setupPromise;
    }
    next();
});

// Mock cron jobs or just skip them in serverless (Vercel uses vercel.json for crons)

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
});

export default app;
