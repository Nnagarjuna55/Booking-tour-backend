"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSlot = exports.updateSlot = exports.getSlotsByPlace = exports.createSlot = void 0;
const Slot_1 = __importDefault(require("../models/Slot"));
const Booking_1 = __importDefault(require("../models/Booking"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const email_1 = require("../utils/email");
const clientService = __importStar(require("./clientService"));
const env_1 = require("../config/env");
const createSlot = async (data) => {
    // ensure no overlapping ACTIVE slot exists for same place
    if (!data.placeId || !data.startAt || !data.endAt)
        throw new Error("Missing slot data");
    const overlapping = await Slot_1.default.findOne({
        placeId: data.placeId,
        status: "ACTIVE",
        $or: [
            { startAt: { $lt: data.endAt }, endAt: { $gt: data.startAt } },
        ],
    });
    if (overlapping)
        throw new Error("Overlapping slot exists");
    const slot = new Slot_1.default(data);
    const saved = await slot.save();
    try {
        await AuditLog_1.default.create({
            actorId: undefined,
            action: "CREATE_SLOT",
            entityType: "Slot",
            entityId: saved._id.toString(),
            changed: data,
            timestamp: new Date(),
        });
    }
    catch (_e) { }
    return saved;
};
exports.createSlot = createSlot;
const getSlotsByPlace = async (placeId) => {
    return Slot_1.default.find({ placeId, status: "ACTIVE" });
};
exports.getSlotsByPlace = getSlotsByPlace;
const updateSlot = async (id, data) => {
    return Slot_1.default.findByIdAndUpdate(id, data, { new: true });
};
exports.updateSlot = updateSlot;
const cancelSlot = async (id) => {
    // Atomically mark the slot cancelled
    const updated = await Slot_1.default.findByIdAndUpdate(id, { status: "CANCELLED" }, { new: true }).exec();
    if (!updated)
        throw new Error("Slot not found");
    // Find impacted bookings and mark them cancelled (best-effort)
    const bookings = await Booking_1.default.find({ slotId: id, status: { $in: ["CONFIRMED", "PENDING"] } });
    for (const b of bookings) {
        b.status = "CANCELLED";
        try {
            await b.save();
        }
        catch (e) {
            console.error("Failed to cancel booking", b._id, e);
            continue;
        }
        // send notification (best-effort) to booking client email when available
        try {
            const client = await clientService.getClientById(String(b.clientId));
            const to = client?.email || env_1.config.emailUser || "";
            if (to) {
                await (0, email_1.sendEmail)(to, "Booking Cancelled", `Booking ${b.confirmationCode} cancelled due to slot cancellation.`);
            }
        }
        catch (e) {
            console.warn("Failed to send cancellation email:", e);
        }
    }
    try {
        await AuditLog_1.default.create({
            actorId: undefined,
            action: "CANCEL_SLOT",
            entityType: "Slot",
            entityId: id,
            changed: { status: "CANCELLED" },
            timestamp: new Date(),
        });
    }
    catch (_e) { }
    return updated;
};
exports.cancelSlot = cancelSlot;
