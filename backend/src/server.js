import dotenv from "dotenv";
import sequelize from "./config/db.js";
import app from "./app.js";
import User from "./models/user.models.js";
import Quiz from "./models/quizz.models.js";
import Transcription from "./models/transcription.models.js";
import Video from "./models/video.models.js";
import UserProgress from "./models/userProgress.models.js";

dotenv.config();
const PORT = process.env.APP_PORT || 5000;

// Start the server
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync({ force: false });
    console.log("All models were synchronized successfully.");

    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();
