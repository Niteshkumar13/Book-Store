import {Router} from 'express';
import { BookController } from '../controller/booksController';
import { authMiddleware } from '../middleware/middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  await BookController.getAllBooks(req, res);
});

router.get('/:id', async (req, res) => {
  await BookController.getBookById(req, res);
});

router.post('/', async (req, res) => {
  await BookController.addBook(req, res);
});

router.put('/:id', async (req, res) => {
  await BookController.updateBook(req, res);
});

router.delete('/:id', async (req, res) => {
  await BookController.deleteBook(req, res);
});

export default router;
