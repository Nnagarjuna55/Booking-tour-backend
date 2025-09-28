import nodemailer from "nodemailer";
import { config } from "../config/env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

export const sendEmail = async (
  to: string | string[],
  subject: string,
  text: string,
  html?: string
) => {
  // nodemailer accepts comma-separated strings or arrays for `to`
  await transporter.sendMail({
    from: `"Tourist Platform" <${config.emailUser}>`,
    to,
    subject,
    text,
    html,
  });
};
