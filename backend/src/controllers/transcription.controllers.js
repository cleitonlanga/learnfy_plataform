import TranscriptionService from "../services/transcription.service.js";
import Video from "../models/video.models.js";

export async function createTranscriptionHandler(req, res) {
  const { videoId } = req.params;
  try {
    const video = await Video.findByPk(videoId);
    if (!video) return res.status(404).json({ error: "Video not found" });

    await TranscriptionService.enqueueTranscription(video);
    return res.status(202).json({ message: "Transcription job enqueued" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getTranscriptionHandler(req, res) {
  const { videoId } = req.params;
  try {
    const transcription = await TranscriptionService.getTranscriptionByVideo(
      videoId
    );
    if (!transcription || transcription.length === 0)
      return res.status(404).json({ error: "No transcription found" });

    return res.json({ transcription });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getAllTranscriptionsHandler(req, res) {
  try {
    const transcriptions = await TranscriptionService.getAllTranscriptions();
    return res.json({ transcriptions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getUserTranscriptionsHandler(req, res) {
  const { userId } = req.params;
  try {
    const transcriptions = await TranscriptionService.getAllUserTranscriptions(
      userId
    );
    return res.json({ transcriptions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export async function updateTranscriptionHandler(req, res) {
  const { id } = req.params;
  try {
    const transcription = await TranscriptionService.updateTranscription(
      id,
      req.body
    );
    return res.json({ transcription });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteTranscriptionHandler(req, res) {
  const { id } = req.params;
  try {
    const result = await TranscriptionService.deleteTranscription(id);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
