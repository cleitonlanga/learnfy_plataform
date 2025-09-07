import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import dotenv from "dotenv";

dotenv.config();

export const protect = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, no token" });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findByPk(decoded.id).select("-password");
      if (!user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }
      req.user = user;
      if (roles.length && !roles.includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Not authorized, user not allowed" });
      }
      next();
    } catch (error) {
      console.error("Error in auth middleware:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  };
};
