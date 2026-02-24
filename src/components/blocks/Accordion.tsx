import { useNode } from '@craftjs/core';
import {
  Accordion as ShadcnAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';
import { stylePropsToCSS, type StyleProps } from '@/src/lib/types/block-props';

interface AccordionItemData {
  id: string;
  title: string;
  content: string;
}

interface AccordionProps extends StyleProps {
  items: AccordionItemData[];
  type: 'single' | 'multiple';
}

export const Accordion = ({ 
  items = [
    { id: '1', title: 'Item 1', content: 'Content 1' },
    { id: '2', title: 'Item 2', content: 'Content 2' },
  ],
  type = 'single',
  ...styleProps
}: Partial<AccordionProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const styles = stylePropsToCSS({
    marginBottom: 16,
    maxWidth: '80rem',
    ...styleProps,
  });

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)); }} className="mx-auto">
      <ShadcnAccordion type={type} collapsible={type === 'single'}>
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </ShadcnAccordion>
    </div>
  );
};

Accordion.craft = {
  displayName: 'Accordion',
  props: {
    items: [
      { id: '1', title: 'Item 1', content: 'Content 1' },
      { id: '2', title: 'Item 2', content: 'Content 2' },
    ],
    type: 'single',
    marginTop: 0,
    marginBottom: 16,
    marginLeft: 0,
    marginRight: 0,
    maxWidth: '80rem',
  },
  related: {
    settings: AccordionSettings,
  },
};

function AccordionSettings() {
  const {
    actions: { setProp },
    items,
    type,
  } = useNode((node) => ({
    items: node.data?.props?.items,
    type: node.data?.props?.type,
  }));

  const addItem = () => {
    setProp((props: AccordionProps) => {
      props.items.push({
        id: `${Date.now()}`,
        title: `Item ${props.items.length + 1}`,
        content: `Content ${props.items.length + 1}`,
      });
    });
  };

  const removeItem = (id: string) => {
    setProp((props: AccordionProps) => {
      props.items = props.items.filter(item => item.id !== id);
    });
  };

  const updateItem = (id: string, field: 'title' | 'content', value: string) => {
    setProp((props: AccordionProps) => {
      const item = props.items.find(i => i.id === id);
      if (item) item[field] = value;
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">Type</label>
        <select
          value={type}
          onChange={(e) => setProp((props: AccordionProps) => (props.type = e.target.value as any))}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="single">Single</option>
          <option value="multiple">Multiple</option>
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
        
        <div className="space-y-3">
          {items.map((item: AccordionItemData, index: number) => (
            <div key={item.id} className="border rounded p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Item {index + 1}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={item.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, 'title', e.target.value)}
                placeholder="Title"
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <textarea
                value={item.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateItem(item.id, 'content', e.target.value)}
                placeholder="Content"
                rows={3}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}