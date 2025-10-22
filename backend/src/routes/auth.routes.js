import express from "express";
import dotenv, { config } from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as UserController from "../controllers/user.controllers.js";
import passport from "../config/passport.js";


dotenv.config();

const router = express.Router();

//login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserController.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Please log in with Google",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ "Logged in successfully": user.username, token });
  } catch (err) {
    console.error("Error logging in:", err);
    next(err);
  }
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    // Successful authentication, generate JWT and send to client
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, user: req.user });
  }
);

export default router;
