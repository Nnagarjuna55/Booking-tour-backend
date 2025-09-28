import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { config } from "../config/env";

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export const uploadBuffer = (buffer: Buffer, folder = "places") => {
  // Ensure credentials are present
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return Promise.reject(new Error("Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in env."));
  }

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (err: any, result: any) => {
      if (err) return reject(err);
      // eslint-disable-next-line no-console
      console.debug('[cloudinary] upload result secure_url:', result?.secure_url);
      resolve(result?.secure_url || "");
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
