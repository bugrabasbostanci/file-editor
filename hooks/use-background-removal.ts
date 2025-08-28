'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  backgroundRemovalService, 
  BackgroundRemovalProgress,
  BackgroundRemovalResult,
  validateImageFile,
  createDownloadFilename
} from '@/lib/background-remover';
import { SpeedMode } from '@/lib/speed-modes';
import { ProcessedImage } from '@/components/background-removal-preview';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface BackgroundRemovalStats {
  totalImages: number;
  processedImages: number;
  errorCount: number;
  isProcessing: boolean;
  processingTime: number; // in seconds
  startTime?: number;
}

export function useBackgroundRemoval() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [speedMode, setSpeedMode] = useState<SpeedMode>('balanced'); // Default to balanced
  const [stats, setStats] = useState<BackgroundRemovalStats>({
    totalImages: 0,
    processedImages: 0,
    errorCount: 0,
    isProcessing: false,
    processingTime: 0
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and preload model when hook mounts
  useEffect(() => {
    let mounted = true;
    
    const initializeService = async () => {
      if (!isInitializing && mounted) {
        setIsInitializing(true);
        try {
          console.log('🚀 Preloading AI model for faster processing...');
          await backgroundRemovalService.initialize();
          console.log('✅ Background removal service ready - processing will be faster now!');
        } catch (error) {
          console.warn('⚠️ Model preload failed, but processing will still work:', error);
        } finally {
          if (mounted) {
            setIsInitializing(false);
          }
        }
      }
    };

    initializeService();

    return () => {
      mounted = false;
      // Cleanup timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Add files to the processing queue
  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: ProcessedImage[] = [];
    const invalidFiles: { file: File; reason: string }[] = [];

    newFiles.forEach(file => {
      const validation = validateImageFile(file);
      
      if (validation.valid) {
        const originalUrl = URL.createObjectURL(file);
        validFiles.push({
          originalFile: file,
          originalUrl,
          isProcessing: false
        });
      } else {
        invalidFiles.push({ file, reason: validation.error! });
      }
    });

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
      setStats(prev => ({
        ...prev,
        totalImages: prev.totalImages + validFiles.length
      }));
    }

    // Show warnings for invalid files
    if (invalidFiles.length > 0) {
      const message = invalidFiles
        .map(({ file, reason }) => `${file.name}: ${reason}`)
        .join('\n');
      
      console.warn('Some files were not added:', message);
      // You could show a toast notification here
    }
  }, []);

  // Remove a single image
  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const removedImage = newImages[index];
      
      // Clean up URLs
      if (removedImage.originalUrl) {
        URL.revokeObjectURL(removedImage.originalUrl);
      }
      if (removedImage.processedUrl) {
        URL.revokeObjectURL(removedImage.processedUrl);
      }
      
      newImages.splice(index, 1);
      return newImages;
    });

    setStats(prev => ({
      ...prev,
      totalImages: prev.totalImages - 1,
      processedImages: Math.max(0, prev.processedImages - 1),
      processingTime: 0 // Reset timer when removing images
    }));
  }, []);

  // Clear all images
  const clearAllImages = useCallback(() => {
    // Clean up all URLs
    images.forEach(image => {
      if (image.originalUrl) {
        URL.revokeObjectURL(image.originalUrl);
      }
      if (image.processedUrl) {
        URL.revokeObjectURL(image.processedUrl);
      }
    });

    setImages([]);
    setStats({
      totalImages: 0,
      processedImages: 0,
      errorCount: 0,
      isProcessing: false,
      processingTime: 0
    });
  }, [images]);

  // Process all images
  const processImages = useCallback(async () => {
    if (isProcessing || images.length === 0) {
      return;
    }

    const startTime = Date.now();
    
    setIsProcessing(true);
    setStats(prev => ({ 
      ...prev, 
      isProcessing: true, 
      startTime,
      processingTime: 0 
    }));

    // Start timer
    timerRef.current = setInterval(() => {
      setStats(prev => ({
        ...prev,
        processingTime: Math.floor((Date.now() - startTime) / 1000)
      }));
    }, 1000);
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    try {
      // Reset processing state for all images
      setImages(prev => 
        prev.map(img => ({
          ...img,
          isProcessing: false,
          error: undefined,
          processedUrl: undefined,
          processedBlob: undefined
        }))
      );

      const filesToProcess = images
        .filter(img => !img.processedUrl && !img.error)
        .map(img => img.originalFile);

      if (filesToProcess.length === 0) {
        return;
      }

      let processedCount = 0;
      let errorCount = 0;

      const results = await backgroundRemovalService.processMultipleImages(
        filesToProcess,
        speedMode, // Pass the selected speed mode
        // Progress callback
        (fileIndex, progress) => {
          const originalFileName = filesToProcess[fileIndex].name;
          
          setImages(prev => 
            prev.map(img => {
              if (img.originalFile.name === originalFileName) {
                // Start timing when processing begins
                if (progress.stage === 'processing' && !img.startTime) {
                  return {
                    ...img,
                    isProcessing: true,
                    startTime: Date.now()
                  };
                }
                
                return {
                  ...img,
                  isProcessing: progress.stage === 'processing' || progress.stage === 'loading'
                };
              }
              return img;
            })
          );
        },
        // Complete callback
        (fileIndex, result) => {
          const originalFileName = result.originalFile.name;
          const endTime = Date.now();
          
          setImages(prev => 
            prev.map(img => {
              if (img.originalFile.name === originalFileName) {
                const processingTime = img.startTime 
                  ? Math.floor((endTime - img.startTime) / 1000) 
                  : 0;
                
                if (result.success && result.blob) {
                  const processedUrl = URL.createObjectURL(result.blob);
                  processedCount++;
                  
                  console.log(`✅ ${originalFileName} processed in ${processingTime}s`);
                  
                  return {
                    ...img,
                    isProcessing: false,
                    processedUrl,
                    processedBlob: result.blob,
                    error: undefined,
                    processingTime
                  };
                } else {
                  errorCount++;
                  
                  console.log(`❌ ${originalFileName} failed after ${processingTime}s`);
                  
                  return {
                    ...img,
                    isProcessing: false,
                    error: result.error || 'Processing failed',
                    processedUrl: undefined,
                    processedBlob: undefined,
                    processingTime
                  };
                }
              }
              return img;
            })
          );

          // Update stats
          setStats(prev => ({
            ...prev,
            processedImages: processedCount,
            errorCount: errorCount
          }));
        }
      );

      console.log('Background removal completed:', {
        total: filesToProcess.length,
        processed: processedCount,
        errors: errorCount
      });

    } catch (error) {
      console.error('Background removal process failed:', error);
      
      // Mark all processing images as errored
      setImages(prev =>
        prev.map(img => 
          img.isProcessing 
            ? { ...img, isProcessing: false, error: 'Processing interrupted' }
            : img
        )
      );
      
    } finally {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const endTime = Date.now();
      const totalTime = Math.floor((endTime - startTime) / 1000);
      
      setIsProcessing(false);
      setStats(prev => ({ 
        ...prev, 
        isProcessing: false, 
        processingTime: totalTime
      }));
      
      console.log(`🎯 Processing completed in ${totalTime} seconds`);
      abortControllerRef.current = null;
    }
  }, [images, isProcessing]);

  // Download single processed image
  const downloadSingle = useCallback((index: number) => {
    const image = images[index];
    
    if (!image.processedBlob) {
      console.warn('No processed image available for download');
      return;
    }

    const filename = createDownloadFilename(image.originalFile.name);
    saveAs(image.processedBlob, filename);
  }, [images]);

  // Download all processed images as ZIP
  const downloadAllAsZip = useCallback(async () => {
    const processedImages = images.filter(img => img.processedBlob);
    
    if (processedImages.length === 0) {
      console.warn('No processed images available for download');
      return;
    }

    try {
      const zip = new JSZip();
      
      for (const image of processedImages) {
        if (image.processedBlob) {
          const filename = createDownloadFilename(image.originalFile.name);
          zip.file(filename, image.processedBlob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      saveAs(zipBlob, `background-removed-images-${timestamp}.zip`);
      
    } catch (error) {
      console.error('Failed to create ZIP file:', error);
    }
  }, [images]);

  // Cancel processing
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    images,
    stats,
    isProcessing,
    isInitializing,
    speedMode,
    setSpeedMode,
    addFiles,
    removeImage,
    clearAllImages,
    processImages,
    downloadSingle,
    downloadAllAsZip,
    cancelProcessing
  };
}