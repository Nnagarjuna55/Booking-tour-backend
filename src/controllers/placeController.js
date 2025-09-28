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
exports.deletePlace = exports.updatePlace = exports.getPlace = exports.getPlaces = exports.createPlace = void 0;
const placeService = __importStar(require("../services/placeService"));
const cloudinary_1 = require("../utils/cloudinary");
const createPlace = async (req, res) => {
    try {
        // upload buffers to Cloudinary and collect URLs
        const files = req.files || [];
        const images = [];
        for (const f of files) {
            try {
                const url = await (0, cloudinary_1.uploadBuffer)(f.buffer);
                if (url)
                    images.push(url);
            }
            catch (_e) {
                // ignore individual upload errors
            }
        }
        // parse slots if provided as JSON string in a multipart form
        let slots;
        if (req.body.slots) {
            try {
                slots = typeof req.body.slots === "string" ? JSON.parse(req.body.slots) : req.body.slots;
            }
            catch (_e) {
                // ignore parse error
            }
        }
        const place = await placeService.createPlace({ ...req.body, images, slots });
        res.status(201).json(place);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.createPlace = createPlace;
const getPlaces = async (_req, res) => {
    const places = await placeService.getPlaces();
    res.json(places);
};
exports.getPlaces = getPlaces;
const getPlace = async (req, res) => {
    const place = await placeService.getPlaceById(req.params.id);
    if (!place)
        return res.status(404).json({ message: "Place not found" });
    res.json(place);
};
exports.getPlace = getPlace;
const updatePlace = async (req, res) => {
    try {
        // collect newly uploaded images (if any)
        const files = req.files || [];
        const newImages = [];
        for (const f of files) {
            try {
                const url = await (0, cloudinary_1.uploadBuffer)(f.buffer);
                if (url)
                    newImages.push(url);
            }
            catch (_e) {
                // ignore individual upload errors
            }
        }
        // parse slots if provided as JSON string
        let slots;
        if (req.body.slots) {
            try {
                slots = typeof req.body.slots === "string" ? JSON.parse(req.body.slots) : req.body.slots;
            }
            catch (_e) {
                // ignore parse error
            }
        }
        // If client sent images in body (could be JSON string), try to normalize
        let incomingImages = [];
        if (req.body.images) {
            try {
                let parsedImgs = [];
                if (Array.isArray(req.body.images))
                    parsedImgs = req.body.images;
                else if (typeof req.body.images === "string") {
                    // might be a JSON string like '["url1","url2"]' or a CSV
                    try {
                        const parsed = JSON.parse(req.body.images);
                        if (Array.isArray(parsed))
                            parsedImgs = parsed;
                        else
                            parsedImgs = [parsed];
                    }
                    catch (_e) {
                        // fallback: treat as single URL string
                        parsedImgs = [req.body.images];
                    }
                }
                // sanitize: only accept strings or objects with url-like properties
                incomingImages = parsedImgs
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
                    .filter((x) => !!x);
            }
            catch (_e) {
                incomingImages = [];
            }
        }
        // Build update payload, only including sanitized fields
        const updatePayload = { ...req.body };
        // Load existing place to avoid accidentally replacing images with malformed strings
        const existingPlace = await placeService.getPlaceById(req.params.id);
        if (!existingPlace)
            return res.status(404).json({ message: "Place not found" });
        // merge sanitized incoming images (explicit client list) and newly uploaded images
        // but default to existing images if client didn't provide images and no new uploads
        let finalImages = undefined;
        if (req.body.images) {
            // client explicitly provided images - use sanitized incomingImages (may be empty)
            finalImages = [...incomingImages, ...newImages];
        }
        else if (newImages.length) {
            // no explicit client images, but we uploaded new ones - append to existing
            finalImages = [...(existingPlace.images || []), ...newImages];
        }
        if (typeof finalImages !== "undefined") {
            updatePayload.images = finalImages;
        }
        if (slots)
            updatePayload.slots = slots;
        // Remove files property if present
        delete updatePayload.files;
        const place = await placeService.updatePlace(req.params.id, updatePayload);
        res.json(place);
    }
    catch (err) {
        res.status(400).json({ message: err?.message || "Failed to update place" });
    }
};
exports.updatePlace = updatePlace;
const deletePlace = async (req, res) => {
    const place = await placeService.deletePlace(req.params.id);
    res.json(place);
};
exports.deletePlace = deletePlace;
