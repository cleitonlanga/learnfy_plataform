import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import Video from "./video.models.js";

const Quizz = sequelize.define("Quizz", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Videoid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Video,
      key: "id",
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  dificulty: {
    type: DataTypes.ENUM("easy", "medium", "hard"),
    allowNull: false,
    defaultValue: "medium",
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

Quizz.belongsTo(Video, { foreignKey: "Videoid" });

export default Quizz;
