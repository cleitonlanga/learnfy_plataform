import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import Video from "./video.models.js";

const Transcription = sequelize.define("Transcription", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  videoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Video,
      key: "id",
    },
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  content_json: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

Transcription.belongsTo(Video, { foreignKey: "videoId" });

export default Transcription;
