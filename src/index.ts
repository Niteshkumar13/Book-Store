import express,{Request,Response, NextFunction} from "express";
import fs from "fs-extra";
import cookieParser from "cookie-parser";
import path from "path";
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth/", authRoutes);
app.use("/api/v1/books/", bookRoutes);

app.use((req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

fs.ensureFileSync(path.join(__dirname, "../data/users.json"));
fs.ensureFileSync(path.join(__dirname, "../../data/books.json"));

export default app;