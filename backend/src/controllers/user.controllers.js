import UserService from "../services/user.services.js";
import { errorHandler } from "../middlewares/errorHandler.middlewares.js";
import User from "../models/user.models.js";

const userService = new UserService(User);

export const createAdminUser = async (req, res) => {
  try {
    const admin = await userService.createAdminUser(req.body);
    res.status(201).json(admin);
  } catch (error) {
    console.error("Error creating admin user: ", error.message);
    res.status(400).json({ message: error.message });
  }
};
export const getAdminUsers = async (req, res) => {
  try {
    const admins = await userService.getAdminUsers();
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error getting admin users: ", error.message);
    res.status(500).json({ message: error.message });
  }
};
export const getAdminUserById = async (req, res) => {
  try {
    const admin = await userService.getAdminUserById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error getting admin user by ID: ", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const admin = await userService.updateAdminUser(req.params.id, req.body);
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error updating admin user: ", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const upgradeUserToAdmin = async (req, res) => {
  try {
    const user = await userService.upgradeUserToAdmin(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error upgrading user to admin: ", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const downgradeAdminToUser = async (req, res) => {
  try {
    const user = await userService.downgradeAdminToUser(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error downgrading admin to user: ", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user: ", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users: ", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user by ID: ", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await userService.getUserByEmail(email);
    return user;
  } catch (error) {
    console.error("Error getting user by email: ", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user: ", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const AdminDeleteUser = async (req, res) => {
  try {
    await userService.AdminDeleteUser(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user: ", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteOwnUser = async (req, res) => {
  try {
    await userService.deleteOwnUser(req.user.id, req.user);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user: ", error.message);
    res.status(400).json({ message: error.message });
  }
};
