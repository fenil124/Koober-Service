import { Router, Request, Response } from 'express';
import { Inquiry } from '../models/Inquiry';
import { requireAdmin, requireStaffOrAdmin, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/inquiries
router.get('/', requireStaffOrAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const inquiries = await Inquiry.find().sort({ created_at: -1 });
    return res.json(inquiries);
  } catch (err: any) {
    console.error('Error fetching inquiries:', err);
    return res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// POST /api/inquiries (Public submission)
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    if (!body.customer_name || !body.phone || !body.pickup_location || !body.destination || !body.travel_date) {
      return res.status(400).json({ error: 'Please provide all required inquiry details.' });
    }

    const id = body.id || 'inq_' + Date.now() + '_' + Math.floor(Math.random() * 10000);

    const submission_type =
      body.submission_type === 'inquiry' || body.type === 'inquiry' ? 'inquiry' : 'booking';

    const inquiry = await Inquiry.create({
      id,
      customer_name: String(body.customer_name).trim(),
      phone: String(body.phone).trim(),
      pickup_location: String(body.pickup_location).trim(),
      destination: String(body.destination).trim(),
      travel_date: String(body.travel_date).trim(),
      travel_time: body.travel_time || 'Morning',
      car_name: body.car_name || null,
      car_id: body.car_id || null,
      passengers: Number(body.passengers) || 1,
      trip_type: body.trip_type === 'round-trip' ? 'round-trip' : 'one-way',
      message: body.message || null,
      status: 'New',
      submission_type,
      source: body.source || 'website',
    });

    return res.status(201).json(inquiry);
  } catch (err: any) {
    console.error('Error creating inquiry:', err);
    return res.status(500).json({ error: err?.message || 'Failed to submit booking inquiry' });
  }
});

// PUT /api/inquiries/:id (Admin status update)
router.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const inquiry = await Inquiry.findOneAndUpdate(
      { id },
      { ...body, id },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    return res.json(inquiry);
  } catch (err: any) {
    console.error('Error updating inquiry:', err);
    return res.status(500).json({ error: err?.message || 'Failed to update inquiry' });
  }
});

// DELETE /api/inquiries/:id
router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await Inquiry.findOneAndDelete({ id });
    if (!result) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    return res.json({ success: true, message: 'Inquiry deleted' });
  } catch (err: any) {
    console.error('Error deleting inquiry:', err);
    return res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

export default router;
