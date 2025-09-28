import app from "./app";
import { config } from "./config/env";
let generateSlotsForNextDays: any = null;
try {
  // require at runtime to avoid TypeScript rootDir issues
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  generateSlotsForNextDays = require("../scripts/generateDailySlots").generateSlotsForNextDays;
} catch (e) {
  // ignore if running in environments where scripts folder isn't compiled
}

const PORT = config.port || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  // Generate concrete slots from templates for the coming days
  if (typeof generateSlotsForNextDays === "function") {
    generateSlotsForNextDays().catch((e: any) => console.error("Slot generation failed:", e));
  }
});
