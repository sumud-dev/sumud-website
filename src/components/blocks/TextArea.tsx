import { useNode } from '@craftjs/core';
import { Textarea } from '@/src/components/ui/textarea';

interface TextAreaProps {
  placeholder: string;
  rows: number;
  disabled: boolean;
  value: string;
}

export const TextArea = ({ 
  placeholder = 'Enter your text here...',
  rows = 4,
  disabled = false,
  value = ''
}: Partial<TextAreaProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)); }} style={styles} className="mx-auto">
      <Textarea
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        defaultValue={value}
        className="resize-none"
      />
    </div>
  );
};

TextArea.craft = {
  displayName: 'Text Area',
  props: {
    placeholder: 'Enter your text here...',
    rows: 4,
    disabled: false,
    value: '',
  },
  related: {
    settings: TextAreaSettings,
  },
};

function TextAreaSettings() {
  const {
    actions: { setProp },
    placeholder,
    rows,
    disabled,
    value,
  } = useNode((node) => ({
    placeholder: node.data?.props?.placeholder,
    rows: node.data?.props?.rows,
    disabled: node.data?.props?.disabled,
    value: node.data?.props?.value,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">Placeholder</label>
        <input
          type="text"
          value={placeholder}
          onChange={(e) => setProp((props: TextAreaProps) => (props.placeholder = e.target.value))}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Default Value</label>
        <textarea
          value={value}
          onChange={(e) => setProp((props: TextAreaProps) => (props.value = e.target.value))}
          rows={3}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Rows</label>
        <input
          type="number"
          value={rows}
          min={2}
          max={20}
          onChange={(e) => setProp((props: TextAreaProps) => (props.rows = Number(e.target.value)))}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={disabled}
          onChange={(e) => setProp((props: TextAreaProps) => (props.disabled = e.target.checked))}
          className="w-4 h-4"
        />
        <label className="text-sm font-medium">Disabled</label>
      </div>
    </div>
  );
}