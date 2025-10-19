// src/api/routes/swapRoutes.ts
import { Router } from 'express';
import { SwapController } from '../controllers/SwapController';

const router = Router();
const swapController = new SwapController();

/**
 * Swap Routes
 */

// POST /api/swap/quote
router.post('/quote', swapController.getQuote);

// POST /api/swap/transaction
router.post('/transaction', swapController.buildTransaction);

export default router;