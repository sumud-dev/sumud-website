'use client';

import { useNode } from '@craftjs/core';
import Image from 'next/image';
import { ImageUpload } from '@/src/components/ui/image-upload';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Separator } from '@/src/components/ui/separator';

interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const ImageBlock = ({ 
  src = 'https://via.placeholder.com/400x300', 
  alt = 'Image',
  width = 400,
  height = 300,
}: Partial<ImageProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)); }}>
      <Image 
        src={src} 
        alt={alt} 
        width={width}
        height={height}
      />
    </div>
  );
};

ImageBlock.craft = {
  displayName: 'Image',
  props: {
    src: 'https://via.placeholder.com/400x300',
    alt: 'Image',
    width: 400,
    height: 300,
  },
  related: {
    settings: ImageSettings,
  },
};

function ImageSettings() {
  const {
    actions: { setProp },
    src,
    alt,
    width,
    height,
  } = useNode((node) => ({
    src: node.data?.props?.src,
    alt: node.data?.props?.alt,
    width: node.data?.props?.width,
    height: node.data?.props?.height,
  }));

  return (
    <div className="space-y-4">
      {/* Image Upload Section */}
      <div className="space-y-2">
        <Label>Upload Image</Label>
        <ImageUpload
          value={src}
          onChange={(url) => setProp((props: ImageProps) => (props.src = url))}
          folder="page-builder"
          maxSize={5}
        />
      </div>

      <Separator />

      {/* Manual URL Input */}
      <div className="space-y-2">
        <Label htmlFor="image-url">Or Enter Image URL</Label>
        <Input
          id="image-url"
          type="text"
          placeholder="https://example.com/image.jpg"
          value={src}
          onChange={(e) => setProp((props: ImageProps) => (props.src = e.target.value))}
        />
      </div>

      <Separator />

      {/* Alt Text */}
      <div className="space-y-2">
        <Label htmlFor="alt-text">Alt Text</Label>
        <Input
          id="alt-text"
          type="text"
          placeholder="Describe the image"
          value={alt}
          onChange={(e) => setProp((props: ImageProps) => (props.alt = e.target.value))}
        />
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Width (px)</Label>
          <Input
            id="width"
            type="number"
            value={width}
            onChange={(e) => setProp((props: ImageProps) => (props.width = Number(e.target.value)))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (px)</Label>
          <Input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setProp((props: ImageProps) => (props.height = Number(e.target.value)))}
          />
        </div>
      </div>
    </div>
  );
}