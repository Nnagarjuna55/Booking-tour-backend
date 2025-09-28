// Extends Express Request with Auth payload
import { AuthRequest } from "../middleware/authMiddleware";

declare module "express-serve-static-core" {
  interface Request extends AuthRequest {}
}
