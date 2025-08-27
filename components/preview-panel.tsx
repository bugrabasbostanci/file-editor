'use client';

import { Download, Trash2, FileImage, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProcessedFile } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PreviewPanelProps {
  files: ProcessedFile[];
  onDownloadFile: (file: ProcessedFile) => void;
  onDownloadAll: () => void;
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
  isProcessing?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getStatusIcon(status: ProcessedFile['status']) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case 'processing':
      return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    default:
      return <FileImage className="h-4 w-4 text-gray-400" />;
  }
}

export function PreviewPanel({ 
  files, 
  onDownloadFile, 
  onDownloadAll, 
  onRemoveFile, 
  onClearAll,
  isProcessing = false 
}: PreviewPanelProps) {
  const completedFiles = files.filter(f => f.status === 'completed');
  const errorFiles = files.filter(f => f.status === 'error');
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileImage className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">No files selected</p>
          <p className="text-sm text-gray-400">Upload some images to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Files ({files.length})
          </CardTitle>
          <div className="flex gap-2">
            {completedFiles.length > 0 && (
              <Button onClick={onDownloadAll} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            )}
            <Button onClick={onClearAll} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{completedFiles.length} completed</span>
          {errorFiles.length > 0 && (
            <span className="text-red-600">{errorFiles.length} errors</span>
          )}
          <span>{formatFileSize(totalSize)} total</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                file.status === 'completed' && "bg-green-50 border-green-200",
                file.status === 'error' && "bg-red-50 border-red-200",
                file.status === 'processing' && "bg-blue-50 border-blue-200",
                file.status === 'pending' && "bg-gray-50 border-gray-200"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getStatusIcon(file.status)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {file.originalName}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  
                  {file.status === 'completed' && file.processedName !== file.originalName && (
                    <p className="text-xs text-green-600 truncate">
                      → {file.processedName}
                    </p>
                  )}
                  
                  {file.status === 'error' && file.error && (
                    <p className="text-xs text-red-600 truncate">
                      {file.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {file.status === 'completed' && (
                  <Button
                    onClick={() => onDownloadFile(file)}
                    size="sm"
                    variant="ghost"
                    disabled={isProcessing}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  onClick={() => onRemoveFile(index)}
                  size="sm"
                  variant="ghost"
                  disabled={isProcessing}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}