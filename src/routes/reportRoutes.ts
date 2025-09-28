import { Router } from "express";
import {
  getSummary,
  getTopPlaces,
  getSlotUtilization,
} from "../controllers/reportController";
import { getActivePlacesCount } from "../controllers/reportController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/summary", getSummary);
router.get("/top-places", getTopPlaces);
router.get("/utilization/:placeId", getSlotUtilization);
router.get("/active-places", getActivePlacesCount);

export default router;
