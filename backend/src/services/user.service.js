import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
class UserService {
  constructor(UserModel) {
    this.User = UserModel;
  }

  async createAdminUser(adminData) {
    try {
      const existingAdmin = await User.findOne({
        where: { email: adminData.email },
      });
      if (existingAdmin) {
        throw new Error("Email already exists");
      }
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      const admin = await User.create({
        ...adminData,
        role: "admin",
        password: hashedPassword,
      });
      return admin;
    } catch (error) {
      throw error;
    }
  }
  async getAdminUsers() {
    try {
      const admins = await User.findAll({
        where: { role: "admin" },
        attributes: { exclude: ["password"] },
      });
      return admins;
    } catch (error) {
      throw error;
    }
  }

  async getAdminUserById(id) {
    try {
      const admin = await User.findOne({
        where: { id, role: "admin" },
        attributes: { exclude: ["password"] },
      });
      return admin;
    } catch (error) {
      throw error;
    }
  }

  async updateAdminUser(id, adminData) {
    try {
      const admin = await User.findOne({ where: { id, role: "admin" } });
      if (!admin) {
        throw new Error("Admin not found");
      }
      await admin.update(adminData);
      return admin;
    } catch (error) {
      throw error;
    }
  }

  async upgradeUserToAdmin(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }
      user.role = "admin";
      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async downgradeAdminToUser(id) {
    try {
      const admin = await User.findOne({ where: { id, role: "admin" } });
      if (!admin) {
        throw new Error("Admin not found");
      }
      admin.role = "user";
      await admin.save();
      return admin;
    } catch (error) {
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const existingUser = await User.findOne({
        where: { email: userData.email },
      });
      console.log("existingUser", existingUser);
      if (existingUser) {
        throw new Error("Email already exists");
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        role: "user",
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUsers() {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
      });
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
      });
      return user;
    } catch (error) {
      throw new Error("User not found");
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ where: { email } });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      await user.update(userData);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async AdminDeleteUser(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }
      await user.destroy();
      return { message: "User deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  async deleteOwnUser(id, userData) {
    try {
      if (userData.role === "admin") {
        throw new Error("Admin users cannot be deleted");
      }
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }
      await user.destroy();
      return { message: "User deleted successfully" };
    } catch (error) {
      throw error;
    }
  }
}

export default UserService;
