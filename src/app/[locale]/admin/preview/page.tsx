"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [previewData, setPreviewData] = React.useState<any>(null);

  React.useEffect(() => {
    // Get preview data from sessionStorage
    const stored = sessionStorage.getItem('articlePreview');
    if (stored) {
      const data = JSON.parse(stored);
      // Verify it's for the correct slug
      if (data.slug === slug) {
        setPreviewData(data);
      }
    }
  }, [slug]);

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Preview Data</h1>
          <p className="text-gray-600 mb-4">Please open preview from the edit page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Header */}
      <div className="bg-yellow-100 border-b border-yellow-200 py-3 px-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-yellow-800">Preview Mode</span>
            <span className="text-sm text-yellow-700">
              (Showing unsaved changes)
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.close()}
          >
            Close Preview
          </Button>
        </div>
      </div>

      {/* Article Preview */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Featured Image */}
        {previewData.featuredImageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <Image
              src={previewData.featuredImageUrl}
              alt={previewData.title}
              width={800}
              height={400}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <span className="px-2 py-1 bg-gray-200 rounded">
              {previewData.status}
            </span>
            <span className="px-2 py-1 bg-gray-200 rounded">
              {previewData.language.toUpperCase()}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {previewData.title}
          </h1>
          <p className="text-xl text-gray-600">
            {previewData.excerpt}
          </p>
        </header>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: previewData.content }}
        />
      </article>
    </div>
  );
}