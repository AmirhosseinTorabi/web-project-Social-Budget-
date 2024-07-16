// controllers/preferencesController.mjs
import { openDb } from "../config/database.mjs";

// Insert or update preference
export const upsertPreference = async (req, res) => {
  const { proposalId, score } = req.body;
  const userId = req.userId;

  try {
    const db = await openDb();
    const existingPreference = await db.get(
      "SELECT * FROM Preferences WHERE proposalId = ? AND userId = ?",
      [proposalId, userId]
    );

    if (existingPreference) {
      await db.run(
        "UPDATE Preferences SET score = ? WHERE proposalId = ? AND userId = ?",
        [score, proposalId, userId]
      );
    } else {
      await db.run(
        "INSERT INTO Preferences (proposalId, userId, score) VALUES (?, ?, ?)",
        [proposalId, userId, score]
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to upsert preference" });
  }
};

// Get preferences for the logged-in user
export const getPreferences = async (req, res) => {
  const userId = req.userId;

  try {
    const db = await openDb();
    const preferences = await db.all(
      "SELECT * FROM Preferences WHERE userId = ?",
      [userId]
    );
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
};

// Delete preference
export const deletePreference = async (req, res) => {
  const { proposalId } = req.body;
  const userId = req.userId;

  try {
    const db = await openDb();
    await db.run(
      "DELETE FROM Preferences WHERE proposalId = ? AND userId = ?",
      [proposalId, userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete preference" });
  }
};
