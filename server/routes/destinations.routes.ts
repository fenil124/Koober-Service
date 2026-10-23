import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Destination } from '../models/Destination';
import { requireAdmin, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/destinations
router.get('/', async (_req: Request, res: Response) => {
  try {
    const destinations = await Destination.find().sort({ display_order: 1, created_at: -1 });
    const formatted = destinations.map((d: any) => {
      const obj = d.toJSON ? d.toJSON() : (d.toObject ? d.toObject() : d);
      const isPub = obj.is_published !== undefined
        ? Boolean(obj.is_published)
        : (obj.is_active !== undefined ? Boolean(obj.is_active) : true);
      return {
        ...obj,
        is_published: isPub,
        is_active: isPub,
      };
    });
    return res.json(formatted);
  } catch (err: any) {
    console.error('Error fetching destinations:', err);
    return res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// GET /api/destinations/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const dest = await Destination.findOne({ id: req.params.id });
    if (!dest) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    const obj = dest.toJSON ? dest.toJSON() : (dest.toObject ? dest.toObject() : dest);
    const isPub = obj.is_published !== undefined
      ? Boolean(obj.is_published)
      : (obj.is_active !== undefined ? Boolean(obj.is_active) : true);
    return res.json({
      ...obj,
      is_published: isPub,
      is_active: isPub,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch destination' });
  }
});

// POST /api/destinations
router.post('/', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body || {};
    const id = body.id || 'dest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    if (body.is_published !== undefined) {
      body.is_active = Boolean(body.is_published);
      body.is_published = Boolean(body.is_published);
    } else if (body.is_active !== undefined) {
      body.is_published = Boolean(body.is_active);
      body.is_active = Boolean(body.is_active);
    } else {
      body.is_published = true;
      body.is_active = true;
    }

    const destination = await Destination.findOneAndUpdate(
      { id },
      { ...body, id },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    const obj = destination.toJSON ? destination.toJSON() : destination;
    return res.status(201).json({
      ...obj,
      is_published: Boolean(obj.is_published),
      is_active: Boolean(obj.is_active),
    });
  } catch (err: any) {
    console.error('Error saving destination:', err);
    return res.status(500).json({ error: err?.message || 'Failed to save destination' });
  }
});

// PUT /api/destinations/:id
router.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    if (body.is_published !== undefined) {
      body.is_active = Boolean(body.is_published);
      body.is_published = Boolean(body.is_published);
    } else if (body.is_active !== undefined) {
      body.is_published = Boolean(body.is_active);
      body.is_active = Boolean(body.is_active);
    }

    const destination = await Destination.findOneAndUpdate(
      { id },
      { ...body, id },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    const obj = destination.toJSON ? destination.toJSON() : destination;
    return res.json({
      ...obj,
      is_published: Boolean(obj.is_published),
      is_active: Boolean(obj.is_active),
    });
  } catch (err: any) {
    console.error('Error updating destination:', err);
    return res.status(500).json({ error: err?.message || 'Failed to update destination' });
  }
});

// DELETE /api/destinations/:id
router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const query: any = mongoose.isValidObjectId(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };

    const result = await Destination.findOneAndDelete(query);
    return res.json({ success: true, message: 'Destination deleted', deleted: Boolean(result) });
  } catch (err: any) {
    console.error('Error deleting destination:', err);
    return res.status(500).json({ error: 'Failed to delete destination' });
  }
});

export default router;
