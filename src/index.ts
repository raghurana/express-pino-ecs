import cors from "cors";
import { env } from "./env-vars";
import express, { Request, Response, json } from "express";
import { globalErrorHandler, global404NotFound } from "./middleware";

const app = express();
const PORT = env.PORT;

// Middleware
app.use(cors());
app.use(json());

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(global404NotFound);
app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 API docs: http://localhost:${PORT}/api/data`);
});
