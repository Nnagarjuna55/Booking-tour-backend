import axios from "axios";
import { config } from "../config/env";

export const sendSMS = async (phone: string, message: string) => {
  if (!config.smsApiKey) {
    console.warn("⚠️ SMS API key missing - SMS not sent");
    return;
  }

  try {
    // Example: MSG91 / Twilio / Textlocal API call
    await axios.post("https://sms-provider.com/send", {
      apiKey: config.smsApiKey,
      to: phone,
      message,
    });
    console.log(`📩 SMS sent to ${phone}`);
  } catch (err) {
    console.error("❌ Failed to send SMS:", err);
  }
};
