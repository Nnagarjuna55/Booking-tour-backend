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
exports.getBookingsByPlace = exports.getBookingsByClient = exports.rescheduleBooking = exports.cancelBooking = exports.getBookings = exports.createBooking = void 0;
const bookingService = __importStar(require("../services/bookingService"));
const clientService = __importStar(require("../services/clientService"));
const mongoose_1 = __importDefault(require("mongoose"));
const createBooking = async (req, res) => {
    try {
        const body = req.body;
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
            if (!mongoose_1.default.Types.ObjectId.isValid(clientId)) {
                if (client) {
                    const created = await clientService.createClient(client);
                    clientId = created._id.toString();
                }
                else {
                    return res.status(400).json({ message: "Invalid clientId. Provide a valid Mongo ObjectId or omit clientId and provide client details." });
                }
            }
            else {
                // clientId is valid. If admin also provided a client object, update that client record
                if (client) {
                    try {
                        await clientService.updateClient(clientId, client);
                    }
                    catch (e) {
                        // non-fatal: log and continue using existing clientId
                        // eslint-disable-next-line no-console
                        console.warn("Failed to update existing client with provided details:", e);
                    }
                }
            }
        }
        else if (client) {
            const created = await clientService.createClient(client);
            clientId = created._id.toString();
        }
        if (!clientId)
            return res.status(400).json({ message: "clientId or client object required" });
        if (!placeId || !slotId || !quantity || isNaN(quantity) || quantity <= 0)
            return res.status(400).json({ message: "placeId, slotId and positive quantity are required" });
        // Support tokens that include either `id` or `_id` in the decoded payload
        const actorId = req.user?.id || req.user?._id;
        const booking = await bookingService.createBooking(clientId, placeId, slotId, quantity, actorId);
        const reservedQuantity = booking.quantity;
        res.status(201).json({ booking, requestedQuantity: quantity, reservedQuantity });
    }
    catch (err) {
        const status = err?.statusCode || 400;
        res.status(status).json({ message: err.message });
    }
};
exports.createBooking = createBooking;
const getBookings = async (_req, res) => {
    const bookings = await bookingService.getBookings();
    res.json(bookings);
};
exports.getBookings = getBookings;
const cancelBooking = async (req, res) => {
    try {
        const booking = await bookingService.cancelBooking(req.params.id);
        res.json(booking);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.cancelBooking = cancelBooking;
const rescheduleBooking = async (req, res) => {
    try {
        const booking = await bookingService.rescheduleBooking(req.params.id, req.body.newSlotId);
        res.json(booking);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.rescheduleBooking = rescheduleBooking;
const getBookingsByClient = async (req, res) => {
    const { clientId } = req.params;
    const bookings = await bookingService.getBookingsByClient(clientId);
    // Enhance returned bookings with friendly fields
    const friendly = bookings.map((b) => ({
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
exports.getBookingsByClient = getBookingsByClient;
const getBookingsByPlace = async (req, res) => {
    const { placeId } = req.params;
    const bookings = await bookingService.getBookingsByPlace(placeId);
    // Aggregate bookings by client to return unique clients who booked this place
    const map = new Map();
    bookings.forEach((b) => {
        const cid = b.clientId?._id?.toString();
        if (!cid)
            return;
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
        }
        else {
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
exports.getBookingsByPlace = getBookingsByPlace;
