import mongoose from "mongoose";
import SlotTemplate from "../src/models/SlotTemplate";
import Slot from "../src/models/Slot";
import * as slotService from "../src/services/slotService";
import { config } from "../src/config/env";

const DAYS_AHEAD = Number(process.env.SLOT_GEN_DAYS_AHEAD || 7);

function combineDateAndTime(date: Date, timeStr: string) {
  // timeStr like "HH:mm" or "HH:mm:ss"
  const [hh, mm, ss] = timeStr.split(":").map((s) => Number(s));
  const d = new Date(date);
  d.setHours(hh || 0, mm || 0, ss || 0, 0);
  return d;
}

export const generateSlotsForNextDays = async (days = DAYS_AHEAD) => {
  const templates = await SlotTemplate.find({ active: true }).exec();
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    for (const t of templates) {
      const startAt = combineDateAndTime(date, t.startTime);
      const endAt = combineDateAndTime(date, t.endTime);
      try {
        // createSlot will validate overlaps and uniqueness; ignore errors
        await slotService.createSlot({ placeId: t.placeId, startAt, endAt, capacity: t.capacity });
      } catch (e) {
        // ignore - e.g., overlapping or duplicate slot
      }
    }
  }
};

if (require.main === module) {
  // standalone runner
  const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/tour-booking";
  mongoose
    .connect(MONGO)
    .then(async () => {
      await generateSlotsForNextDays();
      console.log("Generated daily slots");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
