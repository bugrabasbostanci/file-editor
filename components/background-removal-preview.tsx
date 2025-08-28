'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/time-utils';

export interface ProcessedImage {
  originalFile: File;
  originalUrl: string;
  processedUrl?: string;
  isProcessing: boolean;
  error?: string;
  processedBlob?: Blob;
  processingTime?: number; // in seconds
  startTime?: number;
}

interface BackgroundRemovalPreviewProps {
  images: ProcessedImage[];
  onDownloadSingle: (index: number) => void;
  onDownloadAll: () => void;
  onRemoveImage: (index: number) => void;
  onProcessImages: () => void;
  isProcessing: boolean;
}

export function BackgroundRemovalPreview({
  images,
  onDownloadSingle,
  onDownloadAll,
  onRemoveImage,
  onProcessImages,
  isProcessing
}: BackgroundRemovalPreviewProps) {
  const [selectedTab, setSelectedTab] = useState<'grid' | 'list'>('grid');

  const processedCount = images.filter(img => img.processedUrl && !img.error).length;
  const errorCount = images.filter(img => img.error).length;
  const processingCount = images.filter(img => img.isProcessing).length;

  if (images.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Selected</h3>
          <p className="text-gray-500">
            Upload images to see the before and after preview with background removal
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats and Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <span className="font-medium">{images.length}</span>
              <span className="text-gray-500"> total</span>
            </div>
            {processedCount > 0 && (
              <div className="text-sm">
                <span className="font-medium text-green-600">{processedCount}</span>
                <span className="text-gray-500"> processed</span>
              </div>
            )}
            {processingCount > 0 && (
              <div className="text-sm">
                <span className="font-medium text-blue-600">{processingCount}</span>
                <span className="text-gray-500"> processing...</span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="text-sm">
                <span className="font-medium text-red-600">{errorCount}</span>
                <span className="text-gray-500"> errors</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex border rounded-md">
              <button
                onClick={() => setSelectedTab('grid')}
                className={`px-3 py-1 text-sm ${
                  selectedTab === 'grid'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setSelectedTab('list')}
                className={`px-3 py-1 text-sm border-l ${
                  selectedTab === 'list'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>

            {/* Action Buttons */}
            <Button
              onClick={onProcessImages}
              disabled={isProcessing || processedCount === images.length}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? 'Processing...' : 'Remove Backgrounds'}
            </Button>

            {processedCount > 0 && (
              <Button
                onClick={onDownloadAll}
                variant="outline"
                disabled={isProcessing}
              >
                Download All ({processedCount})
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Images Preview */}
      <Card className="p-6">
        {selectedTab === 'grid' ? (
          <div className="grid gap-6">
            {images.map((image, index) => (
              <div key={`${image.originalFile.name}-${index}`} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {image.originalFile.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{(image.originalFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      {image.processingTime && (
                        <span className="text-green-600">• {formatTime(image.processingTime)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {image.processedUrl && !image.error && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownloadSingle(index)}
                        disabled={isProcessing}
                      >
                        Download
                      </Button>
                    )}
                    <button
                      onClick={() => onRemoveImage(index)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Original */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Original</p>
                    <div className="aspect-video bg-gray-100 rounded border overflow-hidden">
                      <img
                        src={image.originalUrl}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Processed */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Background Removed</p>
                    <div className="aspect-video bg-gray-100 rounded border overflow-hidden relative">
                      {/* Checkerboard pattern for transparency */}
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `conic-gradient(#808080 90deg, transparent 90deg 180deg, #808080 180deg 270deg, transparent 270deg)`,
                          backgroundSize: '20px 20px'
                        }}
                      />
                      
                      {image.isProcessing ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-blue-700">Processing...</p>
                          </div>
                        </div>
                      ) : image.error ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                          <div className="text-center text-red-600">
                            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm">{image.error}</p>
                          </div>
                        </div>
                      ) : image.processedUrl ? (
                        <img
                          src={image.processedUrl}
                          alt="Background removed"
                          className="w-full h-full object-contain relative z-10"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-gray-500 text-center">
                            Click "Remove Backgrounds" to process
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {images.map((image, index) => (
              <div key={`${image.originalFile.name}-${index}`} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-16 h-16 rounded border overflow-hidden flex-shrink-0">
                  <img
                    src={image.originalUrl}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {image.originalFile.name}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{(image.originalFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    {image.processingTime && (
                      <span className="text-green-600">• {formatTime(image.processingTime)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {image.isProcessing && (
                    <div className="flex items-center text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                  {image.error && (
                    <span className="text-red-600 text-sm">Error</span>
                  )}
                  {image.processedUrl && !image.error && (
                    <span className="text-green-600 text-sm">✓ Done</span>
                  )}
                  
                  {image.processedUrl && !image.error && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadSingle(index)}
                      disabled={isProcessing}
                    >
                      Download
                    </Button>
                  )}
                  
                  <button
                    onClick={() => onRemoveImage(index)}
                    className="text-red-500 hover:text-red-700 text-lg font-bold"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}