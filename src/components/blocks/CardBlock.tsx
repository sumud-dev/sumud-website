import { useNode } from '@craftjs/core';
import {
  Card as ShadcnCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';

interface CardProps {
  title: string;
  description: string;
  content: string;
  footer: string;
}

export const CardBlock = ({ 
  title = 'Card Title',
  description = 'Card description goes here',
  content = 'Card content...',
  footer = ''
}: Partial<CardProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)); }} className="mx-auto">
      <ShadcnCard>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{content}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </ShadcnCard>
    </div>
  );
};

CardBlock.craft = {
  displayName: 'CardBlock',
  props: {
    title: 'Card Title',
    description: 'Card description',
    content: 'Card content...',
    footer: '',
  },
  related: {
    settings: CardSettings,
  },
};

function CardSettings() {
  const {
    actions: { setProp },
    title,
    description,
    content,
    footer,
  } = useNode((node) => ({
    title: node.data?.props?.title,
    description: node.data?.props?.description,
    content: node.data?.props?.content,
    footer: node.data?.props?.footer,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setProp((props: CardProps) => (props.title = e.target.value))}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setProp((props: CardProps) => (props.description = e.target.value))}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Content</label>
        <textarea
          value={content}
          onChange={(e) => setProp((props: CardProps) => (props.content = e.target.value))}
          rows={4}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Footer (optional)</label>
        <input
          type="text"
          value={footer}
          onChange={(e) => setProp((props: CardProps) => (props.footer = e.target.value))}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
    </div>
  );
}