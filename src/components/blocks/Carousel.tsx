import { useNode } from '@craftjs/core';
import Image from 'next/image';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils/utils';
import {
  Carousel as ShadcnCarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/src/components/ui/carousel';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Checkbox } from '@/src/components/ui/checkbox';

interface CarouselSlide {
  id: string;
  image: string;
  caption: string;
}

interface CarouselProps {
  slides: CarouselSlide[];
  autoplay: boolean;
  showControls: boolean;
}

export const Carousel = ({ 
  slides = [
    { id: '1', image: 'https://via.placeholder.com/800x400/1e40af/ffffff?text=Slide+1', caption: 'Slide 1' },
    { id: '2', image: 'https://via.placeholder.com/800x400/7c3aed/ffffff?text=Slide+2', caption: 'Slide 2' },
    { id: '3', image: 'https://via.placeholder.com/800x400/db2777/ffffff?text=Slide+3', caption: 'Slide 3' },
  ],
  showControls = true
}: Partial<CarouselProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)); }} className="w-full max-w-7xl mx-auto px-4 py-8">
      <ShadcnCarousel
        opts={{
          align: 'center',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-4">
              <Card className="border-2 border-muted hover:border-primary/20 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="relative aspect-video">
                    <Image
                      src={slide.image}
                      alt={slide.caption || 'Carousel slide'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {slide.caption && (
                      <div className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-black/60 text-white px-6 py-4 border-t border-white/10">
                        <p className="text-center text-sm md:text-base font-medium leading-relaxed">
                          {slide.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showControls && (
          <>
            <CarouselPrevious className="-left-4 md:-left-12" />
            <CarouselNext className="-right-4 md:-right-12" />
          </>
        )}
      </ShadcnCarousel>
    </div>
  );
};

Carousel.craft = {
  displayName: 'Carousel',
  props: {
    slides: [
      { id: '1', image: 'https://via.placeholder.com/800x400/1e40af/ffffff?text=Slide+1', caption: 'Slide 1' },
      { id: '2', image: 'https://via.placeholder.com/800x400/7c3aed/ffffff?text=Slide+2', caption: 'Slide 2' },
      { id: '3', image: 'https://via.placeholder.com/800x400/db2777/ffffff?text=Slide+3', caption: 'Slide 3' },
    ],
    autoplay: false,
    showControls: true,
  },
  related: {
    settings: CarouselSettings,
  },
};

function CarouselSettings() {
  const {
    actions: { setProp },
    slides,
    autoplay,
    showControls,
  } = useNode((node) => ({
    slides: node.data?.props?.slides,
    autoplay: node.data?.props?.autoplay,
    showControls: node.data?.props?.showControls,
  }));

  const addSlide = () => {
    setProp((props: CarouselProps) => {
      props.slides.push({
        id: `${Date.now()}`,
        image: `https://via.placeholder.com/800x400?text=Slide+${props.slides.length + 1}`,
        caption: `Slide ${props.slides.length + 1}`,
      });
    });
  };

  const removeSlide = (id: string) => {
    setProp((props: CarouselProps) => {
      props.slides = props.slides.filter(slide => slide.id !== id);
    });
  };

  const updateSlide = (id: string, field: 'image' | 'caption', value: string) => {
    setProp((props: CarouselProps) => {
      const slide = props.slides.find(s => s.id === id);
      if (slide) slide[field] = value;
    });
  };

  return (
    <div className="space-y-6 p-4 max-h-150 overflow-y-auto">
      <Card className="border-muted">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="autoplay"
              checked={autoplay}
              onCheckedChange={(checked) => setProp((props: CarouselProps) => (props.autoplay = checked as boolean))}
            />
            <Label htmlFor="autoplay" className="cursor-pointer">Autoplay</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="showControls"
              checked={showControls}
              onCheckedChange={(checked) => setProp((props: CarouselProps) => (props.showControls = checked as boolean))}
            />
            <Label htmlFor="showControls" className="cursor-pointer">Show Navigation Controls</Label>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Slides</Label>
          <Button
            onClick={addSlide}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Slide
          </Button>
        </div>
        
        <div className="space-y-3">
          {slides.map((slide: CarouselSlide, index: number) => (
            <Card key={slide.id} className="border-2 border-muted hover:border-primary/20 transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Slide {index + 1}</Label>
                  {slides.length > 1 && (
                    <Button
                      onClick={() => removeSlide(slide.id)}
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`image-${slide.id}`} className="text-xs">Image URL</Label>
                  <Input
                    id={`image-${slide.id}`}
                    type="text"
                    value={slide.image}
                    onChange={(e) => updateSlide(slide.id, 'image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`caption-${slide.id}`} className="text-xs">Caption</Label>
                  <Input
                    id={`caption-${slide.id}`}
                    type="text"
                    value={slide.caption}
                    onChange={(e) => updateSlide(slide.id, 'caption', e.target.value)}
                    placeholder="Enter slide caption"
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}