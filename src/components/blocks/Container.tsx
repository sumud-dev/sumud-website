'use client';

import { useNode, useEditor } from '@craftjs/core';
import { ReactNode } from 'react';

interface ContainerProps {
  background: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  children?: ReactNode;
}

export const Container = ({
  background = '#ffffff',
  paddingTop = 40,
  paddingBottom = 40,
  paddingLeft = 40,
  paddingRight = 40,
  children,
}: Partial<ContainerProps>) => {
  const {
    connectors: { connect, drag },
    id,
  } = useNode();

  const { query } = useEditor();

  // Check if container has any children besides the placeholder
  const hasContent = () => {
    const node = query.node(id).get();
    const childNodes = node.data.nodes || [];
    
    // If there are any child nodes, we have content
    return childNodes.length > 0;
  };

  const showPlaceholder = !hasContent();

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={{
        background,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`,
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {showPlaceholder ? (
        <div className="flex items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-300 rounded">
          <p className="text-lg">Drag blocks here to start building your page...</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

Container.craft = {
  displayName: 'Page Container',
  props: {
    background: '#ffffff',
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 40,
    paddingRight: 40,
  },
  rules: {
    canDrag: () => false, // Can't drag the root container
  },
  related: {
    settings: ContainerSettings,
  },
};

function ContainerSettings() {
  const {
    actions: { setProp },
    background,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
  } = useNode((node) => ({
    background: node.data?.props?.background,
    paddingTop: node.data?.props?.paddingTop,
    paddingBottom: node.data?.props?.paddingBottom,
    paddingLeft: node.data?.props?.paddingLeft,
    paddingRight: node.data?.props?.paddingRight,
  }));

  return (
    <div className="space-y-4 p-4">
      <h3 className="font-semibold text-sm">Page Properties</h3>
      
      <div>
        <label className="block text-sm font-medium mb-2">Background</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={background}
            onChange={(e) => setProp((props: ContainerProps) => (props.background = e.target.value))}
            className="w-12 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={background}
            onChange={(e) => setProp((props: ContainerProps) => (props.background = e.target.value))}
            className="flex-1 px-3 py-2 border rounded"
            placeholder="#ffffff"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Padding</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600">Top</label>
            <input
              type="number"
              value={paddingTop}
              onChange={(e) => setProp((props: ContainerProps) => (props.paddingTop = Number(e.target.value)))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Bottom</label>
            <input
              type="number"
              value={paddingBottom}
              onChange={(e) => setProp((props: ContainerProps) => (props.paddingBottom = Number(e.target.value)))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Left</label>
            <input
              type="number"
              value={paddingLeft}
              onChange={(e) => setProp((props: ContainerProps) => (props.paddingLeft = Number(e.target.value)))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Right</label>
            <input
              type="number"
              value={paddingRight}
              onChange={(e) => setProp((props: ContainerProps) => (props.paddingRight = Number(e.target.value)))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}