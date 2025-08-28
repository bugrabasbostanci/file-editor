export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  format?: 'png' | 'jpeg' | 'jpg' | 'webp';
  quality?: number; // 0-1 for JPEG and WebP
}

export class ImageResizer {
  static async resizeImage(
    file: File,
    options: ResizeOptions
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let targetWidth = img.width;
        let targetHeight = img.height;

        // Apply resize options if provided
        if (options.width || options.height) {
          const { width, height, maintainAspectRatio = true } = options;
          
          if (maintainAspectRatio) {
            const aspectRatio = img.width / img.height;
            
            if (width && height) {
              // Both dimensions provided - choose the one that maintains aspect ratio better
              const widthBasedHeight = width / aspectRatio;
              const heightBasedWidth = height * aspectRatio;
              
              if (widthBasedHeight <= height) {
                targetWidth = width;
                targetHeight = widthBasedHeight;
              } else {
                targetWidth = heightBasedWidth;
                targetHeight = height;
              }
            } else if (width) {
              targetWidth = width;
              targetHeight = width / aspectRatio;
            } else if (height) {
              targetHeight = height;
              targetWidth = height * aspectRatio;
            }
          } else {
            // Don't maintain aspect ratio
            if (width) targetWidth = width;
            if (height) targetHeight = height;
          }
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Clear canvas with white background for JPG/JPEG to avoid transparency issues
        const outputFormat = options.format || this.getFormatFromFile(file) || 'png';
        if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        let mimeType: string;
        let quality: number | undefined;

        switch (outputFormat) {
          case 'png':
            mimeType = 'image/png';
            break;
          case 'jpeg':
          case 'jpg':
            mimeType = 'image/jpeg';
            quality = options.quality || 0.9;
            break;
          case 'webp':
            mimeType = 'image/webp';
            quality = options.quality || 0.9;
            break;
          default:
            mimeType = 'image/png';
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  static getFormatFromFile(file: File): 'png' | 'jpeg' | 'webp' | null {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'png':
        return 'png';
      case 'jpg':
      case 'jpeg':
        return 'jpeg';
      case 'webp':
        return 'webp';
      default:
        return null;
    }
  }

  static isSupported(file: File): boolean {
    return this.getFormatFromFile(file) !== null;
  }

  static getFileExtension(format: string): string {
    switch (format) {
      case 'jpeg':
        return 'jpg';
      default:
        return format;
    }
  }
}