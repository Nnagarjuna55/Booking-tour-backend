import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { config } from "../config/env";

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export const uploadBuffer = (buffer: Buffer, folder = "places") => {
  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (err: any, result: any) => {
      if (err) return reject(err);
      resolve(result?.secure_url || "");
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
