"use strict";
// import app from "./app";
// import { config } from "./config/env";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const PORT = config.port || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: "https://booking-tour-chi.vercel.app" // frontend URL
}));
app.use(express_1.default.json());
// Example route
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
exports.default = app;
