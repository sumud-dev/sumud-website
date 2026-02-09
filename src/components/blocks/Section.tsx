import { useNode } from '@craftjs/core';

interface SectionProps {
  backgroundColor: string;
  padding: number;
  children: React.ReactNode;
}

export const Section = ({ 
  backgroundColor = '#f8f8f8', 
  padding = 20,
  children 
}: Partial<SectionProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <section
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={{
        backgroundColor,
        padding: `${padding}px`,
        minHeight: '100px',
      }}
      className="mb-4"
    >
      {children}
    </section>
  );
};

Section.craft = {
  displayName: 'Section',
  props: {
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    settings: SectionSettings,
  },
};

function SectionSettings() {
  const {
    actions: { setProp },
    backgroundColor,
    padding,
  } = useNode((node) => ({
    backgroundColor: node.data?.props?.backgroundColor,
    padding: node.data?.props?.padding,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">Background Color</label>
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setProp((props: SectionProps) => (props.backgroundColor = e.target.value))}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Padding (px)</label>
        <input
          type="number"
          value={padding}
          onChange={(e) => setProp((props: SectionProps) => (props.padding = Number(e.target.value)))}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
    </div>
  );
}