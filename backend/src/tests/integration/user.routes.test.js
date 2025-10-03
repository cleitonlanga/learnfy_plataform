import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import User from "../../models/user.models.js";
import * as UserController from "../../controllers/user.controllers.js";

describe("User Routes - Test Router", () => {
  let app;

  // Cria o app e o router com middleware mockado
  beforeAll(() => {
    app = express();
    app.use(express.json());

    const router = express.Router();

    // Middleware mockado: sempre adiciona req.user
    const testProtect = (req, res, next) => {
      req.user = { id: "1", role: "user" }; // role "user" padrão
      next();
    };

    router.post("/", UserController.createUser);
    router.get("/:id", testProtect, UserController.getUserById);
    router.put("/:id", testProtect, UserController.updateUser);
    router.delete("/:id", testProtect, UserController.deleteOwnUser);

    app.use("/api/users", router);
  });

  // Limpa mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
    User.findOne = jest.fn();
    User.create = jest.fn();
    User.findByPk = jest.fn();
  });

  it("POST /api/users - should create a user", async () => {
    const mockUser = { id: 1, email: "new@test.com", username: "newuser" };
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(mockUser);

    const res = await request(app)
      .post("/api/users")
      .send({ email: "new@test.com", username: "newuser", password: "123456" });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe(mockUser.email);
    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: "new@test.com" },
    });
    expect(User.create).toHaveBeenCalled();
  });

  it("GET /api/users/:id - should return user by id", async () => {
    const mockUser = { id: 1, email: "user@test.com", username: "user" };
    User.findByPk.mockResolvedValue(mockUser);

    const res = await request(app).get("/api/users/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("user");
    expect(User.findByPk).toHaveBeenCalledWith("1", { attributes: { exclude: ["password"] } });
  });

  it("GET /api/users/:id - should return 404 if not found", async () => {
    User.findByPk.mockResolvedValue(null);

    const res = await request(app).get("/api/users/999");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("PUT /api/users/:id - should update user", async () => {
    const updateMock = jest.fn().mockResolvedValue(true);
    const mockUser = { id: 1, update: updateMock };
    User.findByPk.mockResolvedValue(mockUser);

    const res = await request(app)
      .put("/api/users/1")
      .send({ username: "updated" });

    expect(res.statusCode).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({ username: "updated" });
    expect(User.findByPk).toHaveBeenCalledWith("1");
  });

  it("DELETE /api/users/:id - should delete user", async () => {
    const destroyMock = jest.fn().mockResolvedValue(true);
    const mockUser = { id: 1, destroy: destroyMock };
    User.findByPk.mockResolvedValue(mockUser);

    const res = await request(app).delete("/api/users/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
    expect(User.findByPk).toHaveBeenCalledWith("1");
    expect(destroyMock).toHaveBeenCalled();
  });
});
