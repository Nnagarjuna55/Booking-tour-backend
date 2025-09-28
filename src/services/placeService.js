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
exports.deletePlace = exports.updatePlace = exports.getPlaceById = exports.getPlaces = exports.createPlace = void 0;
const Place_1 = __importDefault(require("../models/Place"));
const Slot_1 = __importDefault(require("../models/Slot"));
const slotService = __importStar(require("./slotService"));
const createPlace = async (data) => {
    const place = new Place_1.default(data);
    const saved = await place.save();
    if (data.slots && Array.isArray(data.slots) && data.slots.length) {
        for (const s of data.slots) {
            try {
                // If slot is marked as template or provided as time strings (no date), store as a SlotTemplate
                const isTemplate = s.isTemplate || (typeof s.startAt === "string" && s.startAt.length <= 8);
                if (isTemplate) {
                    // lazy import to avoid circular dependency
                    const SlotTemplate = require("../models/SlotTemplate").default;
                    const startTime = typeof s.startAt === "string" ? s.startAt : new Date(s.startAt).toTimeString().slice(0, 5);
                    const endTime = typeof s.endAt === "string" ? s.endAt : new Date(s.endAt).toTimeString().slice(0, 5);
                    await SlotTemplate.create({ placeId: saved._id, startTime, endTime, capacity: s.capacity });
                }
                else {
                    await slotService.createSlot({
                        placeId: saved._id,
                        startAt: s.startAt,
                        endAt: s.endAt,
                        capacity: s.capacity,
                    });
                }
            }
            catch (_e) {
                // ignore individual slot creation failures (overlaps, validation)
            }
        }
    }
    return saved;
};
exports.createPlace = createPlace;
const getPlaces = async () => {
    // Fetch active places and attach up to 3 upcoming ACTIVE slots for each place
    const places = await Place_1.default.find({ isActive: true }).lean().exec();
    const now = new Date();
    // For each place, fetch next 3 upcoming active slots
    for (const p of places) {
        try {
            const slots = await Slot_1.default.find({ placeId: p._id, status: "ACTIVE", startAt: { $gte: now } })
                .sort({ startAt: 1 })
                .limit(3)
                .lean()
                .exec();
            p.slots = slots;
        }
        catch (e) {
            p.slots = [];
        }
    }
    return places;
};
exports.getPlaces = getPlaces;
const getPlaceById = async (id) => {
    const place = await Place_1.default.findById(id).lean().exec();
    if (!place)
        return null;
    try {
        const now = new Date();
        const slots = await Slot_1.default.find({ placeId: place._id, status: "ACTIVE", startAt: { $gte: now } })
            .sort({ startAt: 1 })
            .lean()
            .exec();
        place.slots = slots;
    }
    catch (e) {
        place.slots = [];
    }
    return place;
};
exports.getPlaceById = getPlaceById;
const updatePlace = async (id, data) => {
    const payload = { ...data };
    if (payload.images) {
        try {
            let imgs = [];
            if (Array.isArray(payload.images))
                imgs = payload.images;
            else if (typeof payload.images === "string") {
                try {
                    const parsed = JSON.parse(payload.images);
                    imgs = Array.isArray(parsed) ? parsed : [parsed];
                }
                catch (_e) {
                    imgs = [payload.images];
                }
            }
            const sanitized = imgs
                .map((it) => {
                if (!it)
                    return null;
                if (typeof it === "string")
                    return it;
                if (typeof it === "object") {
                    if (it.secure_url && typeof it.secure_url === "string")
                        return it.secure_url;
                    if (it.url && typeof it.url === "string")
                        return it.url;
                    if (it.path && typeof it.path === "string")
                        return it.path;
                }
                return null;
            })
                .filter(Boolean);
            payload.images = sanitized;
        }
        catch (_e) {
            payload.images = [];
        }
    }
    return Place_1.default.findByIdAndUpdate(id, payload, { new: true });
};
exports.updatePlace = updatePlace;
const deletePlace = async (id) => {
    return Place_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
exports.deletePlace = deletePlace;
