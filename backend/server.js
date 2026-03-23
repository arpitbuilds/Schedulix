import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import timetableRoutes from "./routes/timetableRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const app = express();
    const server = http.createServer(app);
    
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
      },
    });

    // Make io accessible globally in routers
    app.set("socketio", io);

    io.on("connection", (socket) => {
      console.log(`📡 Socket connected: ${socket.id}`);
      socket.on("disconnect", () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      });
    });

    /* ===============================
       🔥 MIDDLEWARE
    ================================= */

    app.use(express.json());

    app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
      })
    );

    /* ===============================
       🚀 ROUTES
    ================================= */

    app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        message: "CP-SAT Timetable Generator is running",
        timestamp: new Date().toISOString(),
      });
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/timetable", timetableRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/faculty", facultyRoutes);
    app.use("/api/users", userRoutes);

    /* ===============================
       🌐 STATIC FRONTEND SERVING
    ================================= */

    if (process.env.NODE_ENV === "production" || process.env.SERVE_STATIC === "true") {
      app.use(express.static(path.join(__dirname, "../frontend/dist")));
      app.use((req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
      });
    } else {
      /* ===============================
         ❌ 404 HANDLER (API ONLY)
      ================================= */
      app.use((req, res) => {
        res.status(404).json({
          success: false,
          message: "Route not found",
          path: req.originalUrl,
        });
      });
    }

    /* ===============================
       🛑 GLOBAL ERROR HANDLER
    ================================= */

    app.use((error, req, res, next) => {
      console.error("Global error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    });

    const PORT = process.env.PORT || 5001;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();