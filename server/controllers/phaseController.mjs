// controllers/phaseController.mjs
import jwt from "jsonwebtoken";

import { openDb } from "../config/database.mjs";

const secret = "your_jwt_secret"; // Should be in environment variables
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  jwt.verify(token, secret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Failed to authenticate token" });
    }
    req.userId = decoded.userId;
    req.role = decoded.role;

    const db = await openDb();
    const phase = await db.get("SELECT currentPhase FROM Phases WHERE id = 1");
    req.currentPhase = phase.currentPhase;

    next();
  });
};

export const getCurrentPhase = async (req, res) => {
  try {
    const db = await openDb();
    const phase = await db.get("SELECT currentPhase FROM Phases WHERE id = 1");
    res.json(phase);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch phase" });
  }
};

export const setPhase = async (req, res) => {
  const { phase } = req.body;
  try {
    const db = await openDb();
    await db.run("UPDATE Phases SET currentPhase = ? WHERE id = 1", [phase]);
    res.json({ success: true, message: "Phase updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update phase" });
  }
};
