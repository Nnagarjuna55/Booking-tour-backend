// import express, { Application } from "express";
// import cors from "cors";
// import morgan from "morgan";
// import helmet from "helmet";
// import { json, urlencoded } from "body-parser";
// import { connectDB } from "./config/db";
// import authRoutes from "./routes/authRoutes";
// import placeRoutes from "./routes/placeRoutes";
// import slotRoutes from "./routes/slotRoutes";
// import clientRoutes from "./routes/clientRoutes";
// import bookingRoutes from "./routes/bookingRoutes";
// import reportRoutes from "./routes/reportRoutes";
// import { errorHandler } from "./middleware/errorHandler";

// const app: Application = express();

// // Middlewares
// app.use(cors());
// app.use(helmet());
// app.use(morgan("dev"));
// app.use(json());
// app.use(urlencoded({ extended: true }));

// // DB Connection
// connectDB();

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/places", placeRoutes);
// app.use("/api/slots", slotRoutes);
// app.use("/api/clients", clientRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/reports", reportRoutes);

// // Error Handler
// app.use(errorHandler);

// export default app;

import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { json, urlencoded } from "body-parser";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import placeRoutes from "./routes/placeRoutes";
import slotRoutes from "./routes/slotRoutes";
import clientRoutes from "./routes/clientRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import reportRoutes from "./routes/reportRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

// ✅ Allowed origins (can be overridden via ALLOWED_ORIGINS env var)
// Default includes common dev hosts and known preview domains.
const defaultOrigins = [
  "https://booking-tour-zgb9.vercel.app",
  "https://booking-tour-chi.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const envList = process.env.ALLOWED_ORIGINS;
const allowedOrigins = envList && envList.length
  ? envList.split(",").map((s) => s.trim()).filter(Boolean)
  : defaultOrigins;

const corsOptions = {
  origin: (origin: any, callback: any) => {
    // Allow non-browser requests (like server-to-server) where origin is undefined
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // log rejected origin to help with debugging in logs
    // eslint-disable-next-line no-console
    console.warn(`[CORS] Rejected origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Ensure all OPTIONS preflight requests across routes are handled
app.options("*", cors(corsOptions));

// Middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(json());
app.use(urlencoded({ extended: true }));

// DB Connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);

// Error Handler
app.use(errorHandler);

export default app;
