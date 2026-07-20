import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { connectDB, getDbStatus } from "./server/config/db.ts";
import { initializeFileDb } from "./server/services/dbService.ts";
import authRoutes from "./server/routes/authRoutes.ts";
import employeeRoutes from "./server/routes/employeeRoutes.ts";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB configurations
  await connectDB();
  initializeFileDb();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Health check & DB Status Endpoint
  app.get("/api/health", (req, res) => {
    const dbStatus = getDbStatus();
    res.json({
      status: "online",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || "development"
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/employees", employeeRoutes);

  // Vite Integration & Static Asset Serving
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Starting Express with Vite middleware in Development Mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("📦 Starting Express in Production Mode serving static build...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    const dbStatus = getDbStatus();
    console.log(`🚀 Server successfully booted and listening on http://0.0.0.0:${PORT}`);
    console.log(`📂 DB Mode: ${dbStatus.type.toUpperCase()} (${dbStatus.connected ? "CONNECTED" : "FALLBACK ACTIVE"})`);
  });
}

startServer().catch((error) => {
  console.error("💥 Critical Failure during Server Boot:", error);
  process.exit(1);
});
