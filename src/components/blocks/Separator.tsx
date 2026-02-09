import { useNode } from '@craftjs/core';
import { Separator as ShadcnSeparator } from '@/src/components/ui/separator';

interface SeparatorProps {
  orientation: 'horizontal' | 'vertical';
  decorative: boolean;
}

export const Separator = ({ 
  orientation = 'horizontal',
  decorative = true
}: Partial<SeparatorProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)); }} className={orientation === 'vertical' ? 'h-20' : ''}>
      <ShadcnSeparator orientation={orientation} decorative={decorative} />
    </div>
  );
};

Separator.craft = {
  displayName: 'Separator',
  props: {
    orientation: 'horizontal',
    decorative: true,
  },
  related: {
    settings: SeparatorSettings,
  },
};

function SeparatorSettings() {
  const {
    actions: { setProp },
    orientation,
    decorative,
  } = useNode((node) => ({
    orientation: node.data?.props?.orientation,
    decorative: node.data?.props?.decorative,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">Orientation</label>
        <select
          value={orientation}
          onChange={(e) => setProp((props: SeparatorProps) => (props.orientation = e.target.value as any))}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={decorative}
          onChange={(e) => setProp((props: SeparatorProps) => (props.decorative = e.target.checked))}
          className="w-4 h-4"
        />
        <label className="text-sm font-medium">Decorative only</label>
      </div>
    </div>
  );
}