"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: env_1.config.emailUser,
        pass: env_1.config.emailPass,
    },
});
const sendEmail = async (to, subject, text, html) => {
    // nodemailer accepts comma-separated strings or arrays for `to`
    await transporter.sendMail({
        from: `"Tourist Platform" <${env_1.config.emailUser}>`,
        to,
        subject,
        text,
        html,
    });
};
exports.sendEmail = sendEmail;
