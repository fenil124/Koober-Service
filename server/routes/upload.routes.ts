import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadBufferToCloudinary, uploadUrlToCloudinary, isCloudinaryConfigured } from '../cloudinary';
import { requireAdmin, AuthenticatedRequest } from '../auth';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported image type (${file.mimetype}). Please upload JPG, PNG, WebP, or SVG.`));
    }
  },
});

// POST /api/upload - Direct multipart/form-data file upload to Cloudinary
router.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Image file is too large. Maximum allowed size is 10MB.' });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ error: err.message || 'Invalid upload file' });
      }

      // Validate authentication and admin privileges after multipart body has been consumed
      // This prevents TCP connection aborts / ERR_CONNECTION_RESET when unauthorized
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
      }
      if (authReq.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access forbidden: Administrator privileges required.' });
      }

      next();
    });
  },
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({ error: 'Cloudinary storage is not configured on the server.' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const folderCategory = (req.body?.folder || 'general').replace(/[^a-zA-Z0-9_-]/g, '');
    const folder = `royalrides/${folderCategory}`;

    try {
      const cleanName = file.originalname
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);
      const customPublicId = `${Date.now()}_${cleanName}`;

      const result = await uploadBufferToCloudinary(file.buffer, folder, customPublicId);

      return res.status(200).json({
        success: true,
        url: result.secure_url,
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        sizeBytes: file.size,
      });
    } catch (err: any) {
      console.error('Cloudinary upload error:', err?.message || err);
      return res.status(500).json({ error: err?.message || 'Failed to upload image to Cloudinary' });
    }
  }
);

// POST /api/import-image - Safely import an external URL into Cloudinary
router.post('/import-image', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { url, folder } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are supported' });
  }

  // SSRF Protection: Prevent accessing internal/private network endpoints
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '169.254.169.254',
      'metadata.google.internal',
      'instance-data',
    ];

    if (
      blockedHosts.includes(host) ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
    ) {
      return res.status(400).json({ error: 'Import rejected: Private or internal network destination is not allowed.' });
    }
  } catch (_e) {
    return res.status(400).json({ error: 'Malformed image URL provided' });
  }

  if (!isCloudinaryConfigured()) {
    return res.status(503).json({ error: 'Cloudinary storage is not configured on the server.' });
  }

  try {
    const folderCategory = (folder || 'general').replace(/[^a-zA-Z0-9_-]/g, '');
    const targetFolder = `royalrides/${folderCategory}`;
    const customPublicId = `imported_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const result = await uploadUrlToCloudinary(trimmed, targetFolder, customPublicId);

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
    });
  } catch (err: any) {
    console.error('Cloudinary import error:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to import image to Cloudinary' });
  }
});

export default router;
