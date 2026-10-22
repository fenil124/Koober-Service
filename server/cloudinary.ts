import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  const rawApiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
  const apiKey = rawApiKey.replace(/^Y(?=\d{10,})/i, '');
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }
  return false;
}

// Initial configuration
configureCloudinary();

export { cloudinary };

export function isCloudinaryConfigured(): boolean {
  return configureCloudinary();
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string = 'royalrides',
  customPublicId?: string
): Promise<{ url: string; secure_url: string; public_id: string; format: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Check environment variables.');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: customPublicId,
        resource_type: 'image',
        overwrite: true,
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload returned empty result'));
        }
        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export async function uploadUrlToCloudinary(
  url: string,
  folder: string = 'royalrides',
  customPublicId?: string
): Promise<{ url: string; secure_url: string; public_id: string; format: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Check environment variables.');
  }

  const result = await cloudinary.uploader.upload(url, {
    folder,
    public_id: customPublicId,
    resource_type: 'image',
    overwrite: true,
  });

  return {
    url: result.url,
    secure_url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
  };
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!isCloudinaryConfigured() || !publicId) return false;
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch (err) {
    console.warn(`[Cloudinary] Failed to delete asset ${publicId}:`, err);
    return false;
  }
}
