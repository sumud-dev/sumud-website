'use client';

import { useNode } from '@craftjs/core';
import { ReactNode } from 'react';

interface ColumnProps {
  width: string;
  background: string;
  padding: number;
  children?: ReactNode;
}

export const Column = ({ 
  width = '50%',
  background = 'transparent',
  padding = 10,
  children 
}: Partial<ColumnProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  // Calculate flex basis considering gap
  const getFlexBasis = () => {
    switch (width) {
      case '25%':
        return 'calc(25% - 12px)';
      case '33.333%':
        return 'calc(33.333% - 11px)';
      case '50%':
        return 'calc(50% - 8px)';
      case '66.666%':
        return 'calc(66.666% - 6px)';
      case '75%':
        return 'calc(75% - 4px)';
      case '100%':
        return '100%';
      default:
        return width;
    }
  };

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{
        flex: `0 0 ${getFlexBasis()}`,
        minWidth: 0,
        minHeight: '60px',
        padding: `${padding}px`,
        background,
        border: '1px dashed #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
      }}
    >
      {children || (
        <span className="text-gray-400 text-sm">Drop content here</span>
      )}
    </div>
  );
};

Column.craft = {
  displayName: 'Column',
  props: {
    width: '50%',
    background: 'transparent',
    padding: 10,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    settings: ColumnSettings,
  },
};

function ColumnSettings() {
  const {
    actions: { setProp },
    width,
    background,
    padding,
  } = useNode((node) => ({
    width: node.data?.props?.width,
    background: node.data?.props?.background,
    padding: node.data?.props?.padding,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">Width</label>
        <select
          value={width}
          onChange={(e) => setProp((props: ColumnProps) => (props.width = e.target.value))}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="25%">25% (1/4)</option>
          <option value="33.333%">33% (1/3)</option>
          <option value="50%">50% (1/2)</option>
          <option value="66.666%">66% (2/3)</option>
          <option value="75%">75% (3/4)</option>
          <option value="100%">100% (Full)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Background</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={background === 'transparent' ? '#ffffff' : background}
            onChange={(e) => setProp((props: ColumnProps) => (props.background = e.target.value))}
            className="w-12 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={background}
            onChange={(e) => setProp((props: ColumnProps) => (props.background = e.target.value))}
            className="flex-1 px-3 py-2 border rounded"
            placeholder="transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Padding (px)</label>
        <input
          type="number"
          value={padding}
          min={0}
          max={64}
          onChange={(e) => setProp((props: ColumnProps) => (props.padding = Number(e.target.value)))}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-gray-500">
          Place columns inside a Row block for side-by-side layouts.
        </p>
      </div>
    </div>
  );
}