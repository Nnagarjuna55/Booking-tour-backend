"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const sendSMS = async (phone, message) => {
    if (!env_1.config.smsApiKey) {
        console.warn("⚠️ SMS API key missing - SMS not sent");
        return;
    }
    try {
        // Example: MSG91 / Twilio / Textlocal API call
        await axios_1.default.post("https://sms-provider.com/send", {
            apiKey: env_1.config.smsApiKey,
            to: phone,
            message,
        });
        console.log(`📩 SMS sent to ${phone}`);
    }
    catch (err) {
        console.error("❌ Failed to send SMS:", err);
    }
};
exports.sendSMS = sendSMS;
