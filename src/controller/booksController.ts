import { Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  userId: string;
}

const booksFile = path.join(__dirname, "../../data/books.json");

// In-memory store using Map for O(1) access
let bookMap = new Map<string, Book>();

// Load books from file into memory at startup
(async () => {
  const books: Book[] = await fs.readJson(booksFile).catch(() => []);
  books.forEach((b) => bookMap.set(b.id, b));
})();

// Persist the current in-memory state to the JSON file
async function persistToFile() {
  await fs.writeJson(booksFile, Array.from(bookMap.values()));
}

export class BookController {
  // GET /books
  static async getAllBooks(req: Request, res: Response): Promise<Response> {
    try {
      const { genre, page = 1, limit } = req.query;
      let books = Array.from(bookMap.values());

      if (genre && typeof genre === "string") {
        books = books.filter((b) => b.genre === genre);
      }

      if (!limit || isNaN(Number(limit))) {
        return res.status(200).json({
          success: true,
          message: "Fetched all books",
          total: books.length,
          data: books,
        });
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const paginated = books.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.status(200).json({
        success: true,
        message: "Fetched paginated books",
        total: books.length,
        page: pageNum,
        limit: limitNum,
        data: paginated,
      });
    } catch (error) {
      console.error("getAllBooks error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /books/:id
  static async getBookById(req: Request, res: Response): Promise<Response> {
    try {
      const book = bookMap.get(req.params.id);
      if (!book) return res.status(404).json({ error: "Book not found" });

      return res.status(200).json({
        success: true,
        message: "Book found",
        data: book,
      });
    } catch (error) {
      console.error("getBookById error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // POST /books
  static async addBook(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as AuthRequest).user.id;
      const { title, author, genre, publishedYear } = req.body;

      if (!title || !author || !genre || !publishedYear) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const book: Book = {
        id: uuidv4(),
        title,
        author,
        genre,
        publishedYear,
        userId,
      };

      bookMap.set(book.id, book);
      await persistToFile();

      return res.status(201).json({
        success: true,
        message: "Book created successfully",
        data: book,
      });
    } catch (error) {
      console.error("addBook error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // PUT /books/:id
  static async updateBook(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as AuthRequest).user.id;
      const book = bookMap.get(req.params.id);

      if (!book) return res.status(404).json({ error: "Book not found" });
      if (book.userId !== userId) return res.status(403).json({ error: "Unauthorized" });

      const { title, author, genre, publishedYear } = req.body;

      if (title) book.title = title;
      if (author) book.author = author;
      if (genre) book.genre = genre;
      if (publishedYear) book.publishedYear = publishedYear;

      bookMap.set(book.id, book);
      await persistToFile();

      return res.status(200).json({
        success: true,
        message: "Book updated successfully",
        data: book,
      });
    } catch (error) {
      console.error("updateBook error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // DELETE /books/:id
  static async deleteBook(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as AuthRequest).user.id;
      const book = bookMap.get(req.params.id);

      if (!book) return res.status(404).json({ error: "Book not found" });
      if (book.userId !== userId) return res.status(403).json({ error: "Unauthorized" });

      bookMap.delete(req.params.id);
      await persistToFile();

      return res.status(200).json({
        success: true,
        message: "Book deleted successfully",
        data: book,
      });
    } catch (error) {
      console.error("deleteBook error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
