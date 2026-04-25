import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    file: any,
    folder: string = 'jopesa',
  ): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `jopesa/${folder}`,
            resource_type: 'auto',
          },
          (error, result: any) => {
            if (error) {
              reject(new BadRequestException(`Upload failed: ${error.message}`));
            } else if (result) {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            } else {
              reject(new BadRequestException('Upload failed: No result returned'));
            }
          },
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  async uploadMultipleFiles(
    files: any[],
    folder: string = 'jopesa',
  ): Promise<Array<{ url: string; publicId: string }>> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }

  async deleteMultipleFiles(publicIds: string[]): Promise<void> {
    try {
      await Promise.all(
        publicIds.map((id) => cloudinary.uploader.destroy(id)),
      );
    } catch (error) {
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }
}
