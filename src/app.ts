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

// Middlewares
app.use(cors());
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
