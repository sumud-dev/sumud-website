"use client";

import * as React from "react";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Minus,
  Undo,
  Redo,
  Eye,
  FileText,
  Strikethrough,
  Table,
  Image,
  CheckSquare,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  IndentIncrease,
  IndentDecrease,
  Highlighter,
  Palette,
  Type,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: RichTextEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = React.useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const [colorPickerOpen, setColorPickerOpen] = React.useState(false);
  const [customColor, setCustomColor] = React.useState("#000000");

  // Update history when value changes externally
  React.useEffect(() => {
    if (value !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(value);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [value]);

  const handleChange = (newValue: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onChange(newValue);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newText = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`;
    handleChange(newText);

    // Reset cursor position after state update
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertAtLineStart = (prefix: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const lines = value.split("\n");
    const lineIndex = value.substring(0, start).split("\n").length - 1;
    
    lines[lineIndex] = `${prefix}${lines[lineIndex]}`;
    handleChange(lines.join("\n"));
  };

  const handleBold = () => insertMarkdown("**", "**");
  const handleItalic = () => insertMarkdown("*", "*");
  const handleStrikethrough = () => insertMarkdown("~~", "~~");
  const handleUnderline = () => insertMarkdown("<u>", "</u>");
  const handleCode = () => insertMarkdown("`", "`");
  const handleLink = () => insertMarkdown("[", "](url)");
  const handleHeading1 = () => insertAtLineStart("# ");
  const handleHeading2 = () => insertAtLineStart("## ");
  const handleHeading3 = () => insertAtLineStart("### ");
  const handleBulletList = () => insertAtLineStart("- ");
  const handleNumberedList = () => insertAtLineStart("1. ");
  const handleTaskList = () => insertAtLineStart("- [ ] ");
  const handleBlockquote = () => insertAtLineStart("> ");
  const handleHorizontalRule = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    insertMarkdown("\n\n---\n\n");
  };
  const handleCodeBlock = () => insertMarkdown("\n```\n", "\n```\n");
  const handleImage = () => insertMarkdown("![", "](image-url)");
  const handleTable = () => {
    const tableTemplate = `\n\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n\n`;
    insertMarkdown(tableTemplate);
  };
  const handleHighlight = () => insertMarkdown("==", "==");
  const handleTextColor = (color: string) => {
    insertMarkdown(`<span style="color: ${color};">`, "</span>");
    setColorPickerOpen(false);
  };
  const handleAlignLeft = () => insertAtLineStart('<div style="text-align: left;">');
  const handleAlignCenter = () => insertAtLineStart('<div style="text-align: center;">');
  const handleAlignRight = () => insertAtLineStart('<div style="text-align: right;">');
  const handleIndent = () => insertAtLineStart("  ");
  const handleOutdent = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const lines = value.split("\n");
    const lineIndex = value.substring(0, start).split("\n").length - 1;
    
    if (lines[lineIndex].startsWith("  ")) {
      lines[lineIndex] = lines[lineIndex].substring(2);
      handleChange(lines.join("\n"));
    }
  };

  // Simple markdown to HTML converter for preview
  const markdownToHtml = (markdown: string) => {
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // Bold (must come before italic to avoid conflicts)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^\*]+?)\*/g, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      // Highlight
      .replace(/==(.*?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-500">$1</mark>')
      // Images (must come before links)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-2 rounded" />')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener">$1</a>')
      // Inline code (must come before code blocks)
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded my-2 overflow-x-auto"><code class="text-sm font-mono whitespace-pre">$1</code></pre>')
      // Horizontal rule
      .replace(/^---$/gim, '<hr class="my-4 border-t" />')
      // Blockquote
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2">$1</blockquote>')
      // Task lists
      .replace(/^- \[ \] (.*$)/gim, '<li class="ml-4 flex items-center gap-2"><input type="checkbox" disabled class="rounded" /> $1</li>')
      .replace(/^- \[x\] (.*$)/gim, '<li class="ml-4 flex items-center gap-2"><input type="checkbox" checked disabled class="rounded" /> $1</li>')
      // Bullet lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
      // Numbered lists
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      // Tables - basic support
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(c => c.trim());
        return '<tr>' + cells.map(c => `<td class="border px-2 py-1">${c.trim()}</td>`).join('') + '</tr>';
      })
      // Line breaks (but preserve HTML tags)
      .replace(/\n(?![<])/g, '<br />');

    // Wrap lists
    html = html.replace(/(<li class="ml-4">.*?<\/li>)/gs, '<ul class="list-disc my-2">$1</ul>');
    html = html.replace(/(<li class="ml-4 list-decimal">.*?<\/li>)/gs, '<ol class="list-decimal my-2">$1</ol>');
    
    // Wrap tables
    if (html.includes('<tr>')) {
      html = html.replace(/(<tr>.*?<\/tr>)/gs, '<table class="border-collapse border my-2">$1</table>');
    }

    return html;
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border rounded-md bg-muted/50">
        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={disabled || historyIndex <= 0}
          className="h-8 px-2"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={disabled || historyIndex >= history.length - 1}
          className="h-8 px-2"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleHeading1}
          disabled={disabled}
          className="h-8 px-2"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleHeading2}
          disabled={disabled}
          className="h-8 px-2"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleHeading3}
          disabled={disabled}
          className="h-8 px-2"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBold}
          disabled={disabled}
          className="h-8 px-2"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          disabled={disabled}
          className="h-8 px-2"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleStrikethrough}
          disabled={disabled}
          className="h-8 px-2"
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUnderline}
          disabled={disabled}
          className="h-8 px-2"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleHighlight}
          disabled={disabled}
          className="h-8 px-2"
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-8 px-2"
              title="Text Color"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold mb-2">Text Colors</p>
                
                {/* Standard Colors */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-1">Standard</p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {[
                      { name: 'Black', value: '#000000' },
                      { name: 'White', value: '#ffffff' },
                      { name: 'Dark Gray', value: '#374151' },
                      { name: 'Gray', value: '#6b7280' },
                      { name: 'Light Gray', value: '#9ca3af' },
                      { name: 'Very Light Gray', value: '#d1d5db' },
                      { name: 'Brown', value: '#92400e' },
                      { name: 'Light Brown', value: '#d97706' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleTextColor(color.value)}
                        className="w-9 h-9 rounded-md border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all shadow-sm"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Red Shades */}
                <div className="space-y-1 mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Red Tones</p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {[
                      { name: 'Very Light Red', value: '#fee2e2' },
                      { name: 'Light Red', value: '#fecaca' },
                      { name: 'Soft Red', value: '#fca5a5' },
                      { name: 'Red', value: '#f87171' },
                      { name: 'Strong Red', value: '#ef4444' },
                      { name: 'Dark Red', value: '#dc2626' },
                      { name: 'Deep Red', value: '#b91c1c' },
                      { name: 'Very Dark Red', value: '#991b1b' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleTextColor(color.value)}
                        className="w-9 h-9 rounded-md border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all shadow-sm"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Orange Shades */}
                <div className="space-y-1 mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Orange Tones</p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {[
                      { name: 'Very Light Orange', value: '#ffedd5' },
                      { name: 'Light Orange', value: '#fed7aa' },
                      { name: 'Soft Orange', value: '#fdba74' },
                      { name: 'Orange', value: '#fb923c' },
                      { name: 'Strong Orange', value: '#f97316' },
                      { name: 'Dark Orange', value: '#ea580c' },
                      { name: 'Deep Orange', value: '#c2410c' },
                      { name: 'Very Dark Orange', value: '#9a3412' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleTextColor(color.value)}
                        className="w-9 h-9 rounded-md border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all shadow-sm"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Yellow Shades */}
                <div className="space-y-1 mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Yellow Tones</p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {[
                      { name: 'Very Light Yellow', value: '#fef3c7' },
                      { name: 'Light Yellow', value: '#fde68a' },
                      { name: 'Soft Yellow', value: '#fcd34d' },
                      { name: 'Yellow', value: '#fbbf24' },
                      { name: 'Strong Yellow', value: '#f59e0b' },
                      { name: 'Dark Yellow', value: '#d97706' },
                      { name: 'Deep Yellow', value: '#b45309' },
                      { name: 'Very Dark Yellow', value: '#92400e' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleTextColor(color.value)}
                        className="w-9 h-9 rounded-md border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all shadow-sm"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Green Shades */}
                <div className="space-y-1 mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Green Tones</p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {[
                      { name: 'Very Light Green', value: '#d1fae5' },
                      { name: 'Light Green', value: '#a7f3d0' },
                      { name: 'Soft Green', value: '#6ee7b7' },
                      { name: 'Green', value: '#34d399' },
                      { name: 'Strong Green', value: '#10b981' },
                      { name: 'Dark Green', value: '#059669' },
                      { name: 'Deep Green', value: '#047857' },
                      { name: 'Very Dark Green', value: '#065f46' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleTextColor(color.value)}
                        className="w-9 h-9 rounded-md border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all shadow-sm"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Blue Shades */}
                <div className="space-y-1 mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Blue Tones</p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {[
                      { name: 'Very Light Blue', value: '#dbeafe' },
                      { name: 'Light Blue', value: '#bfdbfe' },
                      { name: 'Soft Blue', value: '#93c5fd' },
                      { name: 'Blue', value: '#60a5fa' },
                      { name: 'Strong Blue', value: '#3b82f6' },
                      { name: 'Dark Blue', value: '#2563eb' },
                      { name: 'Deep Blue', value: '#1d4ed8' },
                      { name: 'Very Dark Blue', value: '#1e40af' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleTextColor(color.value)}
                        className="w-9 h-9 rounded-md border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all shadow-sm"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Purple Shades */}
                <div className="space-y-1 mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Purple Tones</p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {[
                      { name: 'Very Light Purple', value: '#e9d5ff' },
                      { name: 'Light Purple', value: '#d8b4fe' },
                      { name: 'Soft Purple', value: '#c084fc' },
                      { name: 'Purple', value: '#a855f7' },
                      { name: 'Strong Purple', value: '#9333ea' },
                      { name: 'Dark Purple', value: '#7e22ce' },
                      { name: 'Deep Purple', value: '#6b21a8' },
                      { name: 'Very Dark Purple', value: '#581c87' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleTextColor(color.value)}
                        className="w-9 h-9 rounded-md border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all shadow-sm"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Pink Shades */}
                <div className="space-y-1 mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Pink Tones</p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {[
                      { name: 'Very Light Pink', value: '#fce7f3' },
                      { name: 'Light Pink', value: '#fbcfe8' },
                      { name: 'Soft Pink', value: '#f9a8d4' },
                      { name: 'Pink', value: '#f472b6' },
                      { name: 'Strong Pink', value: '#ec4899' },
                      { name: 'Dark Pink', value: '#db2777' },
                      { name: 'Deep Pink', value: '#be185d' },
                      { name: 'Very Dark Pink', value: '#9f1239' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleTextColor(color.value)}
                        className="w-9 h-9 rounded-md border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all shadow-sm"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Color Picker */}
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Custom Color</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-12 h-9 rounded border-2 cursor-pointer"
                    title="Pick custom color"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleTextColor(customColor)}
                    className="flex-1"
                  >
                    Apply Custom Color
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBulletList}
          disabled={disabled}
          className="h-8 px-2"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleNumberedList}
          disabled={disabled}
          className="h-8 px-2"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleTaskList}
          disabled={disabled}
          className="h-8 px-2"
          title="Task List"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleIndent}
          disabled={disabled}
          className="h-8 px-2"
          title="Indent"
        >
          <IndentIncrease className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleOutdent}
          disabled={disabled}
          className="h-8 px-2"
          title="Outdent"
        >
          <IndentDecrease className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Code and other */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCode}
          disabled={disabled}
          className="h-8 px-2"
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCodeBlock}
          disabled={disabled}
          className="h-8 px-2"
          title="Code Block"
        >
          <FileText className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBlockquote}
          disabled={disabled}
          className="h-8 px-2"
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLink}
          disabled={disabled}
          className="h-8 px-2"
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleHorizontalRule}
          disabled={disabled}
          className="h-8 px-2"
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Media and Tables */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImage}
          disabled={disabled}
          className="h-8 px-2"
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleTable}
          disabled={disabled}
          className="h-8 px-2"
          title="Insert Table"
        >
          <Table className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAlignLeft}
          disabled={disabled}
          className="h-8 px-2"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAlignCenter}
          disabled={disabled}
          className="h-8 px-2"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAlignRight}
          disabled={disabled}
          className="h-8 px-2"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor with Preview */}
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">
            <FileText className="h-4 w-4 mr-2" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-2">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-2">
          <div 
            className={`border rounded-md p-4 ${className} bg-background overflow-auto prose prose-sm max-w-none`}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
