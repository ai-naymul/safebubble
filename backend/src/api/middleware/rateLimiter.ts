// src/api/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import { config } from '../../config/environment';

/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per IP
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});