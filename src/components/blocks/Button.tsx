import { useNode } from '@craftjs/core';
import Link from 'next/link';
import { Button as ShadcnButton } from '@/src/components/ui/button';
import { stylePropsToCSS, type StyleProps } from '@/src/lib/types/block-props';

interface ButtonProps extends StyleProps {
  text: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size: 'default' | 'sm' | 'lg' | 'icon';
  href?: string;
}

export const Button = ({ 
  text = 'Click me', 
  variant = 'default', 
  size = 'default',
  href,
  ...styleProps
}: Partial<ButtonProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const styles = stylePropsToCSS({
    marginTop: 4,
    marginBottom: 4,
    ...styleProps,
  });

  return (
    <div ref={ref => { if (ref) connect(drag(ref)); }} style={styles} className="inline-block">
      {href ? (
        <ShadcnButton variant={variant} size={size} asChild>
          <Link href={href}>{text}</Link>
        </ShadcnButton>
      ) : (
        <ShadcnButton variant={variant} size={size}>
          {text}
        </ShadcnButton>
      )}
    </div>
  );
};

Button.craft = {
  displayName: 'Button',
  props: {
    text: 'Click me',
    variant: 'default',
    size: 'default',
    href: '',
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 0,
    marginRight: 0,
  },
  related: {
    settings: ButtonSettings,
  },
};

function ButtonSettings() {
  const {
    actions: { setProp },
    text,
    variant,
    size,
    href,
  } = useNode((node) => ({
    text: node.data?.props?.text,
    variant: node.data?.props?.variant,
    size: node.data?.props?.size,
    href: node.data?.props?.href,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">Button Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setProp((props: ButtonProps) => (props.text = e.target.value))}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Variant</label>
        <select
          value={variant}
          onChange={(e) => setProp((props: ButtonProps) => (props.variant = e.target.value as any))}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="default">Default</option>
          <option value="destructive">Destructive</option>
          <option value="outline">Outline</option>
          <option value="secondary">Secondary</option>
          <option value="ghost">Ghost</option>
          <option value="link">Link</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Size</label>
        <select
          value={size}
          onChange={(e) => setProp((props: ButtonProps) => (props.size = e.target.value as any))}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="default">Default</option>
          <option value="sm">Small</option>
          <option value="lg">Large</option>
          <option value="icon">Icon</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Link (optional)</label>
        <input
          type="text"
          value={href}
          onChange={(e) => setProp((props: ButtonProps) => (props.href = e.target.value))}
          placeholder="https://..."
          className="w-full px-3 py-2 border rounded"
        />
      </div>
    </div>
  );
}