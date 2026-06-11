import { v2 as cloudinary, type UploadApiResponse, type UploadApiErrorResponse } from 'cloudinary';
import { config } from '../../configs/env';

export interface ICloudinaryService {
  uploadImage(file: File | string, folder?: string): Promise<string>;
  deleteImage(publicIdOrUrl: string): Promise<boolean>;
}

export class CloudinaryService implements ICloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
    });
  }

  /**
   * Uploads an image to Cloudinary.
   * Accepts either a base64 string or a native Web `File` object (useful for Hono multipart forms).
   * 
   * @param file - Base64 string or File object.
   * @param folder - The folder name in Cloudinary (e.g., 'slavecode/bug_reports').
   * @returns The secure URL of the uploaded image.
   */
  public async uploadImage(file: File | string, folder: string = 'slavecode/general'): Promise<string> {
    let fileData = file;

    // If it's a web File (e.g., from Hono multipart form data), convert it to Base64
    if (typeof file !== 'string' && file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
      fileData = base64String;
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        fileData as string,
        {
          folder,
          resource_type: 'image',
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(error || new Error('Unknown error during Cloudinary upload'));
          } else {
            resolve(result.secure_url);
          }
        }
      );
    });
  }

  /**
   * Deletes an image from Cloudinary using its secure URL or public ID.
   * @param publicIdOrUrl - The public ID or the full secure URL of the image.
   * @returns Boolean indicating success.
   */
  public async deleteImage(publicIdOrUrl: string): Promise<boolean> {
    let publicId = publicIdOrUrl;

    // Extract public ID if a full Cloudinary URL is provided
    if (publicIdOrUrl.startsWith('http')) {
      const parts = publicIdOrUrl.split('/');
      const lastPart = parts[parts.length - 1];
      const uploadIndex = parts.findIndex(p => p === 'upload');
      
      // Handle the folder path structure inside Cloudinary
      const folderPath = parts.slice(uploadIndex + 2, -1).join('/');
      const fileNameWithoutExt = lastPart.split('.')[0];
      publicId = folderPath ? `${folderPath}/${fileNameWithoutExt}` : fileNameWithoutExt;
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        (error: UploadApiErrorResponse | undefined, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.result === 'ok');
          }
        }
      );
    });
  }
}
