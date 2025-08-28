'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { SpeedMode } from '@/lib/speed-modes';

interface BackgroundRemovalUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
  disabled?: boolean;
  speedMode: SpeedMode;
  onSpeedModeChange: (mode: SpeedMode) => void;
}

export function BackgroundRemovalUpload({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  onClearAll,
  disabled = false,
  speedMode,
  onSpeedModeChange
}: BackgroundRemovalUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      onFilesSelected(imageFiles);
    }
  }, [onFilesSelected, disabled]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = e.target.files;
    if (files) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    }
    
    // Reset input
    e.target.value = '';
  }, [onFilesSelected, disabled]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getModeInfo = (mode: SpeedMode) => {
    switch (mode) {
      case 'fast':
        return { 
          name: 'Fast', 
          description: '~8-15s • Lower quality • Perfect for quick previews',
          icon: '⚡'
        };
      case 'balanced':
        return { 
          name: 'Balanced', 
          description: '~20-30s • Good quality • Recommended for most images',
          icon: '⚖️'
        };
      case 'quality':
        return { 
          name: 'Quality', 
          description: '~30-50s • Maximum quality • Best model & precision',
          icon: '💎'
        };
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Upload Images</h3>
      
      {/* Speed/Quality Mode Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Processing Mode
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['fast', 'balanced', 'quality'] as const).map((mode) => {
            const info = getModeInfo(mode);
            const isSelected = speedMode === mode;
            
            return (
              <button
                key={mode}
                onClick={() => !disabled && onSpeedModeChange(mode)}
                disabled={disabled}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{info.icon}</span>
                  <span className="font-medium">{info.name}</span>
                  {isSelected && <span className="text-blue-500 text-sm">✓</span>}
                </div>
                <p className="text-xs text-gray-600">{info.description}</p>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('bg-removal-file-input')?.click()}
      >
        <div className={`text-gray-400 mb-2 ${isDragOver ? 'text-blue-500' : ''}`}>
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
        </div>
        <p className="text-gray-600 mb-2">
          {isDragOver ? 'Drop your images here' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-sm text-gray-500">
          PNG, JPG, WebP up to 10MB each
        </p>
      </div>

      <input
        id="bg-removal-file-input"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled}
      />

      {/* File List */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onClearAll}
              disabled={disabled}
              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveFile(index)}
                  disabled={disabled}
                  className="ml-3 text-red-500 hover:text-red-700 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="mt-4 text-xs text-gray-500">
        <p>• Supported formats: PNG, JPG, JPEG, WebP</p>
        <p>• Maximum file size: 10MB per image</p>
        <p>• Processing happens entirely in your browser</p>
      </div>
    </Card>
  );
}