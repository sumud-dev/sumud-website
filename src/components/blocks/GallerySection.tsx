'use client';

import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { X, ZoomIn } from 'lucide-react';

interface GalleryImage {
  url: string;
  title: string;
  description?: string;
}

interface GallerySectionProps {
  title?: string;
  subtitle?: string;
  images?: GalleryImage[];
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  columns?: number;
  children?: React.ReactNode;
}

const defaultProps: GallerySectionProps = {
  title: 'Gallery',
  subtitle: 'Moments of Solidarity',
  images: [
    {
      url: '/images/gallery-1.jpg',
      title: 'Community Event 2023',
      description: 'Annual gathering celebrating Palestinian culture',
    },
    {
      url: '/images/gallery-2.jpg',
      title: 'Cultural Festival',
      description: 'Traditional Palestinian music and dance',
    },
    {
      url: '/images/gallery-3.jpg',
      title: 'Advocacy March',
      description: 'Standing together for Palestinian rights',
    },
    {
      url: '/images/gallery-4.jpg',
      title: 'Educational Workshop',
      description: 'Learning about Palestinian history',
    },
    {
      url: '/images/gallery-5.jpg',
      title: 'Art Exhibition',
      description: 'Palestinian artists showcase',
    },
    {
      url: '/images/gallery-6.jpg',
      title: 'Youth Program',
      description: 'Engaging the next generation',
    },
  ],
  backgroundColor: '#ffffff',
  titleColor: '#3E442B',
  textColor: '#4B5563',
  accentColor: '#781D32',
  columns: 3,
};

export const GallerySection = (props: GallerySectionProps) => {
  const {
    title,
    subtitle,
    images,
    backgroundColor,
    titleColor,
    textColor,
    accentColor,
    columns,
  } = props;

  const {
    connectors: { connect, drag },
  } = useNode();

  const { children } = props;
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  return (
    <div 
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className="py-20 px-6"
      style={{ backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          {subtitle && (
            <p className="font-semibold text-sm uppercase tracking-wide mb-2" style={{ color: accentColor }}>
              {subtitle}
            </p>
          )}
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: titleColor }}>
            {title}
          </h2>
        </div>

        {/* Gallery Grid */}
        <div 
          className="grid gap-6"
          style={{ 
            gridTemplateColumns: `repeat(${columns || 3}, minmax(0, 1fr))`,
          }}
        >
          {images?.map((image, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer aspect-square"
              onClick={() => setSelectedImage(image)}
            >
              <div 
                className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-110"
                style={{ 
                  backgroundImage: `url(${image.url})`,
                  backgroundColor: '#55613C',
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold">{image.title}</h3>
                    <ZoomIn size={20} />
                  </div>
                  {image.description && (
                    <p className="text-sm opacity-90">{image.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>
            
            <div className="max-w-5xl max-h-full flex flex-col items-center">
              <div 
                className="max-h-[70vh] w-auto rounded-lg overflow-hidden"
                style={{ 
                  backgroundImage: `url(${selectedImage.url})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  minHeight: '400px',
                  minWidth: '400px',
                }}
              />
              <div className="text-white text-center mt-6">
                <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-lg opacity-90">{selectedImage.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

GallerySection.craft = {
  displayName: 'Gallery Section',
  isCanvas: true,
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    settings: GallerySectionSettings,
  },
};

export function GallerySectionSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data?.props as GallerySectionProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={props.title || ''}
          onChange={(e) => setProp((props: GallerySectionProps) => (props.title = e.target.value))}
        />
      </div>

      <div>
        <Label>Subtitle</Label>
        <Input
          value={props.subtitle || ''}
          onChange={(e) => setProp((props: GallerySectionProps) => (props.subtitle = e.target.value))}
        />
      </div>

      <div>
        <Label>Columns</Label>
        <Input
          type="number"
          min="2"
          max="4"
          value={props.columns || 3}
          onChange={(e) => setProp((props: GallerySectionProps) => (props.columns = parseInt(e.target.value)))}
        />
      </div>

      <div>
        <Label>Background Color</Label>
        <Input
          type="color"
          value={props.backgroundColor || '#ffffff'}
          onChange={(e) => setProp((props: GallerySectionProps) => (props.backgroundColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Title Color</Label>
        <Input
          type="color"
          value={props.titleColor || '#3E442B'}
          onChange={(e) => setProp((props: GallerySectionProps) => (props.titleColor = e.target.value))}
        />
      </div>

      <div>
        <Label>Accent Color</Label>
        <Input
          type="color"
          value={props.accentColor || '#781D32'}
          onChange={(e) => setProp((props: GallerySectionProps) => (props.accentColor = e.target.value))}
        />
      </div>

      <div className="pt-4 border-t">
        <Label className="mb-3 block">Gallery Images</Label>
        {props.images?.map((image, index) => (
          <div key={index} className="mb-4 p-4 border rounded space-y-2">
            <div>
              <Label>Image {index + 1} URL</Label>
              <Input
                value={image.url}
                onChange={(e) =>
                  setProp((props: GallerySectionProps) => {
                    if (props.images) {
                      props.images[index].url = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={image.title}
                onChange={(e) =>
                  setProp((props: GallerySectionProps) => {
                    if (props.images) {
                      props.images[index].title = e.target.value;
                    }
                  })
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={image.description || ''}
                onChange={(e) =>
                  setProp((props: GallerySectionProps) => {
                    if (props.images) {
                      props.images[index].description = e.target.value;
                    }
                  })
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
