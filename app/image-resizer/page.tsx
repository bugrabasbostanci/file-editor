import { ImageResizerComponent } from "@/components/image-resizer";
import Link from "next/link";

export default function ImageResizerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Image Resizer</h1>
          <p className="text-muted-foreground">
            Resize your images to custom dimensions
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
              <Link 
                href="/format-converter" 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border-l transition-colors"
              >
                Format Converter
              </Link>
              <span className="px-4 py-2 bg-blue-50 text-blue-900 font-medium border-l">
                Image Resizer
              </span>
            </div>
          </div>
        </div>

        <ImageResizerComponent />
      </div>
    </div>
  );
}