import { openDb } from "../config/database.mjs";

// Get all proposals for the logged-in user
export const getProposals = async (req, res) => {
  const db = await openDb();
  try {
    let proposals;
    if (req.role === "admin" || req.role === "user" || req.currentPhase === 2) {
      proposals = await db.all("SELECT * FROM Proposals");
    } else {
      proposals = await db.all("SELECT * FROM Proposals WHERE userId = ?", [
        req.userId,
      ]);
    }
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch proposals" });
  }
};

// Get proposals by user
export const getProposalsByUser = async (req, res) => {
  const db = await openDb();
  try {
    const userId = req.userId; // Assuming userId is set in the authenticate middleware
    const proposals = await db.all("SELECT * FROM Proposals WHERE userId = ?", [
      userId,
    ]);
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch proposals" });
  }
};

// Add a new proposal
export const addProposal = async (req, res) => {
  const db = await openDb();
  const { description, cost } = req.body;
  const userId = req.userId;

  try {
    const budget = await db.get("SELECT amount FROM Budgets WHERE id = 1");

    if (cost > budget.amount) {
      return res.status(400).json({ error: "Cost exceeds defined budget" });
    }

    const userProposals = await db.all(
      "SELECT * FROM Proposals WHERE userId = ?",
      [userId]
    );

    if (userProposals.length >= 3) {
      return res
        .status(400)
        .json({ error: "You can only submit up to 3 proposals" });
    }

    await db.run(
      "INSERT INTO Proposals (userId, description, cost) VALUES (?, ?, ?)",
      [userId, description, cost]
    );

    res.status(201).json({ message: "Proposal added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add proposal" });
  }
};

// Update a proposal
export const updateProposal = async (req, res) => {
  const { id } = req.params;
  const { description, cost } = req.body;
  const db = await openDb();

  try {
    await db.run(
      "UPDATE Proposals SET description = ?, cost = ? WHERE id = ?",
      [description, cost, id]
    );
    res.json({ message: "Proposal updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update proposal" });
  }
};

// Delete a proposal
export const deleteProposal = async (req, res) => {
  const db = await openDb();
  const { id } = req.params;
  const userId = req.userId;

  try {
    await db.run("DELETE FROM Proposals WHERE id = ? AND userId = ?", [
      id,
      userId,
    ]);
    res.json({ message: "Proposal deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete proposal" });
  }
};

// Terminate proposal phase
export const terminateProposalPhase = async (req, res) => {
  const db = await openDb();

  try {
    await db.run("UPDATE Phases SET currentPhase = 2 WHERE id = 1");
    res.json({ message: "Proposal phase terminated, moved to Phase 2" });
  } catch (error) {
    res.status(500).json({ error: "Failed to terminate proposal phase" });
  }
};

// Get approved and non-approved proposals
export const getApprovedProposals = async (req, res) => {
  const db = await openDb();
  try {
    const budget = await db.get("SELECT amount FROM Budgets WHERE id = 1");
    const proposals = await db.all("SELECT * FROM Proposals");
    const preferences = await db.all(
      "SELECT proposalId, SUM(score) as totalScore FROM Preferences GROUP BY proposalId"
    );

    // Merge proposals with their scores
    const proposalsWithScores = proposals.map((proposal) => {
      const preference = preferences.find((p) => p.proposalId === proposal.id);
      return {
        ...proposal,
        totalScore: preference ? preference.totalScore : 0,
      };
    });

    // Sort proposals by totalScore
    proposalsWithScores.sort((a, b) => b.totalScore - a.totalScore);

    let approvedProposals = [];
    let nonApprovedProposals = [];
    let cumulativeCost = 0;
    let startNon = false;
    for (let proposal of proposalsWithScores) {
      if (cumulativeCost + proposal.cost <= budget.amount && !startNon) {
        approvedProposals.push(proposal);
        cumulativeCost += proposal.cost;
      } else {
        startNon = true;
        nonApprovedProposals.push(proposal);
      }
    }

    res.json({
      approvedProposals,
      nonApprovedProposals,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch proposals" });
  }
};

// Reset phase to 0
export const resetPhase = async (req, res) => {
  const db = await openDb();
  try {
    await db.run("UPDATE Phases SET currentPhase = 0 WHERE id = 1");
    await db.run("DELETE FROM Proposals");
    await db.run("DELETE FROM Preferences");
    await db.run("UPDATE Budgets SET amount = 0 WHERE id = 1"); // Reset budget to 0
    res.json({ message: "Reset to Phase 0 successful" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset phase" });
  }
};
