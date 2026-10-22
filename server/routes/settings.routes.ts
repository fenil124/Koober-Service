import { Router, Request, Response } from 'express';
import { SiteSettings } from '../models/SiteSettings';
import { requireAdmin, AuthenticatedRequest } from '../auth';

const router = Router();

const DEFAULT_SETTINGS = {
  id: 'default',
  agency_name: 'Koober Services',
  tagline: 'Comfortable Rides for Every Journey',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'contact@kooberservices.com',
  address: 'Ring Road, Surat, Gujarat 395002',
  logo_url: null,
  cloudinary_public_id: null,
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  cta_text: 'Book Your Ride',
};

// GET /api/settings
router.get('/', async (_req: Request, res: Response) => {
  try {
    let settings = await SiteSettings.findOne({ id: 'default' });
    if (!settings) {
      settings = await SiteSettings.create(DEFAULT_SETTINGS);
    }
    return res.json(settings);
  } catch (err: any) {
    console.error('Error fetching site settings:', err);
    return res.json(DEFAULT_SETTINGS);
  }
});

// PUT /api/settings
router.put('/', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body || {};
    const settings = await SiteSettings.findOneAndUpdate(
      { id: 'default' },
      { ...body, id: 'default' },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json(settings);
  } catch (err: any) {
    console.error('Error updating site settings:', err);
    return res.status(500).json({ error: err?.message || 'Failed to update site settings' });
  }
});

export default router;
