'use client';

import { useState, useCallback } from 'react';
import { ProcessedFile, ProcessingOptions, ProcessingStats } from '@/lib/types';
import { createProcessedFile, validateFiles } from '@/lib/file-processor';

interface UseFileProcessingReturn {
  // State
  files: ProcessedFile[];
  isProcessing: boolean;
  processingStats: ProcessingStats;
  
  // Actions
  addFiles: (newFiles: File[]) => { valid: number; invalid: Array<{ file: File; reason: string }> };
  removeFile: (index: number) => void;
  clearFiles: () => void;
  processFiles: (options: ProcessingOptions) => Promise<void>;
  downloadFile: (processedFile: ProcessedFile) => void;
  downloadAllAsZip: () => Promise<void>;
}

export function useFileProcessing(): UseFileProcessingReturn {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    const { valid, invalid } = validateFiles(newFiles);
    
    if (valid.length > 0) {
      const processedFiles = valid.map(file => createProcessedFile(file, { 
        textsToRemove: [], 
        processType: 'both' 
      }));
      
      setFiles(prevFiles => [...prevFiles, ...processedFiles]);
    }
    
    return { valid: valid.length, invalid };
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const processFiles = useCallback(async (options: ProcessingOptions) => {
    setIsProcessing(true);
    
    try {
      const updatedFiles = files.map(file => {
        try {
          const newProcessedFile = createProcessedFile(file.originalFile, options);
          return {
            ...newProcessedFile,
            status: 'completed' as const
          };
        } catch (error) {
          return {
            ...file,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Processing failed'
          };
        }
      });

      setFiles(updatedFiles);
    } finally {
      setIsProcessing(false);
    }
  }, [files]);

  const downloadFile = useCallback((processedFile: ProcessedFile) => {
    const url = URL.createObjectURL(processedFile.originalFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = processedFile.processedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const downloadAllAsZip = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');
    
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length === 0) return;

    const zip = new JSZip();
    
    // Add each file to the zip
    for (const processedFile of completedFiles) {
      zip.file(processedFile.processedName, processedFile.originalFile);
    }

    try {
      // Generate the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `processed-images-${timestamp}.zip`;
      
      // Download the zip
      saveAs(content, filename);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      // Fallback to individual downloads
      completedFiles.forEach(file => {
        setTimeout(() => downloadFile(file), 100 * completedFiles.indexOf(file));
      });
    }
  }, [files, downloadFile]);

  const processingStats: ProcessingStats = {
    totalFiles: files.length,
    processedFiles: files.filter(f => f.status === 'completed').length,
    errorCount: files.filter(f => f.status === 'error').length,
    totalSizeBytes: files.reduce((sum, f) => sum + f.size, 0)
  };

  return {
    files,
    isProcessing,
    processingStats,
    addFiles,
    removeFile,
    clearFiles,
    processFiles,
    downloadFile,
    downloadAllAsZip
  };
}