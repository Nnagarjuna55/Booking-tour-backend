import { Request, Response } from "express";
import * as bookingService from "../services/bookingService";
import * as clientService from "../services/clientService";
import mongoose from "mongoose";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const body = (req as any).body;
  let { clientId, client, placeId, slotId, quantity } = body;
    // debug log incoming payload to help trace 400 errors
    // (left intentionally simple to avoid leaking secrets)
    // eslint-disable-next-line no-console
    console.debug("[createBooking] payload:", { clientId, placeId, slotId, quantity, hasClient: !!client });
    // normalize types
    quantity = Number(quantity);

    // If clientId is provided, ensure it's a valid ObjectId. If not, but a client object is provided,
    // create the client and use the new id. Otherwise return a helpful error.
    if (clientId) {
      if (!mongoose.Types.ObjectId.isValid(clientId)) {
        if (client) {
          const created = await clientService.createClient(client);
          clientId = created._id.toString();
        } else {
          return res.status(400).json({ message: "Invalid clientId. Provide a valid Mongo ObjectId or omit clientId and provide client details." });
        }
      } else {
        // clientId is valid. If admin also provided a client object, update that client record
        if (client) {
          try {
            await clientService.updateClient(clientId, client as any);
          } catch (e) {
            // non-fatal: log and continue using existing clientId
            // eslint-disable-next-line no-console
            console.warn("Failed to update existing client with provided details:", e);
          }
        }
      }
    } else if (client) {
      const created = await clientService.createClient(client);
      clientId = created._id.toString();
    }

    if (!clientId) return res.status(400).json({ message: "clientId or client object required" });
    if (!placeId || !slotId || !quantity || isNaN(quantity) || quantity <= 0) return res.status(400).json({ message: "placeId, slotId and positive quantity are required" });

    // Support tokens that include either `id` or `_id` in the decoded payload
    const actorId = (req as any).user?.id || (req as any).user?._id;
    const booking = await bookingService.createBooking(clientId, placeId, slotId, quantity, actorId);
    const reservedQuantity = booking.quantity;
    res.status(201).json({ booking, requestedQuantity: quantity, reservedQuantity });
  } catch (err: any) {
    const status = err?.statusCode || 400;
    res.status(status).json({ message: err.message });
  }
};

export const getBookings = async (_req: Request, res: Response) => {
  const bookings = await bookingService.getBookings();
  res.json(bookings);
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const booking = await bookingService.cancelBooking((req as any).params.id);
    res.json(booking);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const rescheduleBooking = async (req: Request, res: Response) => {
  try {
    const booking = await bookingService.rescheduleBooking(
      (req as any).params.id,
      (req as any).body.newSlotId
    );
    res.json(booking);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getBookingsByClient = async (req: Request, res: Response) => {
  const { clientId } = (req as any).params;
  const bookings = await bookingService.getBookingsByClient(clientId);
  // Enhance returned bookings with friendly fields
  const friendly = bookings.map((b: any) => ({
    _id: b._id,
    placeId: b.placeId?._id,
    placeName: b.placeId?.name,
    slotId: b.slotId?._id,
    slotTime: b.slotId ? `${new Date(b.slotId.startAt).toLocaleString()} - ${new Date(b.slotId.endAt).toLocaleString()}` : undefined,
    quantity: b.quantity,
    status: b.status,
    createdAt: b.createdAt,
  }));
  res.json(friendly);
};

export const getBookingsByPlace = async (req: Request, res: Response) => {
  const { placeId } = (req as any).params;
  const bookings = await bookingService.getBookingsByPlace(placeId);
  // Aggregate bookings by client to return unique clients who booked this place
  const map = new Map<string, any>();
  bookings.forEach((b: any) => {
    const cid = b.clientId?._id?.toString();
    if (!cid) return;
    const slotTime = b.slotId ? `${new Date(b.slotId.startAt).toLocaleString()} - ${new Date(b.slotId.endAt).toLocaleString()}` : undefined;
    const existing = map.get(cid);
    if (!existing) {
      map.set(cid, {
        clientId: cid,
        clientName: b.clientId?.fullName,
        clientEmail: b.clientId?.email,
        clientPhone: b.clientId?.phone,
        totalQuantity: b.quantity || 0,
        lastSlotTime: slotTime,
        lastBookingAt: b.createdAt,
        bookingsCount: 1,
      });
    } else {
      existing.totalQuantity = (existing.totalQuantity || 0) + (b.quantity || 0);
      existing.bookingsCount = (existing.bookingsCount || 0) + 1;
      if (new Date(b.createdAt) > new Date(existing.lastBookingAt)) {
        existing.lastBookingAt = b.createdAt;
        existing.lastSlotTime = slotTime;
      }
    }
  });

  const friendly = Array.from(map.values()).sort((a, b) => new Date(b.lastBookingAt).getTime() - new Date(a.lastBookingAt).getTime());
  res.json(friendly);
};
