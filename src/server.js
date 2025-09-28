"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
let generateSlotsForNextDays = null;
try {
    // require at runtime to avoid TypeScript rootDir issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    generateSlotsForNextDays = require("../scripts/generateDailySlots").generateSlotsForNextDays;
}
catch (e) {
    // ignore if running in environments where scripts folder isn't compiled
}
const PORT = env_1.config.port || 5000;
app_1.default.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    // Generate concrete slots from templates for the coming days
    if (typeof generateSlotsForNextDays === "function") {
        generateSlotsForNextDays().catch((e) => console.error("Slot generation failed:", e));
    }
});
