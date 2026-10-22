import { Router, Request, Response } from 'express';
import { Car } from '../models/Car';
import { requireAdmin, AuthenticatedRequest } from '../auth';

const router = Router();

function formatCarResponse(carDoc: any) {
  if (!carDoc) return carDoc;
  const doc = carDoc.toJSON ? carDoc.toJSON() : { ...carDoc };
  const gallery = Array.isArray(doc.gallery_images) && doc.gallery_images.length > 0
    ? doc.gallery_images
    : Array.isArray(doc.gallery) && doc.gallery.length > 0
    ? doc.gallery
    : [];
  return {
    ...doc,
    gallery,
    gallery_images: gallery,
  };
}

// GET /api/cars
router.get('/', async (_req: Request, res: Response) => {
  try {
    const cars = await Car.find().sort({ display_order: 1, created_at: -1 });
    return res.json(cars.map(formatCarResponse));
  } catch (err: any) {
    console.error('Error fetching cars:', err);
    return res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// GET /api/cars/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const car = await Car.findOne({ id: req.params.id });
    if (!car) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.json(formatCarResponse(car));
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// POST /api/cars
router.post('/', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body || {};
    const id = body.id || 'car_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const rawGallery = body.gallery_images !== undefined ? body.gallery_images : body.gallery;
    const gallery = Array.isArray(rawGallery) ? rawGallery : [];

    const payload = {
      ...body,
      id,
      hero_image_url: body.hero_image_url || body.image_url,
      gallery,
      gallery_images: gallery,
    };

    const car = await Car.findOneAndUpdate({ id }, payload, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    return res.status(201).json(formatCarResponse(car));
  } catch (err: any) {
    console.error('Error saving car:', err);
    return res.status(500).json({ error: err?.message || 'Failed to save vehicle' });
  }
});

// PUT /api/cars/:id
router.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const rawGallery = body.gallery_images !== undefined ? body.gallery_images : body.gallery;
    const updatePayload: any = {
      ...body,
      id,
      hero_image_url: body.hero_image_url || body.image_url,
    };

    if (rawGallery !== undefined) {
      const gallery = Array.isArray(rawGallery) ? rawGallery : [];
      updatePayload.gallery = gallery;
      updatePayload.gallery_images = gallery;
    }

    const car = await Car.findOneAndUpdate(
      { id },
      updatePayload,
      { new: true, upsert: true, runValidators: true }
    );

    return res.json(formatCarResponse(car));
  } catch (err: any) {
    console.error('Error updating car:', err);
    return res.status(500).json({ error: err?.message || 'Failed to update vehicle' });
  }
});

// DELETE /api/cars/:id
router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await Car.findOneAndDelete({ id });
    if (!result) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err: any) {
    console.error('Error deleting car:', err);
    return res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

export default router;
