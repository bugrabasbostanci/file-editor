'use client';

import { BackgroundRemovalUpload } from '@/components/background-removal-upload';
import { BackgroundRemovalPreview } from '@/components/background-removal-preview';
import { useBackgroundRemoval } from '@/hooks/use-background-removal';
import { formatProcessingTime } from '@/lib/time-utils';
import Link from 'next/link';

export default function BackgroundRemove() {
  const {
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
    downloadAllAsZip
  } = useBackgroundRemoval();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Background Removal
          </h1>
          <p className="text-gray-600">
            Remove backgrounds from your images using AI - works entirely in your browser
          </p>
          {isInitializing && (
            <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span className="text-sm">Loading AI model for faster processing...</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="flex">
              <Link 
                href="/" 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border-r transition-colors"
              >
                File Processor
              </Link>
              <span className="px-4 py-2 bg-blue-50 text-blue-900 font-medium">
                Background Removal
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload */}
          <div className="lg:col-span-1">
            <BackgroundRemovalUpload
              onFilesSelected={addFiles}
              selectedFiles={images.map(img => img.originalFile)}
              onRemoveFile={removeImage}
              onClearAll={clearAllImages}
              disabled={isProcessing}
              speedMode={speedMode}
              onSpeedModeChange={setSpeedMode}
            />
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-2">
            <BackgroundRemovalPreview
              images={images}
              onDownloadSingle={downloadSingle}
              onDownloadAll={downloadAllAsZip}
              onRemoveImage={removeImage}
              onProcessImages={processImages}
              isProcessing={isProcessing}
            />
          </div>
        </div>

        {/* Stats Footer */}
        {stats.totalImages > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <div className="flex justify-center gap-6 flex-wrap">
              <span>Total: {stats.totalImages}</span>
              <span>Processed: {stats.processedImages}</span>
              {stats.errorCount > 0 && (
                <span className="text-red-600">Errors: {stats.errorCount}</span>
              )}
              {(stats.processingTime > 0 || isProcessing) && (
                <span className={isProcessing ? "text-blue-600 font-medium" : "text-green-600"}>
                  ⏱️ {formatProcessingTime(stats.processingTime, isProcessing)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}