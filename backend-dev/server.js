/**
 * @file server.js
 * @description Main entry point of the Node.js application (ES6).
 * Loads environment variables, verifies database connection pool, starts HTTP server with Socket.io, and handles graceful shutdown.
 */

import "dotenv/config";
import http from "http"; // Native HTTP module import kiya
import env from "./src/config/env.js";
import { Server } from "socket.io";
import app from "./src/app.js";
import db from "./src/database/db.js";

const PORT = env.PORT || 5000;

/**
 * Bootstraps application server, initializes WebSockets, and manages DB pool lifetime
 */
const startServer = async () => {
  let testConnection;
  try {
    // Acquire a single test connection to verify database health
    testConnection = await db.getConnection();
    console.log("✅ Database Connected Successfully");

    // 1. Create HTTP server using Express app
    const server = http.createServer(app);

    // 2. Initialize Socket.io and attach it to the HTTP server
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:4200", // Angular frontend URL
        methods: ["GET", "POST", "PUT", "DELETE"]
      }
    });

    // 3. Socket connection listener
    io.on("connection", (socket) => {
      console.log(`⚡ User connected: ${socket.id}`);

      // Room joining logic for role-based notifications
      socket.on("join_room", (roomName) => {
        socket.join(roomName);
        console.log(`User joined room: ${roomName}`);
      });

      // Disconnect event
      socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
      });
    });

    // Make 'io' accessible globally inside controllers via req.app.get('io')
    app.set("io", io);

    // 4. Start HTTP server (app.listen ki jagah server.listen use kiya hai)
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT} with WebSocket enabled`);
    });

    // Graceful Shutdown Handler (SIGTERM / SIGINT)
    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️ ${signal} received. Closing HTTP server, WebSockets & DB connections...`);
      
      // Close Socket.io connections
      io.close(() => {
        console.log("🔌 Socket.io server closed.");
      });

      server.close(async () => {
        try {
          if (db.end) {
            await db.end(); // Close DB pool gracefully
            console.log("📦 Database connection pool closed.");
          }
          process.exit(0);
        } catch (err) {
          console.error("❌ Error closing DB pool:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  } catch (error) {
    console.error("❌ Database connection error on startup:", error.message);
    process.exit(1);
  } finally {
    // ALWAYS release the test connection back to pool
    if (testConnection) {
      testConnection.release();
    }
  }
};

startServer();