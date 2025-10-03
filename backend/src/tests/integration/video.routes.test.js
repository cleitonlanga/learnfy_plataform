import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import Video from "../../models/video.models.js";
import * as VideoController from "../../controllers/video.controllers.js";

// Mock do middleware de autenticação
const mockProtect = jest.fn(() => (req, res, next) => {
  req.user = { id: 1, role: "Admin" }; // usuário admin para todos os testes
  next();
});

describe("Video Routes - Test Router", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const router = express.Router();
    router.post("/", mockProtect(), VideoController.createVideo);
    router.get("/", mockProtect(), VideoController.getAllUserVideos);
    router.get("/:id", mockProtect(), VideoController.getVideo);
    router.put("/:id", mockProtect(), VideoController.updateVideoById);
    router.delete("/:id", mockProtect(), VideoController.deleteVideoById);
    router.get("/admin/all", mockProtect(), VideoController.adminGetAllVideos);

    app.use("/api/videos", router);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mockando métodos do VideoService por trás do VideoController
    Video.findAll = jest.fn();
    Video.findByPk = jest.fn();
    Video.create = jest.fn();
  });

  it("POST /api/videos - should create a video", async () => {
    const mockVideo = { id: 1, sourceType: "youtube", sourceValue: "https://youtu.be/test" };
    Video.create.mockResolvedValue(mockVideo);

    const res = await request(app)
      .post("/api/videos")
      .send({ userid: 1, sourceType: "youtube", sourceValue: "https://youtu.be/test" });

    expect(res.statusCode).toBe(201);
    expect(res.body.videoId).toBe(mockVideo.id);
  });

  it("GET /api/videos - should return all user videos", async () => {
    const mockVideos = [{ id: 1, sourceValue: "vid1.mp3" }, { id: 2, sourceValue: "vid2.mp3" }];
    Video.findAll.mockResolvedValue(mockVideos);

    const res = await request(app).get("/api/videos");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it("GET /api/videos/:id - should return a video by id", async () => {
    const mockVideo = { id: 1, sourceValue: "vid1.mp3" };
    Video.findByPk.mockResolvedValue(mockVideo);

    const res = await request(app).get("/api/videos/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it("GET /api/videos/:id - should return 404 if video not found", async () => {
    Video.findByPk.mockResolvedValue(null);

    const res = await request(app).get("/api/videos/999");

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Video not found");
  });

  it("PUT /api/videos/:id - should update a video", async () => {
    const updateMock = jest.fn().mockResolvedValue(true);
    const mockVideo = { id: 1, update: updateMock };
    Video.findByPk.mockResolvedValue(mockVideo);

    const res = await request(app)
      .put("/api/videos/1")
      .send({ sourceValue: "updated.mp3" });

    expect(res.statusCode).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({ sourceValue: "updated.mp3" });
  });

  it("DELETE /api/videos/:id - should delete a video", async () => {
    const destroyMock = jest.fn().mockResolvedValue(true);
    const mockVideo = { id: 1, destroy: destroyMock, sourceType: "upload", sourceValue: "file.mp3" };
    Video.findByPk.mockResolvedValue(mockVideo);

    const res = await request(app).delete("/api/videos/1");

    expect(res.statusCode).toBe(200);
    expect(destroyMock).toHaveBeenCalled();
    expect(res.body.message).toBe("Video deleted successfully");
  });

  it("GET /api/videos/admin/all - should return all videos for admin", async () => {
    const mockVideos = [{ id: 1 }, { id: 2 }];
    Video.findAll.mockResolvedValue(mockVideos);

    const res = await request(app).get("/api/videos/admin/all");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });
});
