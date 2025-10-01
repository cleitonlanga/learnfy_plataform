import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import User from "./user.models.js";

const Video = sequelize.define(
  "Video",
  {
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
    sourceType: {
      type: DataTypes.ENUM("youtube", "upload", "external"),
      allowNull: false,
    },
    sourceValue: {
      type: DataTypes.STRING,
      allowNull: false, // se youtube → URL, se upload → filePath
    },
    status: {
      type: DataTypes.ENUM(
        "queued",
        "downloading",
        "pending",
        "done",
        "failed"
      ),
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
    },
  },
  {
    timestamps: false,
    tableName: "videos",
  }
);

Video.belongsTo(User, { foreignKey: "userid" });
User.hasMany(Video, { foreignKey: "userid" });

export default Video;
