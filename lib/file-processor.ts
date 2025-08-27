import { ProcessedFile, ProcessingOptions, SUPPORTED_IMAGE_EXTENSIONS, SupportedImageFormat } from './types';

export function convertToKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u')
    .replace(/[^a-z0-9\s\-\.]/g, '')  // Remove special chars except spaces, hyphens, dots
    .replace(/\s+/g, '-')             // Replace spaces with hyphens
    .replace(/-+/g, '-')              // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');         // Remove leading/trailing hyphens
}

export function removeTextFromFilename(filename: string, textsToRemove: string[]): string {
  let newFilename = filename;
  
  textsToRemove.forEach(textToRemove => {
    if (newFilename.includes(textToRemove)) {
      newFilename = newFilename.replace(new RegExp(textToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
    }
  });

  // Clean up double spaces, hyphens, and trim
  newFilename = newFilename.replace(/\s+/g, ' ').replace(/-+/g, '-');
  newFilename = newFilename.replace(/^[\s-]+|[\s-]+$/g, '');
  
  return newFilename;
}

export function isImageFile(filename: string): boolean {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return SUPPORTED_IMAGE_EXTENSIONS.includes(ext as SupportedImageFormat);
}

export function processFileName(
  filename: string, 
  options: ProcessingOptions
): string {
  if (!isImageFile(filename)) {
    throw new Error('Unsupported file format');
  }

  const fileExtension = '.' + filename.split('.').pop()?.toLowerCase();
  const nameWithoutExtension = filename.slice(0, filename.lastIndexOf('.'));
  
  let processedName = nameWithoutExtension;

  switch (options.processType) {
    case 'remove-text':
      processedName = removeTextFromFilename(processedName, options.textsToRemove);
      break;
    
    case 'kebab-case':
      processedName = convertToKebabCase(processedName);
      break;
    
    case 'both':
      // First remove text, then convert to kebab-case
      processedName = removeTextFromFilename(processedName, options.textsToRemove);
      processedName = convertToKebabCase(processedName);
      break;
    
    default:
      throw new Error('Invalid process type');
  }

  // Ensure we don't end up with an empty name
  if (!processedName) {
    processedName = 'unnamed';
  }

  return processedName + fileExtension;
}

export function createProcessedFile(
  file: File,
  options: ProcessingOptions
): ProcessedFile {
  try {
    const processedName = processFileName(file.name, options);
    
    return {
      originalFile: file,
      originalName: file.name,
      processedName,
      size: file.size,
      type: file.type,
      status: 'pending'
    };
  } catch (error) {
    return {
      originalFile: file,
      originalName: file.name,
      processedName: file.name, // Keep original if processing fails
      size: file.size,
      type: file.type,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function validateFiles(files: File[]): { valid: File[], invalid: { file: File, reason: string }[] } {
  const valid: File[] = [];
  const invalid: { file: File, reason: string }[] = [];

  files.forEach(file => {
    if (!isImageFile(file.name)) {
      invalid.push({ 
        file, 
        reason: `Unsupported format: ${file.name.split('.').pop()?.toUpperCase()}` 
      });
    } else if (file.size > 10 * 1024 * 1024) { // 10MB limit
      invalid.push({ 
        file, 
        reason: 'File too large (max 10MB)' 
      });
    } else {
      valid.push(file);
    }
  });

  return { valid, invalid };
}