import fs from "fs";
import path from "path";
import { youtubeDl } from "youtube-dl-exec";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";
import Video from "../models/video.models.js";
import PQueue from "p-queue";
import dotenv from "dotenv";
import { validateYoutubeUrl } from "../middlewares/validateUrl.middleware.js";

dotenv.config();

const queue = new PQueue({ concurrency: 1 });// concurrency is the number of videos that can be processed at the same time

let ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";
let ffprobePath = process.env.FFPROBE_PATH || "ffprobe";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

class VideoService {
  constructor(VideoModel) {
    this.Video = VideoModel;
  }
  async createVideo(videoData) {
    return await Video.create(videoData);
  }

  async getAllVideos() {
    return await Video.findAll({ include: ["User"] });
  }

  async adminGetAllVideos() {
    return await Video.findAll();
  }

  async getVideoById(id) {
    const video = await Video.findByPk(id, { include: ["User"] });
    if (!video) throw new Error("Video not found");
    return video;
  }

  async updateVideo(id, data) {
    const video = await Video.findByPk(id, { include: ["User"] });
    if (!video) throw new Error("Video not found");

    await video.update(data);
    return video;
  }

  async deleteVideo(id) {
    const video = await Video.findByPk(id);
    if (!video) throw new Error("Video not found");

    if (video.sourceType === "upload" || video.sourceType === "external") {
      try {
        if (fs.existsSync(video.sourceValue)) {
          fs.unlinkSync(video.sourceValue);
        }
      } catch (err) {
        console.error("Error deleting file:", err.message);
      }
    }

    await video.destroy();
    return { message: "Video deleted successfully" };
  }

  async enqueueVideo(video, file) {
    queue.add(() => this.processVideo(video, file)).catch(async (err) => {
      console.error("Error processing queued video:", err);
      await this.updateVideo(video.id, { status: "failed" });
    });
  }

  async processVideo(video, file) {
    let audioPath = null;
    let videoDuration = 0;

    try {
      await this.updateVideo(video.id, { status: "downloading" });

      if (video.sourceType === "youtube") {
        const filename = `${uuidv4()}.mp3`;
        audioPath = await this.downloadAudioFromYoutube(
          video.sourceValue,
          filename
        );

        const info = await youtubeDl(video.sourceValue, {
          dumpSingleJson: true,
        });
        videoDuration = info.duration;
      } else if (video.sourceType === "upload") {
        if (!file) throw new Error("File not uploaded");

        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${uuidv4()}.mp3`;

        if ([".mp4", ".mov", ".mkv", ".avi"].includes(ext)) {
          audioPath = await this.convertVideoToAudio(file.path, filename);
        } else {
          const outputPath = path.resolve("uploads/audio", filename);
          fs.renameSync(file.path, outputPath);
          audioPath = outputPath;
        }
      } else if (video.sourceType === "external") {
        const tempFile = `${uuidv4()}${path.extname(video.sourceValue)}`;
        const tempPath = await this.downloadAudioFromUrl(
          video.sourceValue,
          tempFile
        );

        const filename = `${uuidv4()}.mp3`;
        audioPath = await this.convertVideoToAudio(tempPath, filename);
      }

      await this.updateVideo(video.id, {
        sourceValue: audioPath,
        duration: videoDuration,
        status: "done",
      });
    } catch (error) {
      console.error("Error processing video:", error);
      await this.updateVideo(video.id, { status: "failed" });
    }
  }

  async downloadAudioFromYoutube(url, filename) {
    const tempPath = path.resolve("uploads/tmp", filename);
    const finalPath = path.resolve("uploads/audio", filename);

    await youtubeDl(url, {
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: 0,
      output: tempPath,
      ffmpegLocation: ffmpegPath,
    });

    fs.renameSync(tempPath, finalPath);
    return finalPath;
  }

  async downloadAudioFromUrl(url, filename) {
    const tempPath = path.resolve("uploads/tmp", filename);
    const finalPath = path.resolve("uploads/audio", filename);
    const writer = fs.createWriteStream(tempPath);

    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });
    response.data.pipe(writer);
    fs.renameSync(tempPath, finalPath);
    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(finalPath));
      writer.on("error", reject);
    });
  }

  async convertVideoToAudio(inputPath, filename) {
    const outputPath = path.resolve("uploads/audio", filename);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec("libmp3lame")
        .format("mp3")
        .on("end", () => {
          fs.unlinkSync(inputPath);
          resolve(outputPath);
        })
        .on("error", reject)
        .save(outputPath);
    });
  }
}

export default VideoService;
