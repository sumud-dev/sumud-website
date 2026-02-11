'use client';

import { useNode } from '@craftjs/core';
import { ReactNode } from 'react';
import { stylePropsToCSS, type StyleProps } from '@/src/lib/types/block-props';

interface InlineGroupProps extends StyleProps {
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems: 'flex-start' | 'center' | 'flex-end' | 'baseline';
  gap: number;
  wrap: boolean;
  children?: ReactNode;
}

export const InlineGroup = ({
  justifyContent = 'flex-start',
  alignItems = 'center',
  gap = 8,
  wrap = true,
  children,
  ...styleProps
}: Partial<InlineGroupProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const styles = stylePropsToCSS({
    marginBottom: 16,
    maxWidth: '80rem',
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
        justifyContent,
        alignItems,
        gap: `${gap}px`,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        minHeight: '40px',
        width: '100%',
      }}
      className="p-2 border border-dashed border-blue-300 rounded mx-auto"
    >
      {children || (
        <span className="text-gray-400 text-sm">
          Drop inline elements here (Text, Button, Badge)
        </span>
      )}
    </div>
  );
};

InlineGroup.craft = {
  displayName: 'Inline Group',
  isCanvas: true,
  props: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    wrap: true,
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
    settings: InlineGroupSettings,
  },
};

function InlineGroupSettings() {
  const {
    actions: { setProp },
    justifyContent,
    alignItems,
    gap,
    wrap,
  } = useNode((node) => ({
    justifyContent: node.data?.props?.justifyContent,
    alignItems: node.data?.props?.alignItems,
    gap: node.data?.props?.gap,
    wrap: node.data?.props?.wrap,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">Justify Content</label>
        <select
          value={justifyContent}
          onChange={(e) =>
            setProp(
              (props: InlineGroupProps) =>
                (props.justifyContent = e.target.value as InlineGroupProps['justifyContent'])
            )
          }
          className="w-full px-3 py-2 border rounded"
        >
          <option value="flex-start">Start</option>
          <option value="center">Center</option>
          <option value="flex-end">End</option>
          <option value="space-between">Space Between</option>
          <option value="space-around">Space Around</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Align Items</label>
        <select
          value={alignItems}
          onChange={(e) =>
            setProp(
              (props: InlineGroupProps) =>
                (props.alignItems = e.target.value as InlineGroupProps['alignItems'])
            )
          }
          className="w-full px-3 py-2 border rounded"
        >
          <option value="flex-start">Top</option>
          <option value="center">Center</option>
          <option value="flex-end">Bottom</option>
          <option value="baseline">Baseline</option>
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
            setProp((props: InlineGroupProps) => (props.gap = Number(e.target.value)))
          }
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="wrap"
          checked={wrap}
          onChange={(e) =>
            setProp((props: InlineGroupProps) => (props.wrap = e.target.checked))
          }
          className="h-4 w-4"
        />
        <label htmlFor="wrap" className="text-sm font-medium">
          Allow Wrap
        </label>
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-gray-500">
          Use this to display elements inline (side by side). Great for Text + Button combinations.
        </p>
      </div>
    </div>
  );
}
