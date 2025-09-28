"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBuffer = void 0;
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
const env_1 = require("../config/env");
cloudinary_1.v2.config({
    cloud_name: env_1.config.cloudinaryCloudName,
    api_key: env_1.config.cloudinaryApiKey,
    api_secret: env_1.config.cloudinaryApiSecret,
});
const uploadBuffer = (buffer, folder = "places") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder }, (err, result) => {
            if (err)
                return reject(err);
            resolve(result?.secure_url || "");
        });
        streamifier_1.default.createReadStream(buffer).pipe(uploadStream);
    });
};
exports.uploadBuffer = uploadBuffer;
