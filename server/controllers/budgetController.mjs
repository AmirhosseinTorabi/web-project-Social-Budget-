import { openDb } from "../config/database.mjs";

export const setBudget = async (req, res) => {
  const { budget } = req.body;
  const db = await openDb();

  if (budget <= 0) {
    return res.status(400).json({
      success: false,
      message: "The budget should be greater than zero",
    });
  }

  try {
    await db.run("UPDATE Budgets SET amount = ? WHERE id = 1", [budget]);
    await db.run("UPDATE Phases SET currentPhase = 1 WHERE id = 1");

    res.json({
      success: true,
      message: "Budget set and phase changed to Phase 1",
      amount: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to set budget and change phase",
    });
  }
};

export const getBudget = async (req, res) => {
  const db = await openDb();
  try {
    const budget = await db.get("SELECT amount FROM Budgets WHERE id = 1");
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch budget" });
  }
};
