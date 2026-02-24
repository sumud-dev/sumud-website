import { useNode } from '@craftjs/core';
import { Alert as ShadcnAlert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { stylePropsToCSS, type StyleProps } from '@/src/lib/types/block-props';

interface AlertProps extends StyleProps {
  title: string;
  description: string;
  variant: 'default' | 'destructive';
  icon: 'info' | 'warning' | 'error' | 'success';
}

export const Alert = ({ 
  title = 'Alert Title',
  description = 'This is an alert description.',
  variant = 'default',
  icon = 'info',
  ...styleProps
}: Partial<AlertProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const icons = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
    success: CheckCircle,
  };

  const Icon = icons[icon];

  const styles = stylePropsToCSS({
    marginBottom: 16,
    maxWidth: '80rem',
    ...styleProps,
  });

  return (
    <div ref={(ref) => { if (ref) connect(drag(ref)); }} className="mx-auto">
      <ShadcnAlert variant={variant}>
        <Icon className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </ShadcnAlert>
    </div>
  );
};

Alert.craft = {
  displayName: 'Alert',
  props: {
    title: 'Alert Title',
    description: 'This is an alert description.',
    variant: 'default',
    icon: 'info',
    marginTop: 0,
    marginBottom: 16,
    marginLeft: 0,
    marginRight: 0,
    maxWidth: '80rem',
  },
  related: {
    settings: AlertSettings,
  },
};

function AlertSettings() {
  const {
    actions: { setProp },
    title,
    description,
    variant,
    icon,
  } = useNode((node) => ({
    title: node.data?.props?.title,
    description: node.data?.props?.description,
    variant: node.data?.props?.variant,
    icon: node.data?.props?.icon,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setProp((props: AlertProps) => (props.title = e.target.value))}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setProp((props: AlertProps) => (props.description = e.target.value))}
          rows={3}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Variant</label>
        <select
          value={variant}
          onChange={(e) => setProp((props: AlertProps) => (props.variant = e.target.value as any))}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="default">Default</option>
          <option value="destructive">Destructive</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Icon</label>
        <select
          value={icon}
          onChange={(e) => setProp((props: AlertProps) => (props.icon = e.target.value as any))}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="success">Success</option>
        </select>
      </div>
    </div>
  );
}