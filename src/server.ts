// import app from "./app";
// import { config } from "./config/env";

// const PORT = config.port || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
// src/app.ts
import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors({
  origin: "https://booking-tour-chi.vercel.app" // frontend URL
}));
app.use(express.json());

// Example route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
