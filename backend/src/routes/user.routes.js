import express from "express";
import { protect } from "../middlewares/auth.middlewares.js";
import * as UserController from "../controllers/user.controllers.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Rotas de usuários e administração
 */

/**
 * @swagger
 * /users/admin:
 *   post:
 *     summary: Cria um usuário admin
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@test.com
 *               username:
 *                 type: string
 *                 example: admin1
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Admin criado com sucesso
 *       400:
 *         description: Erro de validação
 */
router.post("/admin/", UserController.createAdminUser);
/**
 * @swagger
 * /users/admin:
 *   get:
 *     summary: Lista todos os admins
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de admins
 *       403:
 *         description: Acesso negado
 */
router.get("/admin/", protect(["admin"]), UserController.getAdminUsers);
/**
 * @swagger
 * /users/admin/{id}:
 *   get:
 *     summary: Retorna um admin por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do admin
 *     responses:
 *       200:
 *         description: Admin encontrado
 *       404:
 *         description: Admin não encontrado
 */
router.get("/admin/:id", protect(["admin"]), UserController.getAdminUserById);
/**
 * @swagger
 * /users/admin/{id}:
 *   put:
 *     summary: Atualiza um admin
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin atualizado
 *       400:
 *         description: Erro na atualização
 */
router.put("/admin/:id", protect(["admin"]), UserController.updateAdminUser);
/**
 * @swagger
 * /users/admin/{id}/upgrade:
 *   post:
 *     summary: Atualiza um usuário para admin
 *     tags: [Users]
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
 *         description: Usuário atualizado para admin
 *       400:
 *         description: Usuário não encontrado
 */
router.post(
  "/admin/:id/upgrade",
  protect(["admin"]),
  UserController.upgradeUserToAdmin
);
/**
 * @swagger
 * /users/admin/{id}/downgrade:
 *   post:
 *     summary: Rebaixar um admin para usuário
 *     tags: [Users]
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
 *         description: Admin rebaixado para usuário
 *       400:
 *         description: Admin não encontrado
 */
router.post(
  "/admin/:id/downgrade",
  protect(["admin"]),
  UserController.downgradeAdminToUser
);
/**
 * @swagger
 * /users/admin/{id}:
 *   delete:
 *     summary: Deleta um usuário (admin only)
 *     tags: [Users]
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
 *         description: Usuário deletado com sucesso
 *       400:
 *         description: Erro ao deletar
 */
router.delete("/admin/:id", protect(["admin"]), UserController.AdminDeleteUser);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um usuário comum
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro de validação
 */
router.post("/", UserController.createUser);
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       403:
 *         description: Acesso negado
 */
router.get("/", protect(["admin"]), UserController.getUsers);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retorna um usuário pelo ID
 *     tags: [Users]
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
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/:id", protect(), UserController.getUserById);
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       400:
 *         description: Erro na atualização
 */
router.put("/:id", protect(), UserController.updateUser);
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Usuário deleta sua própria conta
 *     tags: [Users]
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
 *         description: Usuário deletado com sucesso
 *       400:
 *         description: Erro ao deletar
 */
router.delete("/:id", protect(), UserController.deleteOwnUser);

export default router;
