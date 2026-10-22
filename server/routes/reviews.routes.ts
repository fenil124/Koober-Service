import { Router, Request, Response } from 'express';
import { Review } from '../models/Review';
import { requireAdmin, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/reviews
router.get('/', async (_req: Request, res: Response) => {
  try {
    const reviews = await Review.find().sort({ display_order: 1, created_at: -1 });
    return res.json(reviews);
  } catch (err: any) {
    console.error('Error fetching reviews:', err);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const id = body.id || 'rv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const review = await Review.create({
      id,
      customer_name: body.customer_name || 'Guest Traveler',
      rating: Number(body.rating) || 5,
      review_text: body.review_text || '',
      avatar_url: body.avatar_url || null,
      cloudinary_public_id: body.cloudinary_public_id || null,
      is_published: body.is_published ?? true,
      is_demo: false,
      display_order: body.display_order || 0,
    });

    return res.status(201).json(review);
  } catch (err: any) {
    console.error('Error creating review:', err);
    return res.status(500).json({ error: err?.message || 'Failed to submit review' });
  }
});

// PUT /api/reviews/:id
router.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const review = await Review.findOneAndUpdate(
      { id },
      { ...body, id },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json(review);
  } catch (err: any) {
    console.error('Error updating review:', err);
    return res.status(500).json({ error: err?.message || 'Failed to update review' });
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await Review.findOneAndDelete({ id });
    if (!result) {
      return res.status(404).json({ error: 'Review not found' });
    }
    return res.json({ success: true, message: 'Review deleted' });
  } catch (err: any) {
    console.error('Error deleting review:', err);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
