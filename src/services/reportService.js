"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivePlacesCount = exports.getSlotUtilization = exports.getTopPlaces = exports.getSummaryReport = void 0;
const Booking_1 = __importDefault(require("../models/Booking"));
const getSummaryReport = async (from, to) => {
    const query = {};
    if (from && to) {
        query.createdAt = { $gte: from, $lte: to };
    }
    const totalBookings = await Booking_1.default.countDocuments(query);
    const confirmed = await Booking_1.default.countDocuments({
        ...query,
        status: "CONFIRMED",
    });
    const cancelled = await Booking_1.default.countDocuments({
        ...query,
        status: "CANCELLED",
    });
    return { totalBookings, confirmed, cancelled };
};
exports.getSummaryReport = getSummaryReport;
const getTopPlaces = async (limit = 5) => {
    const pipeline = [
        { $match: { status: "CONFIRMED" } },
        { $group: { _id: "$placeId", total: { $sum: "$quantity" } } },
        { $sort: { total: -1 } },
        { $limit: limit },
    ];
    return Booking_1.default.aggregate(pipeline);
};
exports.getTopPlaces = getTopPlaces;
const getSlotUtilization = async (placeId) => {
    const pipeline = [
        { $match: { placeId, status: "CONFIRMED" } },
        { $group: { _id: "$slotId", total: { $sum: "$quantity" } } },
    ];
    return Booking_1.default.aggregate(pipeline);
};
exports.getSlotUtilization = getSlotUtilization;
const Slot_1 = __importDefault(require("../models/Slot"));
const getActivePlacesCount = async () => {
    // Count places that are active and have at least one ACTIVE slot where bookedCount < capacity
    const pipeline = [
        { $match: { status: "ACTIVE", $expr: { $lt: ["$bookedCount", "$capacity"] } } },
        { $group: { _id: "$placeId" } },
        { $lookup: { from: "places", localField: "_id", foreignField: "_id", as: "place" } },
        { $unwind: "$place" },
        { $match: { "place.isActive": true } },
        { $count: "count" },
    ];
    const res = await Slot_1.default.aggregate(pipeline);
    return res && res.length ? res[0].count : 0;
};
exports.getActivePlacesCount = getActivePlacesCount;
