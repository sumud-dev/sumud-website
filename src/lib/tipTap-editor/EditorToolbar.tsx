"use client";

import React from 'react';
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  IndentIncrease,
  IndentDecrease,
  Link as LinkIcon,
  Image,
  Video,
  Table,
  Quote,
  Minus,
  Layout,
  Undo,
  Redo,
  RemoveFormatting,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { TEXT_COLORS, BACKGROUND_COLORS, HIGHLIGHT_COLORS } from './colors';

interface EditorToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrikethrough: () => void;
  onCode: () => void;
  onHighlight: () => void;
  onTextColor: (color: string) => void;
  onBackgroundColor: (color: string) => void;
  onHeading: (level: number) => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onAlignJustify: () => void;
  onBulletList: () => void;
  onNumberedList: () => void;
  onTaskList: () => void;
  onIndent: () => void;
  onOutdent: () => void;
  onLink: () => void;
  onImage: () => void;
  onVideo: () => void;
  onTable: () => void;
  onQuote: () => void;
  onDivider: () => void;
  onTemplate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearFormatting: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabled?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onCode,
  onHighlight,
  onTextColor,
  onBackgroundColor,
  onHeading,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignJustify,
  onBulletList,
  onNumberedList,
  onTaskList,
  onIndent,
  onOutdent,
  onLink,
  onImage,
  onVideo,
  onTable,
  onQuote,
  onDivider,
  onTemplate,
  onUndo,
  onRedo,
  onClearFormatting,
  canUndo,
  canRedo,
  disabled = false,
}) => {
  const [colorPopoverOpen, setColorPopoverOpen] = React.useState(false);

  const ToolbarButton = ({ 
    onClick, 
    icon: Icon, 
    title, 
    disabled: buttonDisabled 
  }: { 
    onClick: () => void; 
    icon: React.ComponentType<{ className?: string }>; 
    title: string;
    disabled?: boolean;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled || buttonDisabled}
      className="h-9 px-2.5 hover:bg-accent"
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  const Divider = () => <div className="w-px h-6 bg-border mx-1" />;

  return (
    <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="flex flex-wrap items-center gap-1 p-2">
        {/* History */}
        <ToolbarButton onClick={onUndo} icon={Undo} title="Undo" disabled={!canUndo} />
        <ToolbarButton onClick={onRedo} icon={Redo} title="Redo" disabled={!canRedo} />
        
        <Divider />

        {/* Heading Selector */}
        <Select onValueChange={(value) => onHeading(parseInt(value) as 1 | 2 | 3)} disabled={disabled}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Paragraph</SelectItem>
            <SelectItem value="1">Heading 1</SelectItem>
            <SelectItem value="2">Heading 2</SelectItem>
            <SelectItem value="3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        <Divider />

        {/* Text Formatting */}
        <ToolbarButton onClick={onBold} icon={Bold} title="Bold (Ctrl+B)" />
        <ToolbarButton onClick={onItalic} icon={Italic} title="Italic (Ctrl+I)" />
        <ToolbarButton onClick={onUnderline} icon={Underline} title="Underline (Ctrl+U)" />
        <ToolbarButton onClick={onStrikethrough} icon={Strikethrough} title="Strikethrough" />
        <ToolbarButton onClick={onCode} icon={Code} title="Inline Code" />
        <ToolbarButton onClick={onHighlight} icon={Highlighter} title="Highlight" />
        
        {/* Colors */}
        <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-9 px-2.5 hover:bg-accent"
              title="Text & Background Colors"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start" side="bottom">
            <Tabs defaultValue="text">
              <TabsList className="grid w-full grid-cols-3 mb-3">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="background">Background</TabsTrigger>
                <TabsTrigger value="highlight">Highlight</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-2">
                <p className="text-sm font-medium mb-2">Text Color</p>
                <div className="grid grid-cols-10 gap-2">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        onTextColor(color.value);
                        setColorPopoverOpen(false);
                      }}
                      className="w-7 h-7 rounded border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="background" className="space-y-2">
                <p className="text-sm font-medium mb-2">Background Color</p>
                <div className="grid grid-cols-9 gap-2">
                  {BACKGROUND_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        onBackgroundColor(color.value);
                        setColorPopoverOpen(false);
                      }}
                      className="w-7 h-7 rounded border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="highlight" className="space-y-2">
                <p className="text-sm font-medium mb-2">Highlight Color</p>
                <div className="grid grid-cols-6 gap-2">
                  {HIGHLIGHT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        onTextColor(color.value);
                        setColorPopoverOpen(false);
                      }}
                      className="w-9 h-9 rounded border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={onAlignLeft} icon={AlignLeft} title="Align Left" />
        <ToolbarButton onClick={onAlignCenter} icon={AlignCenter} title="Center" />
        <ToolbarButton onClick={onAlignRight} icon={AlignRight} title="Align Right" />
        <ToolbarButton onClick={onAlignJustify} icon={AlignJustify} title="Justify" />

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={onBulletList} icon={List} title="Bullet List" />
        <ToolbarButton onClick={onNumberedList} icon={ListOrdered} title="Numbered List" />
        <ToolbarButton onClick={onTaskList} icon={CheckSquare} title="Task List" />
        <ToolbarButton onClick={onIndent} icon={IndentIncrease} title="Increase Indent" />
        <ToolbarButton onClick={onOutdent} icon={IndentDecrease} title="Decrease Indent" />

        <Divider />

        {/* Insert */}
        <ToolbarButton onClick={onLink} icon={LinkIcon} title="Insert Link" />
        <ToolbarButton onClick={onImage} icon={Image} title="Insert Image" />
        <ToolbarButton onClick={onVideo} icon={Video} title="Embed Video" />
        <ToolbarButton onClick={onTable} icon={Table} title="Insert Table" />
        <ToolbarButton onClick={onQuote} icon={Quote} title="Quote" />
        <ToolbarButton onClick={onDivider} icon={Minus} title="Horizontal Divider" />

        <Divider />

        {/* Templates & Clear */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onTemplate}
          disabled={disabled}
          className="h-9 px-3 hover:bg-accent font-medium"
          title="Insert Template"
        >
          <Layout className="h-4 w-4 mr-2" />
          Templates
        </Button>
        
        <ToolbarButton 
          onClick={onClearFormatting} 
          icon={RemoveFormatting} 
          title="Clear Formatting" 
        />
      </div>
    </div>
  );
};