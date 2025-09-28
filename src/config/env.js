"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 5000,
    mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/tourist_platform",
    jwtSecret: process.env.JWT_SECRET || "supersecretkey",
    jwtExpiry: process.env.JWT_EXPIRY || "1d",
    emailUser: process.env.EMAIL_USER || "",
    emailPass: process.env.EMAIL_PASS || "",
    // Optional default place notification email (fallback when place record has no email)
    placeEmail: process.env.PLACE_EMAIL || "",
    smsApiKey: process.env.SMS_API_KEY || "",
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
    // Maximum total bookings allowed per day across the system. Can be set via env, default to 6000.
    maxDailyBookings: Number(process.env.MAX_DAILY_BOOKINGS || 6000),
    // Maximum bookings allowed per slot per day. Can be set via env, default to 6000.
    slotMaxDailyBookings: Number(process.env.SLOT_MAX_DAILY_BOOKINGS || 6000),
    // Allow overbooking (ignore slot capacity checks). Set env to 'false' to enforce capacity.
    // Default changed to true to avoid blocking bookings by default in this environment.
    allowOverbooking: (process.env.ALLOW_OVERBOOKING || "true").toLowerCase() === "true",
    // Whether daily global/slot limits are enforced. Set env to 'true' to enable daily caps.
    // Default changed to false so bookings are not blocked by daily caps in this environment.
    enforceDailyLimits: (process.env.ENFORCE_DAILY_LIMITS || "false").toLowerCase() === "true",
};
