// src/api/routes/tokenRoutes.ts
import { Router } from 'express';
import { TokenController } from '../controllers/TokenController';

const router = Router();
const tokenController = new TokenController();

// Initialize controller
tokenController.initialize();

/**
 * Token Routes
 */

// GET /api/tokens/:mint/summary
router.get('/:mint/summary', tokenController.getTokenSummary);

// GET /api/tokens/trending
router.get('/trending', tokenController.getTrendingTokens);

// POST /api/tokens/batch
router.post('/batch', tokenController.getTokensBatch);

export default router;