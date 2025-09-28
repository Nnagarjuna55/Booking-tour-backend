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
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSlot = exports.updateSlot = exports.getSlotsByPlace = exports.createSlot = void 0;
const slotService = __importStar(require("../services/slotService"));
const createSlot = async (req, res) => {
    try {
        const payload = req.body;
        const slot = await slotService.createSlot(payload);
        res.status(201).json(slot);
    }
    catch (err) {
        // include limited context to help debugging in dev
        const debugMsg = err?.message || "Invalid slot data";
        res.status(400).json({ message: debugMsg });
    }
};
exports.createSlot = createSlot;
const getSlotsByPlace = async (req, res) => {
    const slots = await slotService.getSlotsByPlace(req.params.placeId);
    res.json(slots);
};
exports.getSlotsByPlace = getSlotsByPlace;
const updateSlot = async (req, res) => {
    const slot = await slotService.updateSlot(req.params.id, req.body);
    res.json(slot);
};
exports.updateSlot = updateSlot;
const cancelSlot = async (req, res) => {
    const slot = await slotService.cancelSlot(req.params.id);
    res.json(slot);
};
exports.cancelSlot = cancelSlot;
