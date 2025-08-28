// Image optimization utilities for faster background removal

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: string;
  forceProcess?: boolean; // Force processing even for small files
}

export function resizeImageForProcessing(
  file: File, 
  options: ImageOptimizationOptions = {}
): Promise<{ optimizedFile: File; isOptimized: boolean }> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 256,   // ULTRA small default for speed
      maxHeight = 256,
      quality = 0.3,    // ULTRA low quality default for speed
      format = 'image/jpeg',
      forceProcess = false // Force processing even for small files
    } = options;

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve({ optimizedFile: file, isOptimized: false });
      return;
    }

    img.onload = () => {
      let { width, height } = img;
      const originalDimensions = `${width}x${height}`;
      let needsResize = false;

      console.log('📐 Original image:', originalDimensions, 'target max:', `${maxWidth}x${maxHeight}`);

      // Check if image needs resizing (both upscaling and downscaling)
      const originalSize = Math.max(width, height);
      const targetSize = Math.max(maxWidth, maxHeight);
      
      if (originalSize !== targetSize || forceProcess) {
        needsResize = true;
        
        // Calculate new dimensions maintaining aspect ratio
        const aspectRatio = width / height;
        
        if (originalSize < targetSize && quality >= 0.95) {
          // Conservative upscaling - only if not too extreme
          const upscaleFactor = targetSize / originalSize;
          
          if (upscaleFactor <= 2.0) {
            // Reasonable upscaling (max 2x)
            if (width < height) {
              height = targetSize;
              width = height * aspectRatio;
            } else {
              width = targetSize;
              height = width / aspectRatio;
            }
            console.log('🔍 Conservative upscaling (2x max) to:', `${Math.round(width)}x${Math.round(height)}`);
          } else {
            // Too much upscaling - keep original size but force recompression
            console.log('⚠️ Avoiding excessive upscaling - keeping original size with high quality compression');
          }
        } else if (originalSize > targetSize) {
          // Downscaling for speed
          if (width > height) {
            width = Math.min(width, maxWidth);
            height = width / aspectRatio;
          } else {
            height = Math.min(height, maxHeight);
            width = height * aspectRatio;
          }
          console.log('🔄 Downscaling for speed to:', `${Math.round(width)}x${Math.round(height)}`);
        } else if (forceProcess) {
          // Same size but force recompression
          console.log('🔧 Force recompression at same size:', `${Math.round(width)}x${Math.round(height)}`);
        }
      }

      // Only skip optimization if no resize needed AND not forced AND very small file
      if (!needsResize && !forceProcess && quality >= 0.8 && file.size < 30 * 1024) {
        console.log('⚠️ Skipping optimization - tiny file with high quality:', (file.size / 1024).toFixed(0) + 'KB');
        resolve({ optimizedFile: file, isOptimized: false });
        return;
      }
      
      // If forceProcess is true, always apply compression for consistency
      if (forceProcess && !needsResize) {
        console.log('🔧 Force processing enabled - applying compression for consistency');
      }
      
      console.log('🎨 Applying compression with quality:', quality);

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const optimizedFile = new File(
              [blob], 
              file.name.replace(/\.[^/.]+$/, '.jpg'), 
              { type: format }
            );
            
            console.log(`📸 Image optimized: ${(file.size / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB`);
            resolve({ optimizedFile, isOptimized: true });
          } else {
            resolve({ optimizedFile: file, isOptimized: false });
          }
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      resolve({ optimizedFile: file, isOptimized: false });
    };

    img.src = URL.createObjectURL(file);
  });
}

export function getOptimalProcessingSize(fileSize: number): ImageOptimizationOptions {
  // Aggressive optimization for maximum speed (10-15 seconds target)
  if (fileSize > 3 * 1024 * 1024) { // > 3MB (lowered threshold)
    return { maxWidth: 512, maxHeight: 512, quality: 0.6 }; // Much smaller & lower quality
  } else if (fileSize > 1 * 1024 * 1024) { // > 1MB (lowered threshold)
    return { maxWidth: 640, maxHeight: 640, quality: 0.65 }; // Smaller size
  } else if (fileSize > 500 * 1024) { // > 500KB
    return { maxWidth: 768, maxHeight: 768, quality: 0.7 }; // Still smaller than before
  } else {
    return { maxWidth: 800, maxHeight: 800, quality: 0.75 }; // Even small files get optimized
  }
}