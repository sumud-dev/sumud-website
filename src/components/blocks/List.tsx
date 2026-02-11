import { useNode } from '@craftjs/core';
import { stylePropsToCSS, type StyleProps } from '@/src/lib/types/block-props';

interface ListItem {
  id: string;
  text: string;
}

interface ListProps extends StyleProps {
  items: ListItem[];
  ordered: boolean;
  style: 'default' | 'none' | 'circle' | 'square' | 'decimal' | 'roman';
}

export const List = ({ 
  items = [
    { id: '1', text: 'List item 1' },
    { id: '2', text: 'List item 2' },
    { id: '3', text: 'List item 3' },
  ],
  ordered = false,
  style = 'default',
  ...styleProps
}: Partial<ListProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const listStyleMap = {
    default: ordered ? 'decimal' : 'disc',
    none: 'none',
    circle: 'circle',
    square: 'square',
    decimal: 'decimal',
    roman: 'lower-roman',
  };

  const Component = ordered ? 'ol' : 'ul';

  const styles = stylePropsToCSS({
    marginBottom: 16,
    maxWidth: '80rem',
    ...styleProps,
  });

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)); }} style={styles} className="mx-auto w-full">
      <Component
        style={{ listStyleType: listStyleMap[style] }}
        className="space-y-2 pl-6"
      >
        {items.map((item) => (
          <li key={item.id} className="text-base">
            {item.text}
          </li>
        ))}
      </Component>
    </div>
  );
};

List.craft = {
  displayName: 'List',
  props: {
    items: [
      { id: '1', text: 'List item 1' },
      { id: '2', text: 'List item 2' },
      { id: '3', text: 'List item 3' },
    ],
    ordered: false,
    style: 'default',
    marginTop: 0,
    marginBottom: 16,
    marginLeft: 0,
    marginRight: 0,
    maxWidth: '80rem',
  },
  related: {
    settings: ListSettings,
  },
};

function ListSettings() {
  const {
    actions: { setProp },
    items,
    ordered,
    style,
  } = useNode((node) => ({
    items: node.data?.props?.items,
    ordered: node.data?.props?.ordered,
    style: node.data?.props?.style,
  }));

  const addItem = () => {
    setProp((props: ListProps) => {
      props.items.push({
        id: `${Date.now()}`,
        text: `List item ${props.items.length + 1}`,
      });
    });
  };

  const removeItem = (id: string) => {
    setProp((props: ListProps) => {
      props.items = props.items.filter(item => item.id !== id);
    });
  };

  const updateItem = (id: string, text: string) => {
    setProp((props: ListProps) => {
      const item = props.items.find(i => i.id === id);
      if (item) item.text = text;
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={ordered}
          onChange={(e) => setProp((props: ListProps) => (props.ordered = e.target.checked))}
          className="w-4 h-4"
        />
        <label className="text-sm font-medium">Ordered list</label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">List Style</label>
        <select
          value={style}
          onChange={(e) => setProp((props: ListProps) => (props.style = e.target.value as any))}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="default">Default</option>
          <option value="none">None</option>
          <option value="circle">Circle</option>
          <option value="square">Square</option>
          {ordered && (
            <>
              <option value="decimal">Decimal</option>
              <option value="roman">Roman</option>
            </>
          )}
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Items</label>
          <button
            onClick={addItem}
            className="text-sm px-2 py-1 bg-blue-600 text-white rounded"
          >
            Add Item
          </button>
        </div>
        
        <div className="space-y-2">
          {items.map((item: ListItem, index: number) => (
            <div key={item.id} className="flex gap-2">
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItem(item.id, e.target.value)}
                placeholder={`Item ${index + 1}`}
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(item.id)}
                  className="px-2 py-1 text-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}