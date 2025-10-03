import { jest } from "@jest/globals";
import UserService from "../../services/user.services.js";
import User from "../../models/user.models.js";
import bcrypt from "bcryptjs";


User.findOne = jest.fn();
User.create = jest.fn();

describe("UserService", () => {
  let userService;

  beforeEach(() => {
    userService = new UserService(User);
    jest.clearAllMocks();
  });

  it("should create a new user with hashed password", async () => {
    const mockUserData = {
      email: "test@test.com",
      password: "123456",
      username: "test",
    };
    const hashedPassword = "hashedpassword123";

    bcrypt.hash = jest.fn().mockResolvedValue(hashedPassword);
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      ...mockUserData,
      password: hashedPassword,
    });

    const result = await userService.createUser(mockUserData);

    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: mockUserData.email },
    });
    expect(User.create).toHaveBeenCalledWith({
      ...mockUserData,
      password: hashedPassword,
      role: "user",
    });
    expect(result.password).toBe(hashedPassword);
  });

  it("should throw error if email already exists", async () => {
    const mockUserData = {
      email: "exists@test.com",
      password: "123456",
      username: "exists",
    };
    User.findOne.mockResolvedValue({ id: 1, ...mockUserData });

    await expect(userService.createUser(mockUserData)).rejects.toThrow(
      "Email already exists"
    );
  });
});
