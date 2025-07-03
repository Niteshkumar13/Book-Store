import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your_secret_key';

interface JwtPayload {
  id: string;
  email: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    (req as Request & { user: JwtPayload }).user = decoded;
    next();
  } catch (error) {
    console.error("JWT verify error:", error);
    res.status(401).json({ error: 'Invalid token' });
  }
};
