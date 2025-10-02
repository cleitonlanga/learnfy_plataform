import VideoService from "../services/video.service.js";
import Video from "../models/video.models.js";
import youtubeDl from "youtube-dl-exec";

const videoService = new VideoService(Video);

export const createVideo = async (req, res, next) => {
  const { userid, sourceType, sourceValue } = req.body;
  try {
    const video = await videoService.createVideo({
      userid,
      sourceType,
      sourceValue,
      duration: 0,
      status: "queued",
    });

    await videoService.enqueueVideo(video, req.file || null);

    return res.status(201).json({
      message: "Video created and queued successfully",
      videoId: video.id,
    });
  } catch (error) {
    console.error("Error creating video:", error);
    next(error);
  }
};

export const getAllUserVideos = async (req, res) => {
  try {
    const videos = await videoService.getAllVideos();
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting videos" });
  }
};

// Buscar por ID
export const getVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await videoService.getVideoById(id);
    res.json(video);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: error.message });
  }
};

// Atualizar vídeo
export const updateVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const video = await videoService.updateVideo(id, data);
    res.json(video);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: error.message });
  }
};

export const deleteVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await videoService.deleteVideo(id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: error.message });
  }
};

export const adminGetAllVideos = async (req, res) => {
  try {
    const videos = await videoService.adminGetAllVideos();
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting videos" });
  }
};
