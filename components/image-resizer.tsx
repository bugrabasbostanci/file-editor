'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageResizer, type ResizeOptions } from '@/lib/image-resizer'
import { Download, Upload, Image as ImageIcon, X, Settings } from 'lucide-react'
import { saveAs } from 'file-saver'

export function ImageResizerComponent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [resizeWidth, setResizeWidth] = useState<string>('')
  const [resizeHeight, setResizeHeight] = useState<string>('')
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true)
  const [quality, setQuality] = useState<number>(90)
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null)

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (ImageResizer.isSupported(file)) {
        setSelectedFile(file)
        setResizedBlob(null)
        
        // Create preview URL and get dimensions
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        
        // Get original image dimensions
        const img = new Image()
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height })
          // Reset resize inputs
          setResizeWidth('')
          setResizeHeight('')
          URL.revokeObjectURL(img.src)
        }
        img.src = url
      } else {
        alert('Unsupported file format. Please select a PNG, JPEG, JPG or WebP file.')
      }
    }
  }, [])

  const handleResize = useCallback(async () => {
    if (!selectedFile) return

    setIsResizing(true)
    try {
      const originalFormat = ImageResizer.getFormatFromFile(selectedFile);
      const options: ResizeOptions = {
        width: resizeWidth ? parseInt(resizeWidth) : undefined,
        height: resizeHeight ? parseInt(resizeHeight) : undefined,
        maintainAspectRatio,
        format: originalFormat || 'png',
        quality: (originalFormat === 'jpeg' || originalFormat === 'webp') 
          ? quality / 100 
          : undefined
      }

      const blob = await ImageResizer.resizeImage(selectedFile, options)
      setResizedBlob(blob)
    } catch (error) {
      console.error('Resize failed:', error)
      alert('Resize operation failed.')
    } finally {
      setIsResizing(false)
    }
  }, [selectedFile, resizeWidth, resizeHeight, maintainAspectRatio, quality])

  const handleDownload = useCallback(() => {
    if (!resizedBlob || !selectedFile) return

    const originalName = selectedFile.name.split('.')[0]
    const originalFormat = ImageResizer.getFormatFromFile(selectedFile) || 'png'
    const extension = ImageResizer.getFileExtension(originalFormat)
    const dimensionSuffix = (resizeWidth || resizeHeight) ? 
      `_${resizeWidth || 'auto'}x${resizeHeight || 'auto'}` : '_resized'
    const fileName = `${originalName}${dimensionSuffix}.${extension}`
    
    saveAs(resizedBlob, fileName)
  }, [resizedBlob, selectedFile, resizeWidth, resizeHeight])

  const handleClear = useCallback(() => {
    setSelectedFile(null)
    setResizedBlob(null)
    setPreviewUrl('')
    setOriginalDimensions(null)
    setResizeWidth('')
    setResizeHeight('')
    setMaintainAspectRatio(true)
    
    // Clear file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (ImageResizer.isSupported(file)) {
        setSelectedFile(file)
        setResizedBlob(null)
        
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        
        // Get original image dimensions
        const img = new Image()
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height })
          // Reset resize inputs
          setResizeWidth('')
          setResizeHeight('')
        }
        img.src = url
      } else {
        alert('Unsupported file format. Please select a PNG, JPEG, JPG or WebP file.')
      }
    }
  }, [])

  // Handle width change with aspect ratio calculation
  const handleWidthChange = useCallback((value: string) => {
    setResizeWidth(value)
    if (maintainAspectRatio && value && originalDimensions) {
      const width = parseInt(value)
      if (!isNaN(width)) {
        const aspectRatio = originalDimensions.width / originalDimensions.height
        const newHeight = Math.round(width / aspectRatio)
        setResizeHeight(newHeight.toString())
      }
    }
  }, [maintainAspectRatio, originalDimensions])

  // Handle height change with aspect ratio calculation
  const handleHeightChange = useCallback((value: string) => {
    setResizeHeight(value)
    if (maintainAspectRatio && value && originalDimensions) {
      const height = parseInt(value)
      if (!isNaN(height)) {
        const aspectRatio = originalDimensions.width / originalDimensions.height
        const newWidth = Math.round(height * aspectRatio)
        setResizeWidth(newWidth.toString())
      }
    }
  }, [maintainAspectRatio, originalDimensions])

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload File
            </CardTitle>
            <CardDescription>
              Select the image you want to resize
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop your file here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPEG, JPG, WebP
                </p>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-sm text-muted-foreground">
                  Format: {ImageResizer.getFormatFromFile(selectedFile)?.toUpperCase()}
                </p>
                {originalDimensions && (
                  <p className="text-sm text-muted-foreground">
                    Dimensions: {originalDimensions.width} x {originalDimensions.height} px
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resize Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Resize Settings
            </CardTitle>
            <CardDescription>
              Set new dimensions and output settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Original Dimensions Display */}
            {originalDimensions && (
              <div>
                <Label className="text-base font-medium">Original Size</Label>
                <p className="text-sm text-muted-foreground">
                  {originalDimensions.width} x {originalDimensions.height} px
                </p>
              </div>
            )}

            {/* Dimension Inputs */}
            <div className="space-y-4">
              <Label className="text-base font-medium">New Dimensions</Label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width" className="text-sm">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      min="1"
                      max="4000"
                      value={resizeWidth}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      placeholder={originalDimensions?.width.toString() || "Width"}
                      disabled={!selectedFile}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-sm">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      min="1"
                      max="4000"
                      value={resizeHeight}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      placeholder={originalDimensions?.height.toString() || "Height"}
                      disabled={!selectedFile}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="maintain-aspect"
                    checked={maintainAspectRatio}
                    onCheckedChange={(checked) => setMaintainAspectRatio(checked === true)}
                  />
                  <Label htmlFor="maintain-aspect" className="text-sm">
                    Maintain aspect ratio
                  </Label>
                </div>
                
                {(resizeWidth || resizeHeight) && (
                  <p className="text-xs text-muted-foreground">
                    New size: {resizeWidth || 'auto'} x {resizeHeight || 'auto'} px
                  </p>
                )}
              </div>
            </div>

            {/* Quality Slider - only show for JPEG/WebP files */}
            {selectedFile && (ImageResizer.getFormatFromFile(selectedFile) === 'jpeg' || ImageResizer.getFormatFromFile(selectedFile) === 'webp') && (
              <div>
                <Label className="text-base font-medium">
                  Quality: {quality}%
                </Label>
                <Slider
                  value={[quality]}
                  onValueChange={([value]) => setQuality(value)}
                  min={10}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Higher quality = Larger file size
                </p>
              </div>
            )}

            <Button
              onClick={handleResize}
              disabled={!selectedFile || isResizing || (!resizeWidth && !resizeHeight)}
              className="w-full"
            >
              {isResizing ? 'Resizing...' : 'Resize'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview and Download */}
      {(previewUrl || resizedBlob) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Preview
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {previewUrl && (
                <div>
                  <Label className="text-sm font-medium">Original</Label>
                  {originalDimensions && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {originalDimensions.width} x {originalDimensions.height} px
                    </p>
                  )}
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="w-full h-64 object-contain bg-gray-50"
                    />
                  </div>
                </div>
              )}

              {resizedBlob && selectedFile && (
                <div>
                  <Label className="text-sm font-medium">
                    Resized ({(ImageResizer.getFormatFromFile(selectedFile) || 'png').toUpperCase()})
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    {resizeWidth || 'auto'} x {resizeHeight || 'auto'} px
                  </p>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(resizedBlob)}
                      alt="Resized"
                      className="w-full h-64 object-contain bg-gray-50"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Size: {(resizedBlob.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button onClick={handleDownload} size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}