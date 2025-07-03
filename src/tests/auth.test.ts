import request from "supertest";
import app from "../index";
import fs from "fs-extra";
import path from "path";

const usersFile = path.join(__dirname, "../../data/users.json");

// Clear user file before each test
beforeEach(async () => {
  await fs.writeJson(usersFile, []);
});

describe("Auth API", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "user@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User registered successfully");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.email).toBe("user@example.com");
  });

  it("should not register duplicate user", async () => {
    // Register once
    await request(app).post("/api/v1/auth/register").send({
      email: "user@example.com",
      password: "password123",
    });

    // Register again
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "user@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error", "User already exists");
  });

  it("should login a registered user", async () => {
    // Register first
    await request(app).post("/api/v1/auth/register").send({
      email: "user@example.com",
      password: "password123",
    });

    // Login now
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "user@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.user.email).toBe("user@example.com");
  });

  it("should not login with invalid password", async () => {
    await request(app).post("/api/v1/auth/register").send({
      email: "user@example.com",
      password: "correctPassword",
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "user@example.com",
      password: "wrongPassword",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid credentials");
  });

  it("should not login unregistered user", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "notfound@example.com",
      password: "somepassword",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid credentials");
  });
});
