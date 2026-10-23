import { Router, Request, Response } from 'express';
import { Route } from '../models/Route';
import { requireAdmin, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/routes
router.get('/', async (_req: Request, res: Response) => {
  try {
    const routes = await Route.find().sort({ display_order: 1, created_at: -1 });
    return res.json(routes);
  } catch (err: any) {
    console.error('Error fetching routes:', err);
    return res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// GET /api/routes/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const route = await Route.findOne({ id: req.params.id });
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    return res.json(route);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch route' });
  }
});

// POST /api/routes
router.post('/', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body || {};
    const id = body.id || 'rt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const route = await Route.findOneAndUpdate(
      { id },
      { ...body, id },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    return res.status(201).json(route);
  } catch (err: any) {
    console.error('Error saving route:', err);
    return res.status(500).json({ error: err?.message || 'Failed to save route' });
  }
});

// PUT /api/routes/:id
router.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const route = await Route.findOneAndUpdate(
      { id },
      { ...body, id },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    return res.json(route);
  } catch (err: any) {
    console.error('Error updating route:', err);
    return res.status(500).json({ error: err?.message || 'Failed to update route' });
  }
});

// DELETE /api/routes/:id
router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await Route.findOneAndDelete({ id });
    if (!result) {
      return res.status(404).json({ error: 'Route not found' });
    }
    return res.json({ success: true, message: 'Route deleted' });
  } catch (err: any) {
    console.error('Error deleting route:', err);
    return res.status(500).json({ error: 'Failed to delete route' });
  }
});

export default router;
