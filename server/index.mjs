import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.mjs";
import budgetRoutes from "./routes/budgetRoutes.mjs";
import proposalRoutes from "./routes/proposalRoutes.mjs";
import phaseRoutes from "./routes/phaseRoutes.mjs";
import preferenceRoutes from "./routes/preferenceRoutes.mjs";
import { openDb, initDb } from "./config/database.mjs";
import { authenticate } from "./controllers/userController.mjs";
import bcrypt from "bcrypt";

const app = express();
const port = 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/budget", authenticate, budgetRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/phase", phaseRoutes);
app.use("/api/preferences", authenticate, preferenceRoutes);

const createMockUsersAndInitialPhase = async () => {
  const db = await openDb();
  const users = [
    { username: "admin", password: "adminpass", role: "admin" },
    { username: "user1", password: "user1pass", role: "user" },
    { username: "user2", password: "user2pass", role: "user" },
    { username: "user3", password: "user3pass", role: "user" },
  ];

  for (const user of users) {
    const existingUser = await db.get(
      "SELECT * FROM Users WHERE username = ?",
      [user.username]
    );
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await db.run(
        "INSERT INTO Users (username, password, role) VALUES (?, ?, ?)",
        [user.username, hashedPassword, user.role]
      );
      console.log(`User created: ${user.username}`);
    } else {
      console.log(`User already exists: ${user.username}`);
    }
  }

  const existingPhase = await db.get("SELECT * FROM Phases WHERE id = 1");
  if (!existingPhase) {
    await db.run("INSERT INTO Phases (id, currentPhase) VALUES (1, 0)");
    console.log("Initial phase set");
  } else {
    console.log(`Current phase: ${existingPhase.currentPhase}`);
  }

  const existingBudget = await db.get("SELECT * FROM Budgets WHERE id = 1");
  if (!existingBudget) {
    await db.run("INSERT INTO Budgets (id, amount) VALUES (1, 0)");
    console.log("Initial budget set");
  } else {
    console.log(`Current budget: ${existingBudget.amount}`);
  }
};

initDb()
  .then(async () => {
    await createMockUsersAndInitialPhase();
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
  });
