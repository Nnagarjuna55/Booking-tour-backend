import { Request, Response } from "express";
import * as placeService from "../services/placeService";
import { uploadBuffer } from "../utils/cloudinary";

export const createPlace = async (req: any, res: Response) => {
  try {
    // upload buffers to Cloudinary and collect URLs
    const files = (req.files as any[] | undefined) || [];
    const uploadedImages: string[] = [];
    for (const f of files) {
      try {
        const url = await uploadBuffer(f.buffer);
        if (url) uploadedImages.push(url);
      } catch (_e) {
        // ignore individual upload errors
      }
    }

    // If client provided `images` in the body (could be JSON string or array or objects),
    // sanitize and merge with uploaded images so we only persist valid URL strings.
    let incomingImages: string[] = [];
    if (req.body.images) {
      try {
        let parsedImgs: any[] = [];
        if (Array.isArray(req.body.images)) parsedImgs = req.body.images;
        else if (typeof req.body.images === "string") {
          try {
            const parsed = JSON.parse(req.body.images);
            if (Array.isArray(parsed)) parsedImgs = parsed;
            else parsedImgs = [parsed];
          } catch (_e) {
            // fallback - treat as a single URL string
            parsedImgs = [req.body.images];
          }
        }

        incomingImages = parsedImgs
          .map((it) => {
            if (!it) return null;
            if (typeof it === "string") return it;
            if (typeof it === "object") {
              if (it.secure_url && typeof it.secure_url === "string") return it.secure_url;
              if (it.url && typeof it.url === "string") return it.url;
              if (it.path && typeof it.path === "string") return it.path;
            }
            return null;
          })
          .filter(Boolean) as string[];
      } catch (_e) {
        incomingImages = [];
      }
    }

    // Merge uploaded images and incoming image URLs (uploadedImages take precedence)
    const images = [...incomingImages, ...uploadedImages].filter(Boolean);

    // parse slots if provided as JSON string in a multipart form
    let slots: any[] | undefined;
    if (req.body.slots) {
      try {
        slots = typeof req.body.slots === "string" ? JSON.parse(req.body.slots) : req.body.slots;
      } catch (_e) {
        // ignore parse error
      }
    }

  const place = await placeService.createPlace({ ...req.body, images, slots });
  // debug: show which images we saved for this place (helps diagnose empty image issues)
  // eslint-disable-next-line no-console
  console.debug("[createPlace] saved images:", images);
  res.status(201).json(place);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getPlaces = async (_req: Request, res: Response) => {
  const places = await placeService.getPlaces();
  res.json(places);
};

export const getPlace = async (req: any, res: Response) => {
  const place = await placeService.getPlaceById(req.params.id);
  if (!place) return res.status(404).json({ message: "Place not found" });
  res.json(place);
};

export const updatePlace = async (req: any, res: Response) => {
  try {
    // collect newly uploaded images (if any)
    const files = (req.files as any[] | undefined) || [];
    const newImages: string[] = [];
    for (const f of files) {
      try {
        const url = await uploadBuffer(f.buffer);
        if (url) newImages.push(url);
      } catch (_e) {
        // ignore individual upload errors
      }
    }

    // parse slots if provided as JSON string
    let slots: any[] | undefined;
    if (req.body.slots) {
      try {
        slots = typeof req.body.slots === "string" ? JSON.parse(req.body.slots) : req.body.slots;
      } catch (_e) {
        // ignore parse error
      }
    }

    // If client sent images in body (could be JSON string), try to normalize
    let incomingImages: string[] = [];
    if (req.body.images) {
      try {
        let parsedImgs: any[] = [];
        if (Array.isArray(req.body.images)) parsedImgs = req.body.images;
        else if (typeof req.body.images === "string") {
          // might be a JSON string like '["url1","url2"]' or a CSV
          try {
            const parsed = JSON.parse(req.body.images);
            if (Array.isArray(parsed)) parsedImgs = parsed;
            else parsedImgs = [parsed];
          } catch (_e) {
            // fallback: treat as single URL string
            parsedImgs = [req.body.images];
          }
        }

        // sanitize: only accept strings or objects with url-like properties
        incomingImages = parsedImgs
          .map((it) => {
            if (!it) return null;
            if (typeof it === "string") return it;
            if (typeof it === "object") {
              if (it.secure_url && typeof it.secure_url === "string") return it.secure_url;
              if (it.url && typeof it.url === "string") return it.url;
              if (it.path && typeof it.path === "string") return it.path;
            }
            return null;
          })
          .filter((x) => !!x) as string[];
      } catch (_e) {
        incomingImages = [];
      }
    }

    // Build update payload, only including sanitized fields
    const updatePayload: any = { ...req.body };

    // Load existing place to avoid accidentally replacing images with malformed strings
    const existingPlace = await placeService.getPlaceById(req.params.id);
    if (!existingPlace) return res.status(404).json({ message: "Place not found" });

    // merge sanitized incoming images (explicit client list) and newly uploaded images
    // but default to existing images if client didn't provide images and no new uploads
    let finalImages: string[] | undefined = undefined;
    if (req.body.images) {
      // client explicitly provided images - use sanitized incomingImages (may be empty)
      finalImages = [...incomingImages, ...newImages];
    } else if (newImages.length) {
      // no explicit client images, but we uploaded new ones - append to existing
      finalImages = [...(existingPlace.images || []), ...newImages];
    }

    if (typeof finalImages !== "undefined") {
      updatePayload.images = finalImages;
    }

    if (slots) updatePayload.slots = slots;

    // Remove files property if present
    delete updatePayload.files;

    const place = await placeService.updatePlace(req.params.id, updatePayload);
    res.json(place);
  } catch (err: any) {
    res.status(400).json({ message: err?.message || "Failed to update place" });
  }
};

export const deletePlace = async (req: any, res: Response) => {
  const place = await placeService.deletePlace(req.params.id);
  res.json(place);
};
