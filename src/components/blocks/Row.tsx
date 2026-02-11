'use client';

import { useNode } from '@craftjs/core';
import { ReactNode } from 'react';
import { stylePropsToCSS, type StyleProps } from '@/src/lib/types/block-props';

type LayoutPreset = '1' | '2' | '3' | '4';

interface RowProps extends StyleProps {
  layout: LayoutPreset;
  gap: number;
  children?: ReactNode;
}

export const Row = ({
  gap = 16,
  children,
  ...styleProps
}: Partial<RowProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const styles = stylePropsToCSS({
    marginBottom: 16,
    maxWidth: styleProps.maxWidth || '80rem',
    ...styleProps,
  });

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        ...styles,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: `${gap}px`,
        width: '100%',
        minHeight: '80px',
      }}
      className="p-2 border border-dashed border-gray-300 rounded mx-auto"
    >
      {children}
    </div>
  );
};

Row.craft = {
  displayName: 'Row',
  isCanvas: true,
  props: {
    layout: '2',
    gap: 16,
    marginTop: 0,
    marginBottom: 16,
    marginLeft: 0,
    marginRight: 0,
    maxWidth: '80rem',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    settings: RowSettings,
  },
};

function RowSettings() {
  const {
    actions: { setProp },
    layout,
    gap,
  } = useNode((node) => ({
    layout: node.data?.props?.layout,
    gap: node.data?.props?.gap,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">Layout</label>
        <select
          value={layout}
          onChange={(e) => {
            const newLayout = e.target.value as LayoutPreset;
            setProp((props: RowProps) => (props.layout = newLayout));
          }}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="1">1 Column (100%)</option>
          <option value="2">2 Columns (50% each)</option>
          <option value="3">3 Columns (33% each)</option>
          <option value="4">4 Columns (25% each)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Gap (px)</label>
        <input
          type="number"
          value={gap}
          min={0}
          max={64}
          onChange={(e) =>
            setProp((props: RowProps) => (props.gap = Number(e.target.value)))
          }
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-gray-500">
          Drag Column blocks into this row. Columns will automatically adjust based on the layout preset.
        </p>
      </div>
    </div>
  );
}
