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

export function ImageFormatConverterComponent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null)
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>('png')
  const [quality, setQuality] = useState<number>(90)
  const [isConverting, setIsConverting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (ImageFormatConverter.isSupported(file)) {
        setSelectedFile(file)
        setConvertedBlob(null)
        
        // Create preview URL
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      } else {
        alert('Desteklenmeyen dosya formatı. PNG, JPEG, JPG veya WebP formatında bir dosya seçin.')
      }
    }
  }, [])

  const handleConvert = useCallback(async () => {
    if (!selectedFile) return

    setIsConverting(true)
    try {
      const options: ConversionOptions = {
        format: targetFormat,
        quality: (targetFormat === 'jpeg' || targetFormat === 'jpg' || targetFormat === 'webp') 
          ? quality / 100 
          : undefined
      }

      const blob = await ImageFormatConverter.convertImage(selectedFile, options)
      setConvertedBlob(blob)
    } catch (error) {
      console.error('Conversion failed:', error)
      alert('Dönüştürme işlemi başarısız oldu.')
    } finally {
      setIsConverting(false)
    }
  }, [selectedFile, targetFormat, quality])

  const handleDownload = useCallback(() => {
    if (!convertedBlob || !selectedFile) return

    const originalName = selectedFile.name.split('.')[0]
    const extension = ImageFormatConverter.getFileExtension(targetFormat)
    const fileName = `${originalName}.${extension}`
    
    saveAs(convertedBlob, fileName)
  }, [convertedBlob, selectedFile, targetFormat])

  const handleClear = useCallback(() => {
    setSelectedFile(null)
    setConvertedBlob(null)
    setPreviewUrl('')
    
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
      if (ImageFormatConverter.isSupported(file)) {
        setSelectedFile(file)
        setConvertedBlob(null)
        
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      } else {
        alert('Desteklenmeyen dosya formatı. PNG, JPEG, JPG veya WebP formatında bir dosya seçin.')
      }
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Format Dönüştürücü</h1>
        <p className="text-muted-foreground">
          PNG, JPEG, JPG ve WebP formatları arasında dönüştürme yapın
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Dosya Yükle
            </CardTitle>
            <CardDescription>
              Dönüştürmek istediğiniz görseli seçin
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
                  Dosyayı buraya sürükleyin veya seçmek için tıklayın
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
                  Boyut: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-sm text-muted-foreground">
                  Format: {ImageFormatConverter.getFormatFromFile(selectedFile)?.toUpperCase()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Dönüştürme Ayarları</CardTitle>
            <CardDescription>
              Hedef format ve kalite ayarlarını seçin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Hedef Format</Label>
              <RadioGroup
                value={targetFormat}
                onValueChange={(value) => setTargetFormat(value as SupportedFormat)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="png" id="png" />
                  <Label htmlFor="png">PNG (Kayıpsız)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jpeg" id="jpeg" />
                  <Label htmlFor="jpeg">JPEG (Kompresyonlu)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jpg" id="jpg" />
                  <Label htmlFor="jpg">JPG (Kompresyonlu)</Label>
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
                  Kalite: {quality}%
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
                  Yüksek kalite = Büyük dosya boyutu
                </p>
              </div>
            )}

            <Button
              onClick={handleConvert}
              disabled={!selectedFile || isConverting}
              className="w-full"
            >
              {isConverting ? 'Dönüştürülüyor...' : 'Dönüştür'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview and Download */}
      {(previewUrl || convertedBlob) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Önizleme
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
            <div className="grid md:grid-cols-2 gap-4">
              {previewUrl && (
                <div>
                  <Label className="text-sm font-medium">Orijinal</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Orijinal"
                      className="w-full h-64 object-contain bg-gray-50"
                    />
                  </div>
                </div>
              )}

              {convertedBlob && (
                <div>
                  <Label className="text-sm font-medium">
                    Dönüştürülmüş ({targetFormat.toUpperCase()})
                  </Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(convertedBlob)}
                      alt="Dönüştürülmüş"
                      className="w-full h-64 object-contain bg-gray-50"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Boyut: {(convertedBlob.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button onClick={handleDownload} size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      İndir
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