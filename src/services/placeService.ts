import Place, { IPlace } from "../models/Place";
import Slot from "../models/Slot";
import * as slotService from "./slotService";
import mongoose from "mongoose";

export const createPlace = async (data: Partial<IPlace> & { slots?: any[] }) => {
  const place = new Place(data);
  const saved = await place.save();

  if (data.slots && Array.isArray(data.slots) && data.slots.length) {
    for (const s of data.slots) {
      try {
        // If slot is marked as template or provided as time strings (no date), store as a SlotTemplate
        const isTemplate = s.isTemplate || (typeof s.startAt === "string" && s.startAt.length <= 8);
        if (isTemplate) {
          // lazy import to avoid circular dependency
          const SlotTemplate = require("../models/SlotTemplate").default;
          const startTime = typeof s.startAt === "string" ? s.startAt : new Date(s.startAt).toTimeString().slice(0,5);
          const endTime = typeof s.endAt === "string" ? s.endAt : new Date(s.endAt).toTimeString().slice(0,5);
          await SlotTemplate.create({ placeId: saved._id, startTime, endTime, capacity: s.capacity });
        } else {
          await slotService.createSlot({
            placeId: saved._id,
            startAt: s.startAt,
            endAt: s.endAt,
            capacity: s.capacity,
          });
        }
      } catch (_e) {
        // ignore individual slot creation failures (overlaps, validation)
      }
    }
  }

  return saved;
};

export const getPlaces = async () => {
  // Fetch active places and attach up to 3 upcoming ACTIVE slots for each place
  const places = await Place.find({ isActive: true }).lean().exec();
  const now = new Date();
  // For each place, fetch next 3 upcoming active slots
  for (const p of places as any[]) {
    try {
      const slots = await Slot.find({ placeId: p._id, status: "ACTIVE", startAt: { $gte: now } })
        .sort({ startAt: 1 })
        .limit(3)
        .lean()
        .exec();
      p.slots = slots;
    } catch (e) {
      p.slots = [];
    }
  }
  return places;
};

export const getPlaceById = async (id: string) => {
  const place = await Place.findById(id).lean().exec();
  if (!place) return null;
  try {
    const now = new Date();
    const slots = await Slot.find({ placeId: place._id, status: "ACTIVE", startAt: { $gte: now } })
      .sort({ startAt: 1 })
      .lean()
      .exec();
    (place as any).slots = slots;
  } catch (e) {
    (place as any).slots = [];
  }
  return place;
};

export const updatePlace = async (id: string, data: Partial<IPlace>) => {
  const payload: any = { ...data };

  if (payload.images) {
    try {
      let imgs: any[] = [];
      if (Array.isArray(payload.images)) imgs = payload.images;
      else if (typeof payload.images === "string") {
        try {
          const parsed = JSON.parse(payload.images);
          imgs = Array.isArray(parsed) ? parsed : [parsed];
        } catch (_e) {
          imgs = [payload.images];
        }
      }

      const sanitized = imgs
        .map((it) => {
          if (!it) return null;
          if (typeof it === "string") return it;
          if (typeof it === "object") {
            if (it.secure_url && typeof it.secure_url === "string") return it.secure_url;
            if (it.url && typeof it.url === "string") return it.url;
            if (it.path && typeof it.path === "string") return it.path;
          }
          return null;
        })
        .filter(Boolean) as string[];

      payload.images = sanitized;
    } catch (_e) {
      payload.images = [];
    }
  }

  return Place.findByIdAndUpdate(id, payload, { new: true });
};

export const deletePlace = async (id: string) => {
  return Place.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
