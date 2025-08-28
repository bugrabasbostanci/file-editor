'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { ImageFormatConverter, type SupportedFormat, type ConversionOptions } from '@/lib/image-format-converter'
import { Download, Upload, Image as ImageIcon, X } from 'lucide-react'
import { saveAs } from 'file-saver'

interface FileWithPreview {
  file: File
  previewUrl: string
  originalDimensions: { width: number; height: number } | null
  convertedBlob: Blob | null
}

export function ImageFormatConverterComponent() {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>('png')
  const [quality, setQuality] = useState<number>(90)
  const [isConverting, setIsConverting] = useState(false)
  const MAX_FILES = 100

  const processFiles = useCallback((files: File[]) => {
    const newFiles: FileWithPreview[] = []
    const remainingSlots = MAX_FILES - selectedFiles.length
    const filesToProcess = files.slice(0, remainingSlots)
    
    if (files.length > remainingSlots) {
      alert(`En fazla ${MAX_FILES} dosya yükleyebilirsiniz. İlk ${remainingSlots} dosya seçildi.`)
    }
    
    filesToProcess.forEach(file => {
      if (ImageFormatConverter.isSupported(file)) {
        const url = URL.createObjectURL(file)
        const fileWithPreview: FileWithPreview = {
          file,
          previewUrl: url,
          originalDimensions: null,
          convertedBlob: null
        }
        
        // Get original image dimensions
        const img = new Image()
        img.onload = () => {
          fileWithPreview.originalDimensions = { width: img.width, height: img.height }
          setSelectedFiles(prev => [...prev])
        }
        img.src = url
        
        newFiles.push(fileWithPreview)
      } else {
        alert(`Desteklenmeyen dosya formatı: ${file.name}. PNG, JPEG, JPG veya WebP dosyası seçin.`)
      }
    })
    
    setSelectedFiles(prev => [...prev, ...newFiles])
  }, [selectedFiles.length])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    processFiles(files)
  }, [processFiles])

  const handleConvert = useCallback(async () => {
    if (selectedFiles.length === 0) return

    setIsConverting(true)
    try {
      const options: ConversionOptions = {
        format: targetFormat,
        quality: (targetFormat === 'jpeg' || targetFormat === 'jpg' || targetFormat === 'webp') 
          ? quality / 100 
          : undefined
      }

      const updatedFiles: FileWithPreview[] = []
      
      for (const fileWithPreview of selectedFiles) {
        try {
          const blob = await ImageFormatConverter.convertImage(fileWithPreview.file, options)
          updatedFiles.push({ ...fileWithPreview, convertedBlob: blob })
        } catch (error) {
          console.error(`Conversion failed for ${fileWithPreview.file.name}:`, error)
          updatedFiles.push(fileWithPreview)
        }
      }
      
      setSelectedFiles(updatedFiles)
    } catch (error) {
      console.error('Conversion failed:', error)
      alert('Dönüştürme işlemi başarısız oldu.')
    } finally {
      setIsConverting(false)
    }
  }, [selectedFiles, targetFormat, quality])

  const handleDownload = useCallback((fileWithPreview: FileWithPreview) => {
    if (!fileWithPreview.convertedBlob) return

    const originalName = fileWithPreview.file.name.split('.')[0]
    const extension = ImageFormatConverter.getFileExtension(targetFormat)
    const fileName = `${originalName}.${extension}`
    
    saveAs(fileWithPreview.convertedBlob, fileName)
  }, [targetFormat])

  const handleDownloadAll = useCallback(async () => {
    const convertedFiles = selectedFiles.filter(f => f.convertedBlob)
    if (convertedFiles.length === 0) return

    for (let i = 0; i < convertedFiles.length; i++) {
      handleDownload(convertedFiles[i])
      // Tarayıcının indirmeleri engellemesini önlemek için gecikme
      if (i < convertedFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
  }, [selectedFiles, handleDownload])

  const handleClear = useCallback(() => {
    selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl))
    setSelectedFiles([])
    
    // Clear file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }, [selectedFiles])

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev[index]
      URL.revokeObjectURL(fileToRemove.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    processFiles(files)
  }, [processFiles])

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
              Select the image you want to convert
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
                multiple
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Birden fazla dosya sürükleyip bırakın veya seçmek için tıklayın
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPEG, JPG, WebP (Maksimum {MAX_FILES} dosya)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Seçili dosya: {selectedFiles.length}/{MAX_FILES}
                </p>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((fileWithPreview, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{fileWithPreview.file.name}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Size: {(fileWithPreview.file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span>Format: {ImageFormatConverter.getFormatFromFile(fileWithPreview.file)?.toUpperCase()}</span>
                        {fileWithPreview.originalDimensions && (
                          <span>{fileWithPreview.originalDimensions.width} x {fileWithPreview.originalDimensions.height} px</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Settings</CardTitle>
            <CardDescription>
              Choose target format and quality settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Target Format</Label>
              <RadioGroup
                value={targetFormat}
                onValueChange={(value) => setTargetFormat(value as SupportedFormat)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="png" id="png" />
                  <Label htmlFor="png">PNG (Lossless)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jpeg" id="jpeg" />
                  <Label htmlFor="jpeg">JPEG (Compressed)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jpg" id="jpg" />
                  <Label htmlFor="jpg">JPG (Compressed)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="webp" id="webp" />
                  <Label htmlFor="webp">WebP (Modern)</Label>
                </div>
              </RadioGroup>
            </div>

            {(targetFormat === 'jpeg' || targetFormat === 'jpg' || targetFormat === 'webp') && (
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

            <div className="space-y-2">
              <Button
                onClick={handleConvert}
                disabled={selectedFiles.length === 0 || isConverting}
                className="w-full"
              >
                {isConverting ? 'Dönüştürülüyor...' : `${selectedFiles.length} Dosyayı Dönüştür`}
              </Button>
              {selectedFiles.some(f => f.convertedBlob) && (
                <Button
                  onClick={handleDownloadAll}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tümünü İndir
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview and Download */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Önizleme ({selectedFiles.length} dosya)
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Temizle
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {selectedFiles.map((fileWithPreview, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium truncate">{fileWithPreview.file.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Orijinal</Label>
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <img
                          src={fileWithPreview.previewUrl}
                          alt="Orijinal"
                          className="w-full h-48 object-contain bg-gray-50"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(fileWithPreview.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    
                    {fileWithPreview.convertedBlob && (
                      <div>
                        <Label className="text-sm font-medium">
                          Dönüştürülmüş ({targetFormat.toUpperCase()})
                        </Label>
                        <div className="mt-2 border rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(fileWithPreview.convertedBlob)}
                            alt="Dönüştürülmüş"
                            className="w-full h-48 object-contain bg-gray-50"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {(fileWithPreview.convertedBlob.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button onClick={() => handleDownload(fileWithPreview)} size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            İndir
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}