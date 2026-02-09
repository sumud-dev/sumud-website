import { useNode } from '@craftjs/core';
import { Badge as ShadcnBadge } from '@/src/components/ui/badge';

interface BadgeProps {
  text: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge = ({ 
  text = 'Badge',
  variant = 'default'
}: Partial<BadgeProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)); }} className="inline-block">
      <ShadcnBadge variant={variant}>{text}</ShadcnBadge>
    </div>
  );
};

Badge.craft = {
  displayName: 'Badge',
  props: {
    text: 'Badge',
    variant: 'default',
  },
  related: {
    settings: BadgeSettings,
  },
};

function BadgeSettings() {
  const {
    actions: { setProp },
    text,
    variant,
  } = useNode((node) => ({
    text: node.data?.props?.text,
    variant: node.data?.props?.variant,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setProp((props: BadgeProps) => (props.text = e.target.value))}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Variant</label>
        <select
          value={variant}
          onChange={(e) => setProp((props: BadgeProps) => (props.variant = e.target.value as any))}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="default">Default</option>
          <option value="secondary">Secondary</option>
          <option value="destructive">Destructive</option>
          <option value="outline">Outline</option>
        </select>
      </div>
    </div>
  );
}