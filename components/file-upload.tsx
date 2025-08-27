"use client";

import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => {
    valid: number;
    invalid: Array<{ file: File; reason: string }>;
  };
  disabled?: boolean;
}

export function FileUpload({
  onFilesSelected,
  disabled = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<Array<{ file: File; reason: string }>>(
    []
  );

  const handleFiles = useCallback(
    (files: FileList) => {
      const fileArray = Array.from(files);
      const result = onFilesSelected(fileArray);

      if (result.invalid.length > 0) {
        setErrors(result.invalid);
      } else {
        setErrors([]);
      }
    },
    [onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles, disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
      // Reset input
      e.target.value = "";
    },
    [handleFiles]
  );

  const dismissError = useCallback((index: number) => {
    setErrors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.gif,.bmp,.tiff,.webp"
          onChange={handleFileSelect}
          disabled={disabled}
          className="sr-only"
          id="file-input"
        />

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() =>
            !disabled && document.getElementById("file-input")?.click()
          }
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            "hover:border-gray-400 hover:bg-gray-50/50",
            isDragOver && "border-gray-600 bg-gray-50",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "cursor-pointer"
          )}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Drop images here</h3>
            <p className="text-sm text-gray-500">or click to select files</p>
            <p className="text-xs text-gray-400">
              Supports PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP (max 10MB each)
            </p>
          </div>

          <Button
            variant="outline"
            className="mt-4 pointer-events-none"
            disabled={disabled}
            type="button"
          >
            Select Files
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-600">
            Some files couldn&apos;t be added:
          </h4>
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-red-50 border border-red-200 rounded-md p-3"
            >
              <div>
                <p className="text-sm font-medium text-red-800">
                  {error.file.name}
                </p>
                <p className="text-xs text-red-600">{error.reason}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissError(index)}
                className="h-auto p-1 text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
