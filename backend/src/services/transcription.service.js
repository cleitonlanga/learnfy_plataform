import fs from "fs";
import path from "path";
import axios from "axios";
import PQueue from "p-queue";
import Transcription from "../models/transcription.models.js";
import Video from "../models/video.models.js";
import dotenv from "dotenv";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const CHUNK_SECONDS = 15 * 60; // 15 minutes per audio chunk
const MAX_POLL_MS = 2 * 60 * 60_000; // 2 hours
const POLL_INTERVAL_MS = 5000; // 5s

const ASSEMBLYAI_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_BASE =
  process.env.ASSEMBLYAI_BASE_URL || "https://api.assemblyai.com/v2";
const SUMMARY_MODEL = process.env.SUMMARY_MODEL || "universal";
const SUMMARY_TYPE = process.env.SUMMARY_TYPE || "bullets";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const queue = new PQueue({ concurrency: 1 });

class TranscriptionService {
  /**
   * Adds a video transcription job to the processing queue.
   * @param {Object} video - The video object to be transcribed.
   * The method will update the video status and handle errors by marking the video as failed if transcription fails.
   */
  async enqueueTranscription(video) {
    queue
      .add(async () => await this.processTranscription(video))
      .catch(async (err) => {
        console.error("Transcription job failed:", err);
        try {
          await this.updateVideo(video.id, { status: "failed" });
        } catch (error) {
          console.error("Error updating video status:", error);
        }
      });
  }

