import cors from "cors";
import { env } from "./utils/env-vars";
import { Logger } from "./utils/logger";
import express, { Request, Response, json } from "express";
import { globalErrorHandler, global404NotFound, globalRequestResponseLogger } from "./middleware";

const app = express();

// Middleware
app.use(cors());
app.use(json());
app.use(globalRequestResponseLogger);

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  Logger.info("Health check endpoint called");
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(global404NotFound);
app.use(globalErrorHandler);

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
  Logger.info(`🚀 Express server running on port ${PORT}`);
  Logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
});
