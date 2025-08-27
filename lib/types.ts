export interface ProcessedFile {
  originalFile: File;
  originalName: string;
  processedName: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface ProcessingOptions {
  textsToRemove: string[];
  processType: 'remove-text' | 'kebab-case' | 'both';
}

export interface ProcessingStats {
  totalFiles: number;
  processedFiles: number;
  errorCount: number;
  totalSizeBytes: number;
}

export type SupportedImageFormat = '.png' | '.jpg' | '.jpeg' | '.gif' | '.bmp' | '.tiff' | '.webp';

export const SUPPORTED_IMAGE_EXTENSIONS: SupportedImageFormat[] = [
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'
];