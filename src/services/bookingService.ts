import Booking, { IBooking } from "../models/Booking";
import Slot from "../models/Slot";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../utils/email";
import * as clientService from "./clientService";
import Place from "../models/Place";
import { sendSMS } from "../utils/sms";
import AuditLog from "../models/AuditLog";
import ErrorResponse from "../utils/errorResponse";
import BookingCounter from "../models/BookingCounter";
import { config } from "../config/env";
import SlotBookingCounter from "../models/SlotBookingCounter";

export const createBooking = async (
  clientId: string,
  placeId: string,
  slotId: string,
  quantity: number,
  actorId?: string,
  suppliedPlaceEmail?: string,
  clientSnapshot?: { fullName?: string; email?: string; phone?: string }
): Promise<IBooking> => {
  // Enforce a daily global booking limit
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateKey = `${yyyy}-${mm}-${dd}`;

  // Use configurable daily limit (default in config is 6000)
  const MAX_DAILY = Number(config.maxDailyBookings || 6000);
  const SLOT_MAX_DAILY = Number(config.slotMaxDailyBookings || 6000);

  // For single-node MongoDB (or no replica set), transactions are not available.
  // Use an atomic conditional update to increment the slot.bookedCount only if there's capacity.
  // This avoids the 'Transaction numbers are only allowed on a replica set member or mongos' error.

  // First, try to atomically reserve the requested quantity.
  let reserved = quantity;
  let updated;

  // If overbooking is allowed, skip capacity checks and increment unconditionally
  if (config.allowOverbooking) {
    updated = await Slot.findOneAndUpdate(
      { _id: slotId, status: "ACTIVE" },
      { $inc: { bookedCount: quantity } },
      { new: true }
    ).exec();
    if (!updated) throw new ErrorResponse("Invalid or inactive slot", 400);
  } else {
    updated = await Slot.findOneAndUpdate(
      { _id: slotId, status: "ACTIVE", $expr: { $lte: [{ $add: ["$bookedCount", quantity] }, "$capacity"] } },
      { $inc: { bookedCount: quantity } },
      { new: true }
    ).exec();
  }

  if (!updated) {
    // The full requested quantity couldn't be reserved. Attempt a partial reservation
    const slot = await Slot.findById(slotId).exec();
    if (!slot || slot.status !== "ACTIVE") {
      // invalid slot
      // rollback any counter changes (defensive; counter not yet incremented at this point typically)
      throw new ErrorResponse("Invalid or inactive slot", 400);
    }

    const available = slot.capacity - slot.bookedCount;
    if (available <= 0) {
      throw new ErrorResponse("Slot is full", 400);
    }

    // Try to reserve only the available seats atomically
    reserved = Math.min(available, quantity);
    updated = await Slot.findOneAndUpdate(
      { _id: slotId, status: "ACTIVE", $expr: { $lte: [{ $add: ["$bookedCount", reserved] }, "$capacity"] } },
      { $inc: { bookedCount: reserved } },
      { new: true }
    ).exec();

    if (!updated) {
      // race condition: someone reserved seats in the meantime
      throw new ErrorResponse("Slot is full", 400);
    }
  }

  // At this point bookedCount was incremented atomically. Create booking document.
  const b = new Booking({
    clientId,
    clientSnapshot: clientSnapshot || undefined,
    placeId,
    slotId,
    quantity,
    status: "CONFIRMED",
    confirmationCode: uuidv4(),
  });

  try {
    // Before saving booking, increment daily counter atomically. If this fails (daily limit), rollback slot and report error.
    if (config.enforceDailyLimits) {
      // Increment global daily counter first (atomic upsert with upper bound)
      const counter = await BookingCounter.findOneAndUpdate(
        { date: dateKey, $expr: { $lte: [{ $add: ["$count", reserved] }, MAX_DAILY] } },
        { $inc: { count: reserved } },
        { new: true, upsert: true }
      ).exec();

      if (!counter) {
        // rollback reserved seats
        try {
          await Slot.findByIdAndUpdate(slotId, { $inc: { bookedCount: -reserved } });
        } catch (e) {
          console.error("Failed to rollback slot bookedCount after daily limit reached", e);
        }
        const existing = await BookingCounter.findOne({ date: dateKey });
        const current = existing?.count ?? 0;
        throw new ErrorResponse(`Daily booking limit reached (${current}/${MAX_DAILY})`, 400);
      }

      // Then enforce per-slot daily cap (atomic upsert with upper bound)
      const slotCounter = await SlotBookingCounter.findOneAndUpdate(
        { date: dateKey, slotId: slotId, $expr: { $lte: [{ $add: ["$count", reserved] }, SLOT_MAX_DAILY] } },
        { $inc: { count: reserved } },
        { new: true, upsert: true }
      ).exec();

      if (!slotCounter) {
        // rollback global counter and reserved seats
        try {
          await BookingCounter.findOneAndUpdate({ date: dateKey }, { $inc: { count: -reserved } }).exec();
          await Slot.findByIdAndUpdate(slotId, { $inc: { bookedCount: -reserved } });
        } catch (e) {
          console.error("Failed to rollback after slot daily limit reached", e);
        }
        const existing = await SlotBookingCounter.findOne({ date: dateKey, slotId });
        const current = existing?.count ?? 0;
        throw new ErrorResponse(`Slot daily booking limit reached (${current}/${SLOT_MAX_DAILY})`, 400);
      }
    }

    // Adjust booking quantity to the number of seats actually reserved
    b.quantity = reserved;

    const createdBooking = await b.save();

    // best-effort notifications: send detailed booking confirmation to client and place emails
    try {
      const client = await clientService.getClientById(clientId);
      const clientEmail = client?.email;

      // get place and slot details for the email body
      const placeDoc = await Place.findById(placeId).exec();
      const slotDoc = await Slot.findById(slotId).exec();
      const placeEmail = placeDoc?.email || config.placeEmail || undefined;

      // build a human-friendly date/time
      const startAt = slotDoc?.startAt ? new Date(slotDoc.startAt).toLocaleString() : "N/A";
      const endAt = slotDoc?.endAt ? new Date(slotDoc.endAt).toLocaleString() : "N/A";

      const subject = `Booking Confirmed — ${placeDoc?.name || "Your Tour"}`;

      const textLines = [
        `Hello ${client?.fullName || "Guest"},`,
        "",
        `Your booking is confirmed. Details below:`,
        "",
        `Confirmation Code: ${createdBooking.confirmationCode}`,
        `Place: ${placeDoc?.name || "-"}`,
        `Location: ${placeDoc?.location || "-"}`,
        `Slot Start: ${startAt}`,
        `Slot End: ${endAt}`,
        `Seats Booked: ${createdBooking.quantity}`,
        `Status: ${createdBooking.status}`,
        "",
        `If you need to cancel or reschedule, please contact the place or admin.`,
        ``,
        `Thanks,`,
        `Tourist Platform Team`,
      ];

      const text = textLines.join("\n");

      const html = `
        <p>Hello ${client?.fullName || "Guest"},</p>
        <p>Your booking is <strong>confirmed</strong>. Details below:</p>
        <ul>
          <li><strong>Confirmation Code:</strong> ${createdBooking.confirmationCode}</li>
          <li><strong>Place:</strong> ${placeDoc?.name || "-"}</li>
          <li><strong>Location:</strong> ${placeDoc?.location || "-"}</li>
          <li><strong>Slot Start:</strong> ${startAt}</li>
          <li><strong>Slot End:</strong> ${endAt}</li>
          <li><strong>Seats Booked:</strong> ${createdBooking.quantity}</li>
          <li><strong>Status:</strong> ${createdBooking.status}</li>
        </ul>
        <p>If you need to cancel or reschedule, please contact the place or admin.</p>
        <p>Thanks,<br/>Tourist Platform Team</p>
      `;

      // Send a dedicated email to the client (To: client only)
      if (clientEmail) {
        try {
          // debug: show which email address we will send client confirmation to
          // eslint-disable-next-line no-console
          console.debug("[bookingService] sending client confirmation to:", clientEmail, "subject:", subject);
          await sendEmail(clientEmail, subject, text, html);
        } catch (e) {
          console.warn("Failed to send client confirmation email:", e);
        }
      }

      // No admin/place notification: only client receives confirmation
    } catch (e) {
      console.warn("Failed to send confirmation email:", e);
    }

    // create audit log entry (best-effort)
    try {
      await AuditLog.create({
        actorId: actorId ? actorId : undefined,
        action: "CREATE_BOOKING",
        entityType: "Booking",
        entityId: createdBooking._id.toString(),
        changed: { quantity: createdBooking.quantity, slotId: createdBooking.slotId },
        timestamp: new Date(),
      });
    } catch (_e) {
      // ignore audit failures
    }

    return createdBooking;
  } catch (err) {
    // Compensate: decrement bookedCount if booking creation failed after increment
    try {
      await Slot.findByIdAndUpdate(slotId, { $inc: { bookedCount: -quantity } });
    } catch (_e) {
      console.error("Failed to rollback slot bookedCount after booking save failure", _e);
    }
    // Also rollback daily booking counter
    try {
      await BookingCounter.findOneAndUpdate({ date: dateKey }, { $inc: { count: -quantity } }).exec();
    } catch (_e) {
      console.error("Failed to rollback BookingCounter after booking save failure", _e);
    }
    throw err;
  }
};

