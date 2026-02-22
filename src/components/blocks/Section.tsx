import { useNode } from '@craftjs/core';
import { Children } from 'react';
import { stylePropsToCSS, type StyleProps } from '@/src/lib/types/block-props';
import { StyleSettings } from '@/src/components/admin/page-builder/StyleSettings';

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

  const styles = stylePropsToCSS({
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 0,
    marginBottom: 16,
    marginLeft: 0,
    marginRight: 0,
    backgroundColor: '#f8f8f8',
    minHeight: '100px',
    maxWidth: styleProps.maxWidth || '80rem',
    ...styleProps,
  });

  const showPlaceholder = Children.count(children) === 0;

  return (
    <section
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={styles}
      className="mx-auto"
    >
      {showPlaceholder ? (
        <div className="flex items-center justify-center min-h-25 text-gray-400">
          <p className="text-sm">Drop blocks here...</p>
        </div>
      ) : (
        children
      )}
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