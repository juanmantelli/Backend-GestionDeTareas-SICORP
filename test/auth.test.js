import request from "supertest";
import app from "../server.js";
import { connectTestDB, closeTestDB } from "./setupTestDB.js";

beforeAll(async () => await connectTestDB());
afterAll(async () => await closeTestDB());

describe("Auth API", () => {
    it("Debe registrar un usuario correctamente", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "Password123!"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("token");
    });

    it("Debe rechazar un registro con email inválido", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "email-invalido",
                password: "Password123!"
            });

        expect(res.statusCode).toBe(400);
    });
});