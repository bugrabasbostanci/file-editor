import { removeBackground, preload, type Config, type ImageSource } from '@imgly/background-removal';
import { resizeImageForProcessing, getOptimalProcessingSize } from './image-optimizer';
import { getOptimizedSizeForMode, getSpeedModeConfig, type SpeedMode } from './speed-modes';

export interface BackgroundRemovalProgress {
  stage: 'loading' | 'processing' | 'completed' | 'error';
  progress: number; // 0-100
  message?: string;
}

export interface BackgroundRemovalResult {
  success: boolean;
  blob?: Blob;
  error?: string;
  originalFile: File;
}

class BackgroundRemovalService {
  private isInitialized = false;
  private isInitializing = false;

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) {
      return;
    }

    this.isInitializing = true;

    try {
      // Just check WebGPU availability - no preloading for flexibility with different modes
      const webGPUAvailable = await this.isWebGPUAvailable();
      
      console.log(`🚀 Background removal service initializing with ${webGPUAvailable ? 'GPU' : 'CPU'} acceleration`);
      
      this.isInitialized = true;
      console.log(`✅ Background removal service ready - models will be loaded dynamically based on selected mode`);
    } catch (error) {
      console.warn('Failed to initialize background removal service:', error);
      // Still mark as initialized to allow processing
      this.isInitialized = true;
    } finally {
      this.isInitializing = false;
    }
  }

  async removeBackground(
    file: File,
    speedMode: SpeedMode = 'balanced',
    onProgress?: (progress: BackgroundRemovalProgress) => void
  ): Promise<BackgroundRemovalResult> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      onProgress?.({
        stage: 'loading',
        progress: 10,
        message: 'Loading image...'
      });

      // Mode-based optimization
      console.log(`🚀 ${speedMode.toUpperCase()} MODE: Original file:`, file.name, 'type:', file.type, 'size:', (file.size / 1024).toFixed(0) + 'KB');
      
      const optimizationOptions = getOptimizedSizeForMode(file.size, speedMode);
      console.log('📸 Optimization settings:', optimizationOptions);
      
      const { optimizedFile, isOptimized } = await resizeImageForProcessing(file, optimizationOptions);
      
      const processingFile = optimizedFile;
      console.log('📊 Processing file:', isOptimized ? '✅ OPTIMIZED' : '❌ NOT OPTIMIZED', 
                  'size:', (processingFile.size / 1024).toFixed(0) + 'KB',
                  'reduction:', ((file.size - processingFile.size) / file.size * 100).toFixed(1) + '%');

      onProgress?.({
        stage: 'processing',
        progress: 30,
        message: 'Processing with AI...'
      });

      onProgress?.({
        stage: 'processing',
        progress: 90,
        message: 'Finalizing...'
      });

      // Try different approaches to pass the image to removeBackground
      let blob: Blob;
      
      try {
        // First try: Use optimized file directly with mode-based config
        console.log(`🎯 Attempt 1: Using optimized file directly with ${speedMode.toUpperCase()} config...`);
        const webGPUAvailable = await this.isWebGPUAvailable();
        const speedConfig = getSpeedModeConfig(speedMode);
        
        // Choose model based on speed mode
        const modelName = speedMode === 'fast' ? 'isnet_quint8' : 
                         speedMode === 'balanced' ? 'isnet_fp16' : 'isnet';
        
        console.log('🔧 Using config:', { quality: speedConfig.bgRemovalQuality, model: modelName, device: webGPUAvailable ? 'GPU' : 'CPU' });
        
        const modeConfig: Config = {
          model: modelName as any, // Dynamic model based on speed mode
          device: webGPUAvailable ? 'gpu' : 'cpu', // Use WebGPU if available
          proxyToWorker: true, // Use Web Worker for better performance
          debug: false, // Disable debug for production speed
          rescale: false, // Skip rescaling for speed (we handle optimization ourselves)
          output: {
            format: 'image/png',
            quality: speedConfig.bgRemovalQuality // Dynamic quality based on mode
          }
        };
        
        // Preload the specific model first to ensure it's ready
        console.log(`🔄 Preloading ${modelName} model...`);
        const preloadStart = Date.now();
        await preload(modeConfig);
        const preloadEnd = Date.now();
        console.log(`⚡ Model ${modelName} preloaded in ${((preloadEnd - preloadStart) / 1000).toFixed(1)}s`);
        
        const startTime = Date.now();
        blob = await removeBackground(processingFile, modeConfig);
        const endTime = Date.now();
        const processingTime = ((endTime - startTime) / 1000).toFixed(1);
        console.log(`✅ Background removal successful with ${speedMode.toUpperCase()} config in ${processingTime}s!`);
      } catch (error) {
        console.error('File approach failed:', error);
        
        try {
          // Second try: Create image element with optimized file
          console.log('Attempt 2: Using image element...');
          const imageUrl = URL.createObjectURL(processingFile);
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
          });
          
          blob = await removeBackground(img);
          console.log('Background removal successful with image element');
          URL.revokeObjectURL(imageUrl);
        } catch (error2) {
          console.error('Image element approach failed:', error2);
          
          try {
            // Third try: Use optimized file with fallback config
            console.log(`Attempt 3: Using optimized file with ${speedMode.toUpperCase()} fallback config...`);
            const speedConfig = getSpeedModeConfig(speedMode);
            const modelName = speedMode === 'fast' ? 'isnet_quint8' : 
                             speedMode === 'balanced' ? 'isnet_fp16' : 'isnet';
            
            const config: Config = {
              model: modelName as any, // Dynamic model based on speed mode
              device: 'gpu', // Force GPU for fallback
              proxyToWorker: true, // Use Web Worker for better performance
              debug: false, // Disable debug for production speed
              rescale: false, // Skip rescaling for speed (we handle optimization ourselves)
              output: {
                format: 'image/png',
                quality: speedConfig.bgRemovalQuality // Dynamic quality based on mode
              }
            };
            blob = await removeBackground(processingFile, config);
            console.log('Background removal successful with optimized config');
          } catch (error3) {
            console.error('All approaches failed:', error3);
            throw error3;
          }
        }
      }

      onProgress?.({
        stage: 'completed',
        progress: 100,
        message: 'Complete!'
      });

      return {
        success: true,
        blob,
        originalFile: file
      };

    } catch (error) {
      console.error('Background removal failed:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';

      onProgress?.({
        stage: 'error',
        progress: 0,
        message: errorMessage
      });

      return {
        success: false,
        error: errorMessage,
        originalFile: file
      };
    }
  }

  async processMultipleImages(
    files: File[],
    speedMode: SpeedMode = 'balanced',
    onProgress?: (fileIndex: number, progress: BackgroundRemovalProgress) => void,
    onComplete?: (fileIndex: number, result: BackgroundRemovalResult) => void
  ): Promise<BackgroundRemovalResult[]> {
    const results: BackgroundRemovalResult[] = [];

    // Initialize if not already done
    if (!this.isInitialized) {
      await this.initialize();
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await this.removeBackground(
          file,
          speedMode,
          (progress) => onProgress?.(i, progress)
        );
        
        results.push(result);
        onComplete?.(i, result);
        
      } catch (error) {
        const errorResult: BackgroundRemovalResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Processing failed',
          originalFile: file
        };
        
        results.push(errorResult);
        onComplete?.(i, errorResult);
      }
    }

    return results;
  }

  // Utility method to check if WebGPU is available
  async isWebGPUAvailable(): Promise<boolean> {
    if (!('gpu' in navigator)) {
      return false;
    }

    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      return adapter !== null;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const backgroundRemovalService = new BackgroundRemovalService();

// Export utility functions
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  const supportedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!supportedTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Unsupported image format. Use PNG, JPG, or WebP' };
  }

  return { valid: true };
};

export const createDownloadFilename = (originalName: string): string => {
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
  return `${nameWithoutExt}_no_bg.png`;
};