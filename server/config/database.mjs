import sqlite3 from "sqlite3";
import { open } from "sqlite";

const openDb = async () => {
  return open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
};

const initDb = async () => {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      description TEXT,
      cost REAL,
      FOREIGN KEY (userId) REFERENCES Users(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Phases (
      id INTEGER PRIMARY KEY,
      currentPhase INTEGER
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Budgets (
      id INTEGER PRIMARY KEY,
      amount REAL
    )
  `);

  // Create Preferences table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      proposalId INTEGER,
      score INTEGER,
      FOREIGN KEY (userId) REFERENCES Users(id),
      FOREIGN KEY (proposalId) REFERENCES Proposals(id)
    )
  `);

  await db.run("INSERT OR IGNORE INTO Phases (id, currentPhase) VALUES (1, 0)");
  await db.run("INSERT OR IGNORE INTO Budgets (id, amount) VALUES (1, 0)");

  console.log("Database initialized successfully");
};

export { openDb, initDb };
