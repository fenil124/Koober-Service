import { Router, Request, Response } from 'express';
import { HomepageSection } from '../models/HomepageSection';
import { requireAdmin, AuthenticatedRequest } from '../auth';

const router = Router();

const DEFAULT_SECTIONS: Record<string, any> = {
  hero: {
    id: 'hero',
    title: 'Comfortable Rides for Every Journey',
    subtitle: 'Airport Transfers • Outstation Trips • City Travel & More',
    badge: 'PREMIUM CHAUFFEUR-DRIVEN CAR RENTAL',
    body: 'Experience effortless, punctual, and safe road journeys with our professionally driven fleet of modern cars.',
    image_url: '/images/hero-bg.jpg',
  },
  features: {
    id: 'features',
    title: 'Why Choose Koober Services',
    subtitle: 'Excellence in Every Mile',
    badge: 'OUR PROMISE',
    body: 'Punctual door-to-door pickups, sanitized and comfortable vehicles, experienced vetted chauffeurs, and transparent billing.',
  },
  about: {
    id: 'about',
    title: 'Premium Chauffeur-Driven Travel Services',
    subtitle: 'Dedicated to Comfort, Safety, and Reliable Road Journeys',
    badge: 'ABOUT KOOBER SERVICES',
    body: 'Koober Services is a premium car rental and travel agency specializing in outstation travel, airport transfers, corporate transit, and family tours.',
    image_url: '/images/airport-transfer.jpg',
  },
  contact: {
    id: 'contact',
    title: 'Ready to Plan Your Journey?',
    subtitle: 'Get in touch with our team for quick quotes, custom itineraries, and reservations.',
    badge: 'CONTACT US',
    body: 'Available 24/7 for emergency bookings, corporate packages, and outstation inquiries.',
  },
};

// GET /api/content
router.get('/', async (_req: Request, res: Response) => {
  try {
    const list = await HomepageSection.find();
    const map: Record<string, any> = { ...DEFAULT_SECTIONS };

    for (const item of list) {
      map[item.id] = item.toJSON();
    }

    return res.json(map);
  } catch (err: any) {
    console.error('Error fetching homepage content:', err);
    return res.json(DEFAULT_SECTIONS);
  }
});

// GET /api/content/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const sectionId = String(req.params.id);
    const section = await HomepageSection.findOne({ id: sectionId });
    if (!section) {
      return res.json(DEFAULT_SECTIONS[sectionId] || null);
    }
    return res.json(section);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// PUT /api/content/:id
router.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const resolvedImageUrl = body.image_url || body.hero_image_url || null;

    const payload = {
      id,
      title: body.title,
      subtitle: body.subtitle,
      badge: body.badge,
      body: body.body,
      image_url: resolvedImageUrl,
      cloudinary_public_id: body.cloudinary_public_id || null,
    };

    const section = await HomepageSection.findOneAndUpdate({ id }, payload, {
      returnDocument: 'after',
      upsert: true,
      runValidators: true,
    });

    return res.json(section);
  } catch (err: any) {
    console.error('Error updating homepage section:', err);
    return res.status(500).json({ error: err?.message || 'Failed to update section content' });
  }
});

export default router;
