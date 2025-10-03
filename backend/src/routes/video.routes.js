import express from "express";
import { protect } from "../middlewares/auth.middlewares.js";
import * as VideoController from "../controllers/video.controllers.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Rotas de vídeos e administração
 */

/**
 * @swagger
 * /videos:
 *   post:
 *     summary: Cria um novo vídeo
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userid
 *               - sourceType
 *               - sourceValue
 *             properties:
 *               userid:
 *                 type: integer
 *                 example: 1
 *               sourceType:
 *                 type: string
 *                 enum: [youtube, upload, external]
 *                 example: youtube
 *               sourceValue:
 *                 type: string
 *                 example: "https://www.youtube.com/watch?v=abc123"
 *     responses:
 *       201:
 *         description: Vídeo criado e enfileirado com sucesso
 *       400:
 *         description: Erro na criação do vídeo
 */
router.post("/", protect(), VideoController.createVideo);

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Lista todos os vídeos do usuário logado
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vídeos
 *       403:
 *         description: Acesso negado
 */
router.get("/", protect(), VideoController.getAllUserVideos);

/**
 * @swagger
 * /videos/{id}:
 *   get:
 *     summary: Retorna um vídeo por ID
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do vídeo
 *     responses:
 *       200:
 *         description: Vídeo encontrado
 *       404:
 *         description: Vídeo não encontrado
 */
router.get("/:id", protect(), VideoController.getVideo);

/**
 * @swagger
 * /videos/{id}:
 *   put:
 *     summary: Atualiza um vídeo por ID
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sourceValue:
 *                 type: string
 *               status:
 *                 type: string
 *                 example: queued
 *     responses:
 *       200:
 *         description: Vídeo atualizado com sucesso
 *       400:
 *         description: Erro na atualização
 */
router.put("/:id", protect(), VideoController.updateVideoById);

/**
 * @swagger
 * /videos/{id}:
 *   delete:
 *     summary: Deleta um vídeo por ID
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vídeo deletado com sucesso
 *       404:
 *         description: Vídeo não encontrado
 */
router.delete("/:id", protect(), VideoController.deleteVideoById);

/**
 * @swagger
 * /videos/admin/all:
 *   get:
 *     summary: Lista todos os vídeos (Admin)
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de vídeos
 *       403:
 *         description: Acesso negado
 */
router.get("/admin/all", protect(["Admin"]), VideoController.adminGetAllVideos);

export default router;
