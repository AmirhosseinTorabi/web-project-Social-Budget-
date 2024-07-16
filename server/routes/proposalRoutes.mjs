import express from "express";
import { authenticate } from "../controllers/userController.mjs";
import {
  getProposals,
  getProposalsByUser,
  addProposal,
  updateProposal,
  deleteProposal,
  getApprovedProposals,
  resetPhase,
} from "../controllers/proposalController.mjs";

const router = express.Router();

router.get("/user", authenticate, getProposalsByUser);
router.get("/", authenticate, getProposals);
router.post("/", authenticate, addProposal);
router.put("/:id", authenticate, updateProposal);
router.delete("/:id", authenticate, deleteProposal);
router.get("/approved", getApprovedProposals);
router.post("/reset", authenticate, resetPhase);

export default router;
