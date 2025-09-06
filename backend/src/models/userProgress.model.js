import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import User from "./user.models.js";
import Video from "./video.models.js";

const UserProgress = sequelize.define("UserProgress", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrem,
    ent: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  videoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Video,
      key: "id",
    },
  },
  goal_json: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  update_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

UserProgress.belongsTo(User, { foreignKey: "userId" });
UserProgress.belongsTo(Video, { foreignKey: "videoId" });

export default UserProgress;
