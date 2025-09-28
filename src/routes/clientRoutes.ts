import { Router } from "express";
import {
  createClient,
  getClients,
  getClient,
  updateClient,
} from "../controllers/clientController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/", createClient);
router.get("/", getClients);
router.get("/:id", getClient);
router.patch("/:id", updateClient);

export default router;
