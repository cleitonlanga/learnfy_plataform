import express from "express";
import { protect } from "../middlewares/auth.middlewares.js";
import * as VideoController from "../controllers/video.controllers.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Create a new video
router.post("/", protect(), VideoController.createVideo);
// Get all videos
router.get("/", protect(), VideoController.getAllUserVideos);
// Get a specific video by ID
router.get("/:id", protect(), VideoController.getVideo);
// Update a video by ID
router.put("/:id", protect(), VideoController.updateVideoById);
// Delete a video by ID
router.delete("/:id", protect(), VideoController.deleteVideoById);

router.get("/", protect(["Admin"]), VideoController.adminGetAllVideos);

export default router;
