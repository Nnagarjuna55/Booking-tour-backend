import { Router } from "express";
import {
  createBooking,
  getBookings,
  cancelBooking,
  rescheduleBooking,
} from "../controllers/bookingController";
import { getBookingsByClient, getBookingsByPlace } from "../controllers/bookingController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/", createBooking);
router.get("/", getBookings);
router.get("/client/:clientId", getBookingsByClient);
router.get("/place/:placeId", getBookingsByPlace);
router.post("/:id/cancel", cancelBooking);
router.post("/:id/reschedule", rescheduleBooking);

export default router;
