import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import User from "./user.models.js";

const Video = sequelize.define("Video", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  userid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  youtubeUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "processed", "failed"),
    allowNull: false,
    defaultValue: "pending",
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }}
  ,{
    timestamps: false,
    tableName: "videos",
  }
);
