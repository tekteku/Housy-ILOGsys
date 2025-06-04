import 'dotenv/config';
import { createServer } from "http";
import express from "express";
import app from "./app";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from 'url';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create HTTP server
const server = createServer(app);

(async () => {
  // Serve static files from multiple directories
  app.use('/static', express.static(path.join(__dirname, '../static')));
  app.use('/static', express.static(path.join(__dirname, 'public')));
  app.use('/static', express.static(path.join(__dirname, 'client/static')));

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on a specified port
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 9876; // Allow port to be configurable
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
