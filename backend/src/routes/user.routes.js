import express from "express";
import jwt from "jsonwebtoken";
import { protect } from "../middlewares/auth.middlewares.js";
import * as UserController from "../controllers/user.controllers.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Admin routes
// Admin route to create an admin user
router.post("/admin/", UserController.createAdminUser);
// Admin route to get all admin users
router.get("/admin/", protect(["admin"]), UserController.getAdminUsers);
// Admin route to get an admin user by ID
router.get("/admin/:id", protect(["admin"]), UserController.getAdminUserById);
// Admin route to update an admin user
router.put("/admin/:id", protect(["admin"]), UserController.updateAdminUser);
// Admin route to upgrade a user to admin
router.post(
  "/admin/:id/upgrade",
  protect(["admin"]),
  UserController.upgradeUserToAdmin
);
router.post(
  "/admin/:id/downgrade",
  protect(["admin"]),
  UserController.downgradeAdminToUser
);
// Admin delete an user
router.delete("/admin/:id", protect(["admin"]), UserController.AdminDeleteUser);

// Public route to create a regular user
router.post("/", UserController.createUser);

// Public route to get all users
router.get("/", protect(["admin"]), UserController.getUsers);

// Public route to get a user by ID
router.get("/:id", protect(["admin"]), UserController.getUserById);

// user update route
router.put("/:id", protect(), UserController.updateUser);

// user delete route his own
router.delete("/:id", protect(), UserController.deleteOwnUser);

export default router;
