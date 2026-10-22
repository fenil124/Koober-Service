import dotenv from 'dotenv';
import path from 'path';

// 1. Explicitly load environment files in development and production
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';

import { connectDB, isMongoConnected } from './db';
import { isCloudinaryConfigured } from './cloudinary';
import { authenticate } from './auth';

import authRoutes from './routes/auth.routes';
import carsRoutes from './routes/cars.routes';
import routesRoutes from './routes/routes.routes';
import destinationsRoutes from './routes/destinations.routes';
import reviewsRoutes from './routes/reviews.routes';
import inquiriesRoutes from './routes/inquiries.routes';
import contentRoutes from './routes/content.routes';
import settingsRoutes from './routes/settings.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize MongoDB connection
connectDB().catch((err) => {
  console.error('[Koober Server] Initial MongoDB connection error:', err);
});

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(authenticate);

// 1. Health check endpoint matching /api/health
app.get('/api/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const isStrictReadiness = req.query.ready === 'true';

  const mongoOk = isMongoConnected();
  const cloudinaryOk = isCloudinaryConfigured();
  const isHealthy = mongoOk && (!isStrictReadiness || cloudinaryOk);

  const latencyMs = Date.now() - startTime;

  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Content-Type': 'application/json',
  });

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'royalrides-travels',
    timestamp: new Date().toISOString(),
    database: mongoOk ? 'mongodb_connected' : 'disconnected',
    cloudinary: cloudinaryOk ? 'configured' : 'unconfigured',
    uptime_seconds: Math.round(process.uptime()),
    latency_ms: latencyMs,
  });
});

// 2. Cache revalidation endpoint matching /api/revalidate
app.post('/api/revalidate', (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const targetPath = typeof body.path === 'string' ? body.path : '/';

    return res.status(200).json({
      revalidated: true,
      path: targetPath,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to revalidate cache';
    return res.status(500).json({ error: message });
  }
});

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

// Compatibility route for /api/import-image
app.use('/api', uploadRoutes);

// 4. Serve Vite client static assets and SPA fallback in production
const possiblePaths = [
  path.resolve(process.cwd(), 'dist/client'),
  path.resolve(__dirname, '../client'),
  path.resolve(__dirname, '../dist/client'),
  path.resolve(__dirname, './client'),
];

const staticDir = possiblePaths.find((p) => fs.existsSync(p)) || null;

if (staticDir) {
  app.use(express.static(staticDir));

  // Any non-API GET request serves index.html for React Router SPA
  app.use((req: Request, res: Response, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(staticDir, 'index.html'));
    }
    next();
  });
}

// 5. Global Error Handler for API routes
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('[Koober Server] Unhandled Error:', err?.message || err);
  const status = typeof err?.status === 'number' ? err.status : 500;
  return res.status(status).json({
    error: err?.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`[Koober Server] Express backend listening on port ${PORT}`);
  if (staticDir) {
    console.log(`[Koober Server] Serving static client build from: ${staticDir}`);
  }
});

export default app;
