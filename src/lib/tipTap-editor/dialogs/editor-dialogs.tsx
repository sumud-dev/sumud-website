"use client";

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Upload, Loader2 } from "lucide-react";

interface LinkDialogProps {
  isOpen: boolean;
  text: string;
  url: string;
  onTextChange: (text: string) => void;
  onUrlChange: (url: string) => void;
  onInsert: () => void;
  onClose: () => void;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({
  isOpen,
  text,
  url,
  onTextChange,
  onUrlChange,
  onInsert,
  onClose,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Insert Link</DialogTitle>
        <DialogDescription>
          Add a clickable link to your content
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="link-text">Display Text</Label>
          <Input
            id="link-text"
            placeholder="Click here"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="link-url">URL</Label>
          <Input
            id="link-url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onInsert} disabled={!text || !url}>
          Insert Link
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

interface ImageDialogProps {
  isOpen: boolean;
  url: string;
  alt: string;
  onUrlChange: (url: string) => void;
  onAltChange: (alt: string) => void;
  onInsert: () => void;
  onClose: () => void;
}

export const ImageDialog: React.FC<ImageDialogProps> = ({
  isOpen,
  url,
  alt,
  onUrlChange,
  onAltChange,
  onInsert,
  onClose,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'editor-images');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      onUrlChange(data.secure_url);
      
      // Auto-fill alt text with filename if empty
      if (!alt) {
        onAltChange(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Upload an image or add from URL
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image-file">Choose Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {uploadError && (
                <p className="text-sm text-red-600">{uploadError}</p>
              )}
              {url && (
                <div className="mt-2">
                  <img 
                    src={url} 
                    alt="Preview" 
                    className="max-h-32 rounded border"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt-upload">Alt Text (Description)</Label>
              <Input
                id="image-alt-upload"
                placeholder="Describe the image for accessibility"
                value={alt}
                onChange={(e) => onAltChange(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt-url">Alt Text (Description)</Label>
              <Input
                id="image-alt-url"
                placeholder="Describe the image for accessibility"
                value={alt}
                onChange={(e) => onAltChange(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={onInsert} disabled={!url || uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Insert Image'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface VideoDialogProps {
  isOpen: boolean;
  url: string;
  onUrlChange: (url: string) => void;
  onInsert: () => void;
  onClose: () => void;
}

export const VideoDialog: React.FC<VideoDialogProps> = ({
  isOpen,
  url,
  onUrlChange,
  onInsert,
  onClose,
}) => {
  const embedUrl = React.useMemo(() => {
    if (!url) return '';
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : new URLSearchParams(url.split('?')[1] || '').get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
    }
    
    return url;
  }, [url]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Embed Video</DialogTitle>
          <DialogDescription>
            Add a video from YouTube or Vimeo
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="video-url">Video URL</Label>
            <Input
              id="video-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              autoFocus
            />
          </div>
          {embedUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title="Video preview"
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onInsert} disabled={!embedUrl}>
            Insert Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface TableDialogProps {
  isOpen: boolean;
  rows: number;
  cols: number;
  onRowsChange: (rows: number) => void;
  onColsChange: (cols: number) => void;
  onInsert: () => void;
  onClose: () => void;
}

export const TableDialog: React.FC<TableDialogProps> = ({
  isOpen,
  rows,
  cols,
  onRowsChange,
  onColsChange,
  onInsert,
  onClose,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Insert Table</DialogTitle>
        <DialogDescription>
          Create a table with custom rows and columns
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="table-rows">Number of Rows</Label>
          <Input
            id="table-rows"
            type="number"
            min="1"
            max="20"
            value={rows}
            onChange={(e) => onRowsChange(parseInt(e.target.value) || 1)}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="table-cols">Number of Columns</Label>
          <Input
            id="table-cols"
            type="number"
            min="1"
            max="10"
            value={cols}
            onChange={(e) => onColsChange(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
          Preview: {rows} rows × {cols} columns
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onInsert}>
          Insert Table
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
