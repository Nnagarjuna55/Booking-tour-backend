import Booking from "../models/Booking";
import type { PipelineStage } from "mongoose";

export const getSummaryReport = async (from?: Date, to?: Date) => {
  const query: any = {};
  if (from && to) {
    query.createdAt = { $gte: from, $lte: to };
  }

  const totalBookings = await Booking.countDocuments(query);
  const confirmed = await Booking.countDocuments({
    ...query,
    status: "CONFIRMED",
  });
  const cancelled = await Booking.countDocuments({
    ...query,
    status: "CANCELLED",
  });

  return { totalBookings, confirmed, cancelled };
};

export const getTopPlaces = async (limit = 5) => {
  const pipeline = [
    { $match: { status: "CONFIRMED" } },
    { $group: { _id: "$placeId", total: { $sum: "$quantity" } } },
    { $sort: { total: -1 } },
    { $limit: limit },
  ];

  return Booking.aggregate(pipeline as PipelineStage[]);
};

export const getSlotUtilization = async (placeId: string) => {
  const pipeline = [
    { $match: { placeId, status: "CONFIRMED" } },
    { $group: { _id: "$slotId", total: { $sum: "$quantity" } } },
  ];

  return Booking.aggregate(pipeline as PipelineStage[]);
};

import Place from "../models/Place";
import Slot from "../models/Slot";

export const getActivePlacesCount = async () => {
  // Count places that are active and have at least one ACTIVE slot where bookedCount < capacity
  const pipeline = [
    { $match: { status: "ACTIVE", $expr: { $lt: ["$bookedCount", "$capacity"] } } },
    { $group: { _id: "$placeId" } },
    { $lookup: { from: "places", localField: "_id", foreignField: "_id", as: "place" } },
    { $unwind: "$place" },
    { $match: { "place.isActive": true } },
    { $count: "count" },
  ];

  const res = await Slot.aggregate(pipeline as any);
  return res && res.length ? res[0].count : 0;
};
