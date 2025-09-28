"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClient = exports.getClientById = exports.getClients = exports.createClient = void 0;
const Client_1 = __importDefault(require("../models/Client"));
const createClient = async (data) => {
    // normalize identifiers
    const phone = data.phone ? String(data.phone).trim() : undefined;
    const email = data.email ? String(data.email).trim().toLowerCase() : undefined;
    // If no identifier provided, create the client directly
    if (!phone && !email) {
        const client = new Client_1.default({
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            groupSize: data.groupSize ?? 1,
            notes: data.notes,
        });
        return client.save();
    }
    // Build query to find existing client by phone or email
    const orQuery = [];
    if (phone)
        orQuery.push({ phone });
    if (email)
        orQuery.push({ email });
    // Atomic upsert: if a client with phone/email exists, update details (name/email/phone)
    // This ensures admin-entered client data overwrites placeholders.
    const update = {
        $set: {
            fullName: data.fullName,
            email: email,
            phone: phone,
            groupSize: data.groupSize ?? 1,
            notes: data.notes,
        },
        $setOnInsert: {
            createdAt: new Date(),
        },
    };
    const opts = { new: true, upsert: true };
    const client = await Client_1.default.findOneAndUpdate({ $or: orQuery }, update, opts).exec();
    return client;
};
exports.createClient = createClient;
const getClients = async () => {
    return Client_1.default.find();
};
exports.getClients = getClients;
const getClientById = async (id) => {
    return Client_1.default.findById(id);
};
exports.getClientById = getClientById;
const updateClient = async (id, data) => {
    return Client_1.default.findByIdAndUpdate(id, data, { new: true });
};
exports.updateClient = updateClient;
