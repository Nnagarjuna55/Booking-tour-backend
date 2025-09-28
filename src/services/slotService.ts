import Slot, { ISlot } from "../models/Slot";
import Booking from "../models/Booking";
import mongoose from "mongoose";
import AuditLog from "../models/AuditLog";
import { sendEmail } from "../utils/email";
import { sendSMS } from "../utils/sms";
import * as clientService from "./clientService";
import { config } from "../config/env";

export const createSlot = async (data: Partial<ISlot>) => {
  // ensure no overlapping ACTIVE slot exists for same place
  if (!data.placeId || !data.startAt || !data.endAt) throw new Error("Missing slot data");

  const overlapping = await Slot.findOne({
    placeId: data.placeId,
    status: "ACTIVE",
    $or: [
      { startAt: { $lt: data.endAt }, endAt: { $gt: data.startAt } },
    ],
  });

  if (overlapping) throw new Error("Overlapping slot exists");

  const slot = new Slot(data);
  const saved = await slot.save();

  try {
    await AuditLog.create({
      actorId: undefined,
      action: "CREATE_SLOT",
      entityType: "Slot",
      entityId: saved._id.toString(),
      changed: data,
      timestamp: new Date(),
    });
  } catch (_e) {}

  return saved;
};

export const getSlotsByPlace = async (placeId: string) => {
  return Slot.find({ placeId, status: "ACTIVE" });
};

export const updateSlot = async (id: string, data: Partial<ISlot>) => {
  return Slot.findByIdAndUpdate(id, data, { new: true });
};

export const cancelSlot = async (id: string) => {
  // Atomically mark the slot cancelled
  const updated = await Slot.findByIdAndUpdate(id, { status: "CANCELLED" }, { new: true }).exec();
  if (!updated) throw new Error("Slot not found");

  // Find impacted bookings and mark them cancelled (best-effort)
  const bookings = await Booking.find({ slotId: id, status: { $in: ["CONFIRMED", "PENDING"] } });

  for (const b of bookings) {
    b.status = "CANCELLED";
    try {
      await b.save();
    } catch (e) {
      console.error("Failed to cancel booking", b._id, e);
      continue;
    }

    // send notification (best-effort) to booking client email when available
    try {
      const client = await clientService.getClientById(String(b.clientId));
      const to = client?.email || config.emailUser || "";
      if (to) {
        await sendEmail(to, "Booking Cancelled", `Booking ${b.confirmationCode} cancelled due to slot cancellation.`);
      }
    } catch (e) {
      console.warn("Failed to send cancellation email:", e);
    }
  }

  try {
    await AuditLog.create({
      actorId: undefined,
      action: "CANCEL_SLOT",
      entityType: "Slot",
      entityId: id,
      changed: { status: "CANCELLED" },
      timestamp: new Date(),
    });
  } catch (_e) {}

  return updated;
};