  /**
   * Prepares and chunks an audio file into smaller segments suitable for transcription.
   * Converts the original audio to WAV format, normalizes it, and splits it into chunks if necessary.
   * @param {string} originalPath - The file path to the original audio file.
   * @returns {Promise<{chunks: string[], tempFiles: string[], duration: number}>}
   *   An object containing the paths to the audio chunks, all temporary files created, and the total duration in seconds.
   */
  async prepareAndChunkAudio(originalPath) {
    const baseTmpDir = path.resolve("uploads/tmp");
    if (!fs.existsSync(baseTmpDir))
      fs.mkdirSync(baseTmpDir, { recursive: true });

    const normalizedPath = path.resolve(baseTmpDir, `${uuidv4()}.wav`);

    // Normalize audio to WAV, 16kHz, mono, loudnorm
    await new Promise((resolve, reject) => {
      ffmpeg(originalPath)
        .audioCodec("pcm_s16le")
        .audioChannels(1)
        .audioFrequency(16000)
        .format("wav")
        .audioFilters("loudnorm")
        .on("error", (err) => reject(err))
        .on("end", () => resolve())
        .save(normalizedPath);
    });

    const duration = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(normalizedPath, (err, metadata) => {
        if (err) return reject(err);
        const d = metadata.format.duration;
        resolve(d);
      });
    });

    if (duration <= CHUNK_SECONDS) {
      return {
        chunks: [normalizedPath],
        tempFiles: [normalizedPath],
        duration,
      };
    }

    const chunks = [];
    const tempFiles = [normalizedPath];

    const numChunks = Math.ceil(duration / CHUNK_SECONDS);
    for (let i = 0; i < numChunks; i++) {
      const start = i * CHUNK_SECONDS;
      const chunkPath = path.resolve(baseTmpDir, `${uuidv4()}.wav`);
      tempFiles.push(chunkPath);

      // Extract chunk
      await new Promise((resolve, reject) => {
        ffmpeg(normalizedPath)
          .setStartTime(start)
          .duration(CHUNK_SECONDS)
          .audioCodec("pcm_s16le")
          .audioChannels(1)
          .audioFrequency(16000)
          .format("wav")
          .on("error", (err) => reject(err))
          .on("end", () => resolve())
          .save(chunkPath);
      });

      chunks.push({ path: chunkPath, index: i, start });
    }

    return { chunks: chunks.map((c) => c.path), tempFiles, duration };
  }

  /**
   * Upload a single audio file to AssemblyAI for transcription
   * @param {string} filePath - path to the audio file to upload
   * @returns {Promise<string>} - the upload URL returned by AssemblyAI
   * @throws {Error} - if the audio file is not found or the upload response is invalid
   */
  async uploadSingleFileToAssemblyAI(filePath) {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved))
      throw new Error("Audio file not found: " + resolved);

    const resp = await axios.post(
      `${ASSEMBLYAI_BASE}/upload`,
      fs.createReadStream(resolved),
      {
        headers: {
          Authorization: `Bearer ${ASSEMBLYAI_KEY}`,
          "Content-Type": "application/octet-stream",
        },
        // Set to 1GB to avoid memory issues; adjust as needed for your use case
        maxContentLength: 1_000_000_000,
        maxBodyLength: 1_000_000_000,
      }
    );
    if (!resp.data.upload_url)
      throw new Error("Invalid upload response from AssemblyAI");
    return resp.data.upload_url;
  }

  /**
   * Creates a new transcription job on AssemblyAI
   * @param {string} uploadUrl - the URL returned by AssemblyAI after uploading an audio file
   * @returns {Promise<Object>} - the transcription job object returned by AssemblyAI
   * @throws {Error} - if the transcription job creation fails
   */
  async createAssemblyAIJob(uploadUrl) {
    const body = {
      audio_url: uploadUrl,
      language_detection: true,
      speaker_labels: true,

      disfluencies: true,
      punctuate: true,
      format_text: true,
      auto_chapters: false,
      filter_profanity: false,
      redact_pii: false,
    };

    const resp = await axios.post(`${ASSEMBLYAI_BASE}/transcript`, body, {
      headers: {
        Authorization: `Bearer ${ASSEMBLYAI_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!resp.data?.id)
      throw new Error(
        "Failed to create transcription job: " + JSON.stringify(resp.data)
      );
    return resp.data;
  }

  /**
   * Polls the AssemblyAI transcription job status until it is complete or fails.
   * @param {string} jobId - the ID of the AssemblyAI transcription job
   * @param {number} [intervalMs=5000] - the polling interval in milliseconds
   * @param {number} [maxWaitMs=7200000] - the maximum time to wait for the job to complete in milliseconds
   * @param {number} [maxRetries=100] - the maximum number of polling retries
   * @returns {Promise<Object>} - the completed transcription job object returned by AssemblyAI
   * @throws {Error} - if the transcription job fails or polling times out
   */
  async pollAssemblyAIJob(
    jobId,
    {
      intervalMs = POLL_INTERVAL_MS,
      maxWaitMs = MAX_POLL_MS,
      maxRetries = 100,
    } = {}
  ) {
    const start = Date.now();
    let retries = 0;
    while (retries < maxRetries) {
      const resp = await axios.get(`${ASSEMBLYAI_BASE}/transcript/${jobId}`, {
        headers: { Authorization: `Bearer ${ASSEMBLYAI_KEY}` },
      });
      const data = resp.data;

      console.log(
        `[AssemblyAI] job ${jobId} status=${data.status} elapsed=${Math.round(
          (Date.now() - start) / 1000
        )}s`
      );

      if (data.status === "completed") return data;
      if (data.status === "failed")
        throw new Error(data.error || "AssemblyAI failed");
      if (Date.now() - start > maxWaitMs)
        throw new Error("Transcription polling timed out");

      retries++;
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error("Maximum polling retries exceeded");
  }

  /**
   * Process a video transcription job.
   * Prepares the audio, chunks it, and submits each chunk to AssemblyAI for transcription.
   * After all chunks are transcribed, it summarizes the text using GenAI and saves the transcription to the database.
   * @param {Object} video - the video object to be transcribed
   * @throws {Error} - if the video is not ready for transcription, audio prepare fails, or transcription fails
   */
  async processTranscription(video) {
    if (!video.sourceValue || video.status !== "done")
      throw new Error("Video not ready for transcription");

    await video.update({ status: "transcribing" });

    let prepared;
    try {
      prepared = await this.prepareAndChunkAudio(video.sourceValue);
    } catch (err) {
      console.error("Audio prepare error:", err);
      throw err;
    }

    const { chunks, tempFiles = [], duration } = prepared;
    console.log(
      `Prepared audio: duration=${duration}s chunks=${chunks.length}`
    );

    const transcriptsByChunk = [];

    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunkPath = chunks[i];
        console.log(`Uploading chunk ${i + 1}/${chunks.length}: ${chunkPath}`);

        const uploadUrl = await this.uploadSingleFileToAssemblyAI(chunkPath);
        console.log("Uploaded chunk URL:", uploadUrl);

        const job = await this.createAssemblyAIJob(uploadUrl);
        console.log("Created job:", job.id);

        const result = await this.pollAssemblyAIJob(job.id);
        console.log(
          "Chunk completed:",
          job.id,
          "text length:",
          (result.text || "").length
        );

        transcriptsByChunk.push({
          index: i,
          start: i * CHUNK_SECONDS,
          text: result.text || "",
          raw: result,
        });
      }

      transcriptsByChunk.sort((a, b) => a.index - b.index);
      const fullText = transcriptsByChunk
        .map((t, idx) => {
          const marker = `\n\n[Segment ${idx + 1} | start=${t.start}s]\n\n`;
          return marker + t.text;
        })
        .join("\n");

      // Calcular média das confidences
      const confidences = transcriptsByChunk
        .map((t) => t.raw?.confidence)
        .filter((c) => typeof c === "number" && !isNaN(c));

      const avgConfidence = confidences.length
        ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
        : null;

      const dbTranscription = await Transcription.create({
        videoId: video.id,
        language: transcriptsByChunk[0]?.raw?.language_code || "unknown",
        content: fullText,
        content_json: { chunks: transcriptsByChunk.map((t) => t.raw) },
        summary: null,
        confidence: avgConfidence ? Number(avgConfidence.toFixed(3)) : null,
      });

      console.log("Saved transcription DB id:", dbTranscription.id);

      // Update video status and return transcription before summarization
      await video.update({ status: "done" });

      // Offload summarization to not block the event loop
      this.summarizeWithGemini(dbTranscription.content)
        .then((summary) => {
          dbTranscription.summary = summary;
          return dbTranscription.save();
        })
        .catch((err) => {
          console.error("Async summary generation failed:", err);
        });

      console.log("Transcription completed");
      for (const f of tempFiles || []) {
        try {
          await fs.promises.unlink(f);
        } catch (err) {
          if (err.code !== "ENOENT") {
            console.warn(`Failed to remove temp file ${f}:`, err.message);
          }
        }
      }
      await video.update({ status: "failed" });
      throw err;
    } finally {
      try {
        for (const f of tempFiles || []) {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        }
      } catch (e) {
        console.warn("Failed to remove temp files:", e.message);
      }
    }
  }

  /**
   * Summarizes a given text using Google GenAI's Gemini model.
   * The summary should be in the format of topics and subtopics, highlighting
   * the main ideas, key concepts, important facts, events or arguments.
   * @param {string} text - the text to be summarized
   * @returns {Promise<string>} - the summarized text
   * @throws {Error} - if the summarization fails
   */
  async summarizeWithGemini(text) {
    // Skip summarization for very short texts (less than 50 characters) as they are unlikely to be meaningful.
    if (!text || text.length < 50) return "";

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const prompt = `
    You are an assistant specialized in summarizing texts for educational purposes.

    TASK:
    1. Translate the text below to Portuguese (if it is not already).
    2. Summarize it clearly, coherently, and in an organized manner.
    3. Structure the summary in the format of topics and subtopics, highlighting:
      - The main ideas.
      - The key concepts.
      - The important facts, events, or arguments.

    Text to be translated and summarized:
    ${text}
    `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text.trim();
    } catch (error) {
      console.error("Error summarizing with Gemini:", error.message);
      return "";
    }
  }

  async getTranscriptionByVideo(videoId) {
    return await Transcription.findAll({ where: { videoId } });
  }

  //ADMIN - get all transcriptions
  async getAllTranscriptions() {
    return await Transcription.findAll({
      include: [{ model: Video, attributes: ["id", "userId"] }],
      order: [["createdAt", "DESC"]],
    });
  }

  //USER - get all transcriptions by user
  async getAllUserTranscriptions(userId) {
    return await Transcription.findAll({
      include: [
        {
          model: Video,
          where: { userId },
          attributes: ["id"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  // Update transcription summary or data
  async updateTranscription(id, updates) {
    const transcription = await Transcription.findByPk(id);
    if (!transcription) throw new Error("Transcription not found");
    await transcription.update(updates);
    return transcription;
  }

  // Delete transcription
  async deleteTranscription(id) {
    const transcription = await Transcription.findByPk(id);
    if (!transcription) throw new Error("Transcription not found");
    await transcription.destroy();
    return { message: "Transcription deleted successfully" };
  }
}

export default new TranscriptionService();
