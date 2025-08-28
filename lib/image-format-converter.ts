export type SupportedFormat = 'png' | 'jpeg' | 'jpg' | 'webp';

export interface ConversionOptions {
  quality?: number; // 0-1 for JPEG and WebP
  format: SupportedFormat;
}

export class ImageFormatConverter {
  static async convertImage(
    file: File,
    options: ConversionOptions
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        let mimeType: string;
        let quality: number | undefined;

        switch (options.format) {
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
            reject(new Error(`Unsupported format: ${options.format}`));
            return;
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image'));
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

  static getFormatFromFile(file: File): SupportedFormat | null {
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

  static getFileExtension(format: SupportedFormat): string {
    switch (format) {
      case 'jpeg':
        return 'jpg';
      default:
        return format;
    }
  }
}