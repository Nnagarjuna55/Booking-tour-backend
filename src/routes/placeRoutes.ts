import { Router } from "express";
import {
  createPlace,
  getPlaces,
  getPlace,
  updatePlace,
  deletePlace,
} from "../controllers/placeController";
import { authMiddleware } from "../middleware/authMiddleware";
import { upload } from "../middleware/upload";

const router = Router();

router.use(authMiddleware);

// Ensure multer middleware runs for POST / so file buffers are available in req.files
router.post("/", upload.array("images", 10), createPlace);
router.get("/", getPlaces);
router.get("/:id", getPlace);
// Ensure PATCH uses multer so file buffers are available on req.files
router.patch("/:id", upload.array("images", 10), updatePlace);
router.delete("/:id", deletePlace);

export default router;
