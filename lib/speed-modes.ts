// Speed optimization modes for background removal

export type SpeedMode = 'fast' | 'balanced' | 'quality';

export interface SpeedModeConfig {
  imageResize: {
    maxWidth: number;
    maxHeight: number;
    quality: number;
  };
  bgRemovalQuality: number;
  aggressiveOptimization: boolean;
}

export const SPEED_MODES: Record<SpeedMode, SpeedModeConfig> = {
  fast: {
    imageResize: {
      maxWidth: 256,     // Much smaller for maximum speed  
      maxHeight: 256,
      quality: 0.4       // Lower quality for speed
    },
    bgRemovalQuality: 0.4,  // Lower quality for maximum speed
    aggressiveOptimization: true
  },
  
  balanced: {
    imageResize: {
      maxWidth: 512,     // Balanced size
      maxHeight: 512,
      quality: 0.7       // Good quality
    },
    bgRemovalQuality: 0.7,  // Good quality
    aggressiveOptimization: true
  },
  
  quality: {
    imageResize: {
      maxWidth: 1024,    // Reasonable max size, no extreme upscaling
      maxHeight: 1024,
      quality: 0.95      // Very high quality with minimal compression
    },
    bgRemovalQuality: 0.9,  // Maximum quality
    aggressiveOptimization: false
  }
};

export function getSpeedModeConfig(mode: SpeedMode = 'fast'): SpeedModeConfig {
  return SPEED_MODES[mode];
}

export function getOptimizedSizeForMode(fileSize: number, mode: SpeedMode = 'fast') {
  const config = getSpeedModeConfig(mode);
  
  console.log('🎯 Speed mode:', mode, 'for file size:', (fileSize / 1024).toFixed(0) + 'KB');
  
  if (mode === 'fast') {
    // Ultra aggressive for maximum speed
    if (fileSize > 2 * 1024 * 1024) { // > 2MB
      console.log('📏 Large file detected - using 192x192');
      return { maxWidth: 192, maxHeight: 192, quality: 0.3 }; // Ultra small for speed
    } else if (fileSize > 1 * 1024 * 1024) { // > 1MB  
      console.log('📏 Medium-large file detected - using 224x224');
      return { maxWidth: 224, maxHeight: 224, quality: 0.3 }; // Small for speed
    } else if (fileSize > 500 * 1024) { // > 500KB
      console.log('📏 Medium file detected - using 256x256');
      return { maxWidth: 256, maxHeight: 256, quality: 0.4 }; // Use config default
    } else {
      console.log('📏 Small file detected - using 256x256');  
      return { maxWidth: 256, maxHeight: 256, quality: 0.4 }; // Use config default
    }
  }
  
  if (mode === 'balanced') {
    // Current implementation - target 10-15 seconds
    if (fileSize > 3 * 1024 * 1024) { // > 3MB
      return { maxWidth: 512, maxHeight: 512, quality: 0.6 };
    } else if (fileSize > 1 * 1024 * 1024) { // > 1MB
      return { maxWidth: 640, maxHeight: 640, quality: 0.65 };
    } else {
      return { maxWidth: 768, maxHeight: 768, quality: 0.7 };
    }
  }
  
  // Quality mode - slower but better results, always process for consistent quality
  if (fileSize > 5 * 1024 * 1024) { // > 5MB
    return { maxWidth: 800, maxHeight: 800, quality: 0.8 };
  } else if (fileSize > 2 * 1024 * 1024) { // > 2MB
    return { maxWidth: 1024, maxHeight: 1024, quality: 0.85 };
  } else {
    // Force processing but avoid excessive upscaling
    return { maxWidth: 1024, maxHeight: 1024, quality: 0.95, forceProcess: true };
  }
}