import multer from "multer";

// Use memory storage so we can upload buffers directly to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({ storage });
