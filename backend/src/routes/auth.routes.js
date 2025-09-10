import express from "express";
import dotenv, { config } from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as UserController from "../controllers/user.controllers.js";

dotenv.config();

const router = express.Router();

//login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserController.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ "Logged in successfully": user.username, token });
});

export default router;
