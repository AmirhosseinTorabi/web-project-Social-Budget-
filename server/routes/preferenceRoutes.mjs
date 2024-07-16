// routes/preferencesRoutes.mjs
import express from "express";
import { authenticate } from "../controllers/userController.mjs";
import {
  upsertPreference,
  getPreferences,
  deletePreference,
} from "../controllers/preferenceController.mjs";

const router = express.Router();

router.post("/", authenticate, upsertPreference);
router.get("/", authenticate, getPreferences);
router.delete("/", authenticate, deletePreference);

export default router;
