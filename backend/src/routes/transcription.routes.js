import express from "express";
import {
  createTranscriptionHandler,
  getTranscriptionHandler,
  getAllTranscriptionsHandler,
  getUserTranscriptionsHandler,
  updateTranscriptionHandler,
  deleteTranscriptionHandler,
} from "../controllers/transcription.controllers.js";
import { protect } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// Public/User routes
router.post(
  "/:videoId",
  protect(),
  createTranscriptionHandler
);
router.get(
  "/:videoId",
  protect(),
  getTranscriptionHandler
);

router.get(
  "/admin/transcriptions",
  protect(["Admin"]),
  getAllTranscriptionsHandler
);
router.get(
  "/admin/users/:userId/transcriptions",
  protect(["Admin"]),
  getUserTranscriptionsHandler
);

router.put("/:id", protect(), updateTranscriptionHandler);
router.delete("/:id", protect(), deleteTranscriptionHandler);

export default router;
