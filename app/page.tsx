"use client";

export const runtime = 'edge';

import { FileUpload } from "@/components/file-upload";
import { ProcessingPanel } from "@/components/processing-panel";
import { PreviewPanel } from "@/components/preview-panel";
import { useFileProcessing } from "@/hooks/use-file-processing";
import Link from "next/link";

export default function Home() {
  const {
    files,
    isProcessing,
    processingStats,
    addFiles,
    removeFile,
    clearFiles,
    processFiles,
    downloadFile,
    downloadAllAsZip,
  } = useFileProcessing();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Image File Processor</h1>
          <p className="text-muted-foreground">
            Remove unwanted text and convert filenames to kebab-case
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="flex">
              <span className="px-4 py-2 bg-blue-50 text-blue-900 font-medium">
                File Processor
              </span>
              <Link 
                href="/format-converter" 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border-l transition-colors"
              >
                Format Converter
              </Link>
              <Link 
                href="/image-resizer" 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border-l transition-colors"
              >
                Image Resizer
              </Link>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Settings */}
          <div className="lg:col-span-1 space-y-6">
            <FileUpload onFilesSelected={addFiles} disabled={isProcessing} />

            <ProcessingPanel
              onProcess={processFiles}
              disabled={isProcessing}
              fileCount={files.length}
            />
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-2">
            <PreviewPanel
              files={files}
              onDownloadFile={downloadFile}
              onDownloadAll={downloadAllAsZip}
              onRemoveFile={removeFile}
              onClearAll={clearFiles}
              isProcessing={isProcessing}
            />
          </div>
        </div>

        {/* Stats Footer */}
        {files.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <div className="flex justify-center gap-6">
              <span>Total: {processingStats.totalFiles}</span>
              <span>Processed: {processingStats.processedFiles}</span>
              {processingStats.errorCount > 0 && (
                <span className="text-red-600">
                  Errors: {processingStats.errorCount}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
