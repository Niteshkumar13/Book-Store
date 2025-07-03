import request from "supertest";
import app from "../index";
import fs from "fs-extra";
import path from "path";

// File path to the data store
const booksFile = path.join(__dirname, "../../data/books.json");

// Helper function to get login cookies
const registerAndLogin = async (): Promise<string[]> => {
    const email = `test_${Date.now()}@example.com`;
    const password = "testpass";

    // Register
    await request(app).post("/api/v1/auth/register").send({ email, password });

    // Login
    const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email, password });

    const rawCookies = loginRes.headers["set-cookie"];

    if (!rawCookies || !Array.isArray(rawCookies)) {
        console.error("Login response:", loginRes.body);
        throw new Error("Login failed: No valid cookie received");
    }

    return rawCookies;
};

describe("Book Routes (auth protected)", () => {
    let cookies: string[] = [];

    beforeEach(async () => {
        await fs.writeJson(booksFile, []); // Clear all books
        cookies = await registerAndLogin();
    });

    it("GET /api/v1/books → should return empty array", async () => {
        const res = await request(app).get("/api/v1/books").set("Cookie", cookies);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual([]);
    });

    it("POST /api/v1/books → should create a book", async () => {
        const book = {
            title: "Test Book",
            author: "Tester",
            genre: "Sci-Fi",
            publishedYear: 2023,
        };

        const res = await request(app)
            .post("/api/v1/books")
            .set("Cookie", cookies)
            .send(book);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data.title).toBe(book.title);
    });

    it("GET /api/v1/books/:id → should return a book by ID", async () => {
        const book = {
            title: "Fetch Me",
            author: "Author",
            genre: "Drama",
            publishedYear: 2020,
        };

        const createRes = await request(app)
            .post("/api/v1/books")
            .set("Cookie", cookies)
            .send(book);

        const bookId = createRes.body.data.id;

        const res = await request(app)
            .get(`/api/v1/books/${bookId}`)
            .set("Cookie", cookies);

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe(book.title);
    });

    it("PUT /api/v1/books/:id → should update a book", async () => {
        const createRes = await request(app)
            .post("/api/v1/books")
            .set("Cookie", cookies)
            .send({
                title: "Old Title",
                author: "Old Author",
                genre: "Old",
                publishedYear: 2019,
            });

        const bookId = createRes.body.data.id;

        const res = await request(app)
            .put(`/api/v1/books/${bookId}`)
            .set("Cookie", cookies)
            .send({ title: "Updated Title" });

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe("Updated Title");
    });

    it("DELETE /api/v1/books/:id → should delete a book", async () => {
        const createRes = await request(app)
            .post("/api/v1/books")
            .set("Cookie", cookies)
            .send({
                title: "Delete Me",
                author: "Someone",
                genre: "Mystery",
                publishedYear: 2022,
            });

        const bookId = createRes.body.data.id;

        const res = await request(app)
            .delete(`/api/v1/books/${bookId}`)
            .set("Cookie", cookies);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Book deleted successfully");
    });

    it("GET without auth → should fail", async () => {
        const res = await request(app).get("/api/v1/books");
        expect(res.status).toBe(401); // Or 403 depending on your middleware
    });
});
