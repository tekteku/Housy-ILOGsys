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
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000; // Use port 3000 as configured in .env
  
  // Network-accessible server configuration
  const isWindows = process.platform === 'win32';
  const listenOptions = {
    port,
    host: "0.0.0.0", // Allow connections from any IP address
    ...(isWindows ? {} : { reusePort: true }) // reusePort not supported on Windows
  };
  
  server.listen(listenOptions, () => {
    log(`🚀 Housy Tunisia server running on http://${listenOptions.host}:${port}`);
    log(`📱 Local access: http://localhost:${port}`);
    log(`🌐 Network access: http://192.168.1.8:${port}`);
    log(`📱 From other devices, use: http://192.168.1.8:${port}`);
  });
})();
