import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { openDb } from "../config/database.mjs";

const secret = "your_jwt_secret"; // Should be in environment variables

export const register = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const db = await openDb();
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      "INSERT INTO Users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role]
    );
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const db = await openDb();
    const user = await db.get("SELECT * FROM Users WHERE username = ?", [
      username,
    ]);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, secret, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Failed to login user" });
  }
};

export const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Failed to authenticate token" });
    }
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  });
};
