"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = require("body-parser");
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const placeRoutes_1 = __importDefault(require("./routes/placeRoutes"));
const slotRoutes_1 = __importDefault(require("./routes/slotRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, body_parser_1.json)());
app.use((0, body_parser_1.urlencoded)({ extended: true }));
// DB Connection
(0, db_1.connectDB)();
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/places", placeRoutes_1.default);
app.use("/api/slots", slotRoutes_1.default);
app.use("/api/clients", clientRoutes_1.default);
app.use("/api/bookings", bookingRoutes_1.default);
app.use("/api/reports", reportRoutes_1.default);
// Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
