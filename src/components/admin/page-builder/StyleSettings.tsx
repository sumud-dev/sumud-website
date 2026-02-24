'use client';

import { useNode } from '@craftjs/core';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { useTranslations } from 'next-intl';
import type { StyleProps } from '@/src/lib/types/block-props';

interface StyleSettingsProps {
  prefix?: string;
}

/**
 * Reusable style settings component for blocks
 * Provides controls for width, height, padding, margin, and background
 */
export function StyleSettings({ prefix = 'blockSettings' }: StyleSettingsProps) {
  const t = useTranslations(`adminSettings.pageBuilder.${prefix}`);
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data?.props as Partial<StyleProps>,
  }));

  return (
    <div className="space-y-4">
      {/* Dimensions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">{t('dimensions') || 'Dimensions'}</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="width" className="text-xs">{t('width') || 'Width'}</Label>
            <Input
              id="width"
              value={props.width || 'auto'}
              onChange={(e) => setProp((props: StyleProps) => (props.width = e.target.value))}
              placeholder="auto"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-xs">{t('height') || 'Height'}</Label>
            <Input
              id="height"
              value={props.height || 'auto'}
              onChange={(e) => setProp((props: StyleProps) => (props.height = e.target.value))}
              placeholder="auto"
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Padding */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">{t('padding') || 'Padding (px)'}</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="paddingTop" className="text-xs">{t('top') || 'Top'}</Label>
            <Input
              id="paddingTop"
              type="number"
              value={props.paddingTop || 0}
              onChange={(e) => setProp((props: StyleProps) => (props.paddingTop = parseInt(e.target.value)))}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="paddingBottom" className="text-xs">{t('bottom') || 'Bottom'}</Label>
            <Input
              id="paddingBottom"
              type="number"
              value={props.paddingBottom || 0}
              onChange={(e) => setProp((props: StyleProps) => (props.paddingBottom = parseInt(e.target.value)))}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="paddingLeft" className="text-xs">{t('left') || 'Left'}</Label>
            <Input
              id="paddingLeft"
              type="number"
              value={props.paddingLeft || 0}
              onChange={(e) => setProp((props: StyleProps) => (props.paddingLeft = parseInt(e.target.value)))}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="paddingRight" className="text-xs">{t('right') || 'Right'}</Label>
            <Input
              id="paddingRight"
              type="number"
              value={props.paddingRight || 0}
              onChange={(e) => setProp((props: StyleProps) => (props.paddingRight = parseInt(e.target.value)))}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Margin */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">{t('margin') || 'Margin (px)'}</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="marginTop" className="text-xs">{t('top') || 'Top'}</Label>
            <Input
              id="marginTop"
              type="number"
              value={props.marginTop || 0}
              onChange={(e) => setProp((props: StyleProps) => (props.marginTop = parseInt(e.target.value)))}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="marginBottom" className="text-xs">{t('bottom') || 'Bottom'}</Label>
            <Input
              id="marginBottom"
              type="number"
              value={props.marginBottom || 0}
              onChange={(e) => setProp((props: StyleProps) => (props.marginBottom = parseInt(e.target.value)))}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="marginLeft" className="text-xs">{t('left') || 'Left'}</Label>
            <Input
              id="marginLeft"
              type="number"
              value={props.marginLeft || 0}
              onChange={(e) => setProp((props: StyleProps) => (props.marginLeft = parseInt(e.target.value)))}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="marginRight" className="text-xs">{t('right') || 'Right'}</Label>
            <Input
              id="marginRight"
              type="number"
              value={props.marginRight || 0}
              onChange={(e) => setProp((props: StyleProps) => (props.marginRight = parseInt(e.target.value)))}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="space-y-2">
        <Label htmlFor="backgroundColor" className="text-xs">{t('backgroundColor') || 'Background Color'}</Label>
        <Input
          id="backgroundColor"
          type="color"
          value={props.backgroundColor || '#ffffff'}
          onChange={(e) => setProp((props: StyleProps) => (props.backgroundColor = e.target.value))}
          className="h-8 w-full"
        />
      </div>

      {/* Display */}
      <div className="space-y-2">
        <Label htmlFor="display" className="text-xs">{t('display') || 'Display'}</Label>
        <Select
          value={props.display || 'block'}
          onValueChange={(value) => setProp((props: StyleProps) => (props.display = value as StyleProps['display']))}
        >
          <SelectTrigger id="display" className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="block">Block</SelectItem>
            <SelectItem value="flex">Flex</SelectItem>
            <SelectItem value="inline-block">Inline Block</SelectItem>
            <SelectItem value="inline-flex">Inline Flex</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
