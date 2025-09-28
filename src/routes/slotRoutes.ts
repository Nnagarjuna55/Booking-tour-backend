import { Router } from "express";
import {
  createSlot,
  getSlotsByPlace,
  updateSlot,
  cancelSlot,
} from "../controllers/slotController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/", createSlot);
router.get("/:placeId", getSlotsByPlace);
router.patch("/:id", updateSlot);
router.post("/:id/cancel", cancelSlot);

export default router;
