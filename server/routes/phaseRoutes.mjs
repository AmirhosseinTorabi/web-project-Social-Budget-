// routes/phaseRoutes.mjs
import express from "express";
import { getCurrentPhase, setPhase } from "../controllers/phaseController.mjs";

const router = express.Router();

router.get("/", getCurrentPhase);
router.post("/", setPhase);

export default router;
