import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';
import { useRef } from 'react';
import { stylePropsToCSS, type StyleProps } from '@/src/lib/types/block-props';

interface TextProps extends StyleProps {
  text: string;
  fontSize: number;
  textAlign: 'left' | 'center' | 'right';
  color: string;
  bold: boolean;
  italic: boolean;
}

export const Text = ({ 
  text = 'Enter text', 
  fontSize = 16, 
  textAlign = 'left',
  color = '#000000',
  bold = false,
  italic = false,
  ...styleProps
}: Partial<TextProps>) => {
  const {
    connectors: { connect, drag },
    actions: { setProp },
  } = useNode();

  const contentRef = useRef<HTMLElement>(null!);

  const isInline = styleProps.display === 'inline-block';

  const styles = stylePropsToCSS({
    marginBottom: isInline ? 0 : 16,
    maxWidth: styleProps.maxWidth || '80rem',
    ...styleProps,
  });

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={{ 
        ...styles,
        fontSize: `${fontSize}px`, 
        textAlign: isInline ? undefined : textAlign,
        color,
        fontWeight: bold ? 'bold' : 'normal',
        fontStyle: italic ? 'italic' : 'normal',
        display: isInline ? 'inline-block' : 'block',
      }}
      className="mx-auto"
    >
      <ContentEditable
        innerRef={contentRef}
        html={text}
        onChange={(e) => {
          setProp((props: TextProps) => (props.text = e.target.value));
        }}
        tagName={isInline ? 'span' : 'p'}
      />
    </div>
  );
};

Text.craft = {
  displayName: 'Text',
  props: {
    text: 'Enter text',
    fontSize: 16,
    textAlign: 'left',
    color: '#000000',
    bold: false,
    italic: false,
    marginTop: 0,
    marginBottom: 16,
    marginLeft: 0,
    marginRight: 0,
    maxWidth: '80rem',
  },
  related: {
    settings: TextSettings,
  },
};

function TextSettings() {
  const {
    actions: { setProp },
    fontSize,
    textAlign,
    color,
    bold,
    italic,
    display,
  } = useNode((node) => ({
    fontSize: node.data?.props?.fontSize,
    textAlign: node.data?.props?.textAlign,
    color: node.data?.props?.color,
    bold: node.data?.props?.bold,
    italic: node.data?.props?.italic,
    display: node.data?.props?.display,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">Display</label>
        <select
          value={display || 'block'}
          onChange={(e) => setProp((props: any) => (props.display = e.target.value as StyleProps['display']))}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="block">Block (full width)</option>
          <option value="inline-block">Inline Block (side by side)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Font Size</label>
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setProp((props: TextProps) => (props.fontSize = Number(e.target.value)))}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setProp((props: TextProps) => (props.color = e.target.value))}
          className="w-full h-10 px-1 py-1 border rounded cursor-pointer"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={bold}
            onChange={(e) => setProp((props: TextProps) => (props.bold = e.target.checked))}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Bold</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={italic}
            onChange={(e) => setProp((props: TextProps) => (props.italic = e.target.checked))}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Italic</span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Align</label>
        <select
          value={textAlign}
          onChange={(e) => setProp((props: TextProps) => (props.textAlign = e.target.value as TextProps['textAlign']))}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );
}