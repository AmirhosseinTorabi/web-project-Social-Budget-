import express from "express";
import { getBudget, setBudget } from "../controllers/budgetController.mjs";
import { authenticate } from "../controllers/userController.mjs";

const router = express.Router();

router.get("/", authenticate, getBudget);
router.post("/", authenticate, setBudget);

export default router;