export const getBookings = async () => {
  return Booking.find().populate("clientId placeId slotId");
};

export const getBookingsByClient = async (clientId: string) => {
  return Booking.find({ clientId }).populate("placeId slotId");
};

export const getBookingsByPlace = async (placeId: string) => {
  // include client and slot info for display
  return Booking.find({ placeId, status: { $ne: "CANCELLED" } }).populate(
    "clientId slotId"
  );
};

export const cancelBooking = async (id: string) => {
  const booking = await Booking.findById(id);
  if (!booking) throw new Error("Booking not found");

  booking.status = "CANCELLED";
  await booking.save();

  // Decrease bookedCount
  await Slot.findByIdAndUpdate(booking.slotId, {
    $inc: { bookedCount: -booking.quantity },
  });

  return booking;
};

export const rescheduleBooking = async (
  id: string,
  newSlotId: string
): Promise<IBooking> => {
  const booking = await Booking.findById(id);
  if (!booking) throw new Error("Booking not found");

  const newSlot = await Slot.findById(newSlotId);
  if (!newSlot || newSlot.bookedCount + booking.quantity > newSlot.capacity) {
    throw new Error("New slot is not available");
  }

  // rollback old slot
  await Slot.findByIdAndUpdate(booking.slotId, {
    $inc: { bookedCount: -booking.quantity },
  });

  // update new slot
  newSlot.bookedCount += booking.quantity;
  await newSlot.save();

  booking.slotId = newSlotId as any;
  booking.status = "RESCHEDULED";
  return booking.save();
};
