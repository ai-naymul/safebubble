// src/index.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment';
import { logger } from './utils/logger';
import { errorHandler } from './api/middleware/errorHandler';
import { rateLimiter } from './api/middleware/rateLimiter';
import tokenRoutes from './api/routes/tokenRoutes';
import swapRoutes from './api/routes/swapRoutes';
import { BackgroundJobService } from './services/BackgroundJobService';

/**
 * SafeBubble Backend API Server
 */
class Server {
  private app: Application;
  private port: number;
  private backgroundJobService: BackgroundJobService;

  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.backgroundJobService = new BackgroundJobService();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Security
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: config.server.isDevelopment 
        ? '*' 
        : ['http://localhost:19000', 'http://localhost:19006'], // Expo dev URLs
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting
    this.app.use('/api/', rateLimiter);

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ 
        success: true, 
        message: 'SafeBubble API is running',
        timestamp: new Date().toISOString(),
        environment: config.server.env
      });
    });

    // Background job status
    this.app.get('/api/jobs/status', (req: Request, res: Response) => {
      const status = this.backgroundJobService.getStatus();
      res.json({
        success: true,
        data: {
          ...status,
          timestamp: new Date().toISOString()
        }
      });
    });

    // Manual background job trigger
    this.app.post('/api/jobs/trigger', async (req: Request, res: Response) => {
      try {
        await this.backgroundJobService.triggerManualJob();
        res.json({
          success: true,
          message: 'Background job triggered successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to trigger background job',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // API routes
    this.app.use('/api/tokens', tokenRoutes);
    this.app.use('/api/swap', swapRoutes);

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    // Initialize background job service
    await this.backgroundJobService.initialize();
    
    // Start background job scheduler
    this.backgroundJobService.startScheduler();

    this.app.listen(this.port, '0.0.0.0', () => {
      logger.info(`
╔═══════════════════════════════════════╗
║   SafeBubble Backend API Server       ║
║   Port: ${this.port}                          ║
║   Environment: ${config.server.env}          ║
║   Status: Running ✓                   ║
║   Background Jobs: Active ✓           ║
║   Network: 0.0.0.0 (all interfaces)   ║
╚═══════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', this.shutdown.bind(this));
    process.on('SIGINT', this.shutdown.bind(this));
  }

  /**
   * Graceful shutdown
   */
  private async shutdown(): Promise<void> {
    logger.info('Received shutdown signal, closing server gracefully...');
    
    // Cleanup background job service
    await this.backgroundJobService.cleanup();
    
    process.exit(0);
  }
}

// Start server
const server = new Server();
server.start();