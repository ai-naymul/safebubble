// src/api/controllers/SwapController.ts
import { Request, Response } from 'express';
import { JupiterService } from '../../services/JupiterService';

/**
 * Swap Controller
 * Handles Jupiter swap operations
 */
export class SwapController {
  private jupiterService: JupiterService;

  constructor() {
    this.jupiterService = new JupiterService();
  }

  /**
   * POST /api/swap/quote
   * Get swap quote from Jupiter
   */
  getQuote = async (req: Request, res: Response): Promise<void> => {
    try {
      const { inputMint, outputMint, amount, slippageBps } = req.body;

      // Validate input
      if (!inputMint || !outputMint || !amount) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: inputMint, outputMint, amount'
        });
        return;
      }

      const quote = await this.jupiterService.getQuote(
        inputMint,
        outputMint,
        amount,
        slippageBps || 50
      );

      res.json({ success: true, data: quote });
    } catch (error) {
      console.error('Error in getQuote:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get swap quote',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/swap/transaction
   * Build swap transaction
   */
  buildTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userPublicKey, quoteResponse } = req.body;

      // Validate input
      if (!userPublicKey || !quoteResponse) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: userPublicKey, quoteResponse'
        });
        return;
      }

      const transaction = await this.jupiterService.buildSwapTransaction(
        userPublicKey,
        quoteResponse
      );

      res.json({ success: true, data: transaction });
    } catch (error) {
      console.error('Error in buildTransaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to build swap transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}