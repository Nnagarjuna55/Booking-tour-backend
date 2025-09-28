"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const placeController_1 = require("../controllers/placeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
// Ensure multer middleware runs for POST / so file buffers are available in req.files
router.post("/", upload_1.upload.array("images", 10), placeController_1.createPlace);
router.get("/", placeController_1.getPlaces);
router.get("/:id", placeController_1.getPlace);
// Ensure PATCH uses multer so file buffers are available on req.files
router.patch("/:id", upload_1.upload.array("images", 10), placeController_1.updatePlace);
router.delete("/:id", placeController_1.deletePlace);
exports.default = router;
