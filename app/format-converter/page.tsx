export const runtime = 'edge';

import { ImageFormatConverterComponent } from '@/components/image-format-converter'
import Link from "next/link";

export default function FormatConverterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Format Converter</h1>
          <p className="text-muted-foreground">
            Convert images between PNG, JPEG, JPG and WebP formats
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="flex">
              <Link 
                href="/" 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                File Processor
              </Link>
              <span className="px-4 py-2 bg-blue-50 text-blue-900 font-medium border-l">
                Format Converter
              </span>
              <Link 
                href="/image-resizer" 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border-l transition-colors"
              >
                Image Resizer
              </Link>
            </div>
          </div>
        </div>

        <ImageFormatConverterComponent />
      </div>
    </div>
  )
}