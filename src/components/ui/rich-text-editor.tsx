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
  ChevronDown,
  Subscript,
  Superscript,
  RemoveFormatting,
  Columns,
  Layout,
  Box,
  CircleAlert,
  Info,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { useTranslations } from 'next-intl';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

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
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [linkText, setLinkText] = React.useState("");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [imageAlt, setImageAlt] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [accordionDialogOpen, setAccordionDialogOpen] = React.useState(false);
  const [accordionTitle, setAccordionTitle] = React.useState("");
  const [accordionContent, setAccordionContent] = React.useState("");
  const [tableDialogOpen, setTableDialogOpen] = React.useState(false);
  const [tableRows, setTableRows] = React.useState("3");
  const [tableCols, setTableCols] = React.useState("3");
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"edit" | "preview">("preview");
  const tc = useTranslations('common');

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

  // Handle keyboard events for smart list continuation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const lines = value.split("\n");
      const currentLineIndex = value.substring(0, start).split("\n").length - 1;
      const currentLine = lines[currentLineIndex];

      // Check for numbered list
      const numberedListMatch = currentLine.match(/^(\s*)(\d+)\.\s/);
      if (numberedListMatch) {
        e.preventDefault();
        const indent = numberedListMatch[1];
        const currentNumber = parseInt(numberedListMatch[2]);
        const nextNumber = currentNumber + 1;

        // Check if current line is empty (just the list marker)
        const contentAfterMarker = currentLine.substring(numberedListMatch[0].length).trim();
        if (!contentAfterMarker) {
          // Remove the empty list item and exit list mode
          const beforeCursor = value.substring(0, start - numberedListMatch[0].length);
          const afterCursor = value.substring(start);
          handleChange(`${beforeCursor}\n${afterCursor}`);
          setTimeout(() => {
            textarea.setSelectionRange(beforeCursor.length + 1, beforeCursor.length + 1);
          }, 0);
        } else {
          // Continue the numbered list with next number
          const beforeCursor = value.substring(0, start);
          const afterCursor = value.substring(start);
          handleChange(`${beforeCursor}\n${indent}${nextNumber}. ${afterCursor}`);
          setTimeout(() => {
            const newPosition = beforeCursor.length + indent.length + String(nextNumber).length + 3;
            textarea.setSelectionRange(newPosition, newPosition);
          }, 0);
        }
        return;
      }

      // Check for bullet list
      const bulletListMatch = currentLine.match(/^(\s*)([-*])\s/);
      if (bulletListMatch) {
        e.preventDefault();
        const indent = bulletListMatch[1];
        const marker = bulletListMatch[2];

        const contentAfterMarker = currentLine.substring(bulletListMatch[0].length).trim();
        if (!contentAfterMarker) {
          // Remove the empty list item and exit list mode
          const beforeCursor = value.substring(0, start - bulletListMatch[0].length);
          const afterCursor = value.substring(start);
          handleChange(`${beforeCursor}\n${afterCursor}`);
          setTimeout(() => {
            textarea.setSelectionRange(beforeCursor.length + 1, beforeCursor.length + 1);
          }, 0);
        } else {
          // Continue the bullet list
          const beforeCursor = value.substring(0, start);
          const afterCursor = value.substring(start);
          handleChange(`${beforeCursor}\n${indent}${marker} ${afterCursor}`);
          setTimeout(() => {
            const newPosition = beforeCursor.length + indent.length + 3;
            textarea.setSelectionRange(newPosition, newPosition);
          }, 0);
        }
        return;
      }

      // Check for task list
      const taskListMatch = currentLine.match(/^(\s*)-\s\[([ x])\]\s/);
      if (taskListMatch) {
        e.preventDefault();
        const indent = taskListMatch[1];

        const contentAfterMarker = currentLine.substring(taskListMatch[0].length).trim();
        if (!contentAfterMarker) {
          // Remove the empty task item and exit list mode
          const beforeCursor = value.substring(0, start - taskListMatch[0].length);
          const afterCursor = value.substring(start);
          handleChange(`${beforeCursor}\n${afterCursor}`);
          setTimeout(() => {
            textarea.setSelectionRange(beforeCursor.length + 1, beforeCursor.length + 1);
          }, 0);
        } else {
          // Continue the task list
          const beforeCursor = value.substring(0, start);
          const afterCursor = value.substring(start);
          handleChange(`${beforeCursor}\n${indent}- [ ] ${afterCursor}`);
          setTimeout(() => {
            const newPosition = beforeCursor.length + indent.length + 7;
            textarea.setSelectionRange(newPosition, newPosition);
          }, 0);
        }
        return;
      }
    }

    // Tab key for indentation
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        handleOutdent();
      } else {
        handleIndent();
      }
    }
  };

  const handleBold = () => insertMarkdown("**", "**");
  const handleItalic = () => insertMarkdown("*", "*");
  const handleStrikethrough = () => insertMarkdown("~~", "~~");
  const handleUnderline = () => insertMarkdown("<u>", "</u>");
  const handleCode = () => insertMarkdown("`", "`");
  const handleSuperscript = () => insertMarkdown("<sup>", "</sup>");
  const handleSubscript = () => insertMarkdown("<sub>", "</sub>");

  const handleLink = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (selectedText) {
      setLinkText(selectedText);
    }
    setLinkDialogOpen(true);
  };

  const insertLink = () => {
    insertMarkdown(`[${linkText}](${linkUrl})`);
    setLinkDialogOpen(false);
    setLinkText("");
    setLinkUrl("");
  };

  const handleImage = () => {
    setImageDialogOpen(true);
  };

  const insertImage = () => {
    insertMarkdown(`![${imageAlt}](${imageUrl})`);
    setImageDialogOpen(false);
    setImageAlt("");
    setImageUrl("");
  };

  const handleAccordion = () => {
    setAccordionDialogOpen(true);
  };

  const insertAccordion = () => {
    const accordionMarkdown = `\n\n<details>\n<summary>${accordionTitle}</summary>\n\n${accordionContent}\n\n</details>\n\n`;
    insertMarkdown(accordionMarkdown);
    setAccordionDialogOpen(false);
    setAccordionTitle("");
    setAccordionContent("");
  };

  const handleTable = () => {
    setTableDialogOpen(true);
  };

  const insertTable = () => {
    const rows = parseInt(tableRows);
    const cols = parseInt(tableCols);

    let table = "\n\n";
    
    // Header row
    table += "| " + Array(cols).fill("Header").map((h, i) => `${h} ${i + 1}`).join(" | ") + " |\n";
    
    // Separator row
    table += "| " + Array(cols).fill("---").join(" | ") + " |\n";
    
    // Data rows
    for (let i = 0; i < rows; i++) {
      table += "| " + Array(cols).fill(`Cell ${i + 1}`).join(" | ") + " |\n";
    }
    
    table += "\n";
    
    insertMarkdown(table);
    setTableDialogOpen(false);
    setTableRows("3");
    setTableCols("3");
  };

  const handleHeading = (level: number) => {
    const prefix = "#".repeat(level) + " ";
    insertAtLineStart(prefix);
  };

  const handleBulletList = () => insertAtLineStart("- ");
  const handleNumberedList = () => insertAtLineStart("1. ");
  const handleTaskList = () => insertAtLineStart("- [ ] ");
  const handleBlockquote = () => insertAtLineStart("> ");

  const handleCallout = (type: "info" | "warning" | "success" | "error") => {
    const icons = {
      info: "ℹ️",
      warning: "⚠️",
      success: "✅",
      error: "❌"
    };
    const colors = {
      info: "#3b82f6",
      warning: "#f59e0b",
      success: "#10b981",
      error: "#ef4444"
    };
    const callout = `\n\n<div style="border-left: 4px solid ${colors[type]}; background-color: ${colors[type]}15; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">\n<strong>${icons[type]} Note:</strong> Your content here\n</div>\n\n`;
    insertMarkdown(callout);
  };

  const insertTemplate = (template: string) => {
    const templates: Record<string, string> = {
      card: `\n\n<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 16px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

### Card Title

Card content goes here. You can add any markdown content.

</div>\n\n`,
      
      twoColumn: `\n\n<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 16px 0;">

<div>

### Column 1

Content for the first column.

</div>

<div>

### Column 2

Content for the second column.

</div>

</div>\n\n`,
      
      threeColumn: `\n\n<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin: 16px 0;">

<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">

#### Column 1
Content here

</div>

<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">

#### Column 2
Content here

</div>

<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">

#### Column 3
Content here

</div>

</div>\n\n`,
      
      hero: `\n\n<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 40px; border-radius: 12px; text-align: center; margin: 24px 0;">

# Welcome to Our Platform

Discover amazing features and get started today

<div style="margin-top: 24px;">
<a href="#" style="background: white; color: #667eea; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Get Started</a>
</div>

</div>\n\n`,
      
      featureGrid: `\n\n<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 24px 0;">

<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center;">
<div style="font-size: 32px; margin-bottom: 12px;">🚀</div>

### Fast Performance
Lightning-fast load times

</div>

<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center;">
<div style="font-size: 32px; margin-bottom: 12px;">🔒</div>

### Secure
Enterprise-grade security

</div>

<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center;">
<div style="font-size: 32px; margin-bottom: 12px;">💎</div>

### Premium Quality
Best-in-class features

</div>

</div>\n\n`,
      
      timeline: `\n\n<div style="border-left: 3px solid #3b82f6; padding-left: 24px; margin: 24px 0;">

<div style="margin-bottom: 24px;">

#### 2024 - Present
<span style="color: #6b7280;">Current milestone</span>

Achieving great things and making progress.

</div>

<div style="margin-bottom: 24px;">

#### 2023
<span style="color: #6b7280;">Major update</span>

Launched new features and improvements.

</div>

<div style="margin-bottom: 24px;">

#### 2022
<span style="color: #6b7280;">Getting started</span>

The journey begins here.

</div>

</div>\n\n`,
      
      pricing: `\n\n<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin: 24px 0;">

<div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 32px; text-align: center;">

### Basic
<div style="font-size: 48px; font-weight: bold; margin: 16px 0;">$9<span style="font-size: 18px; color: #6b7280;">/mo</span></div>

- Feature 1
- Feature 2
- Feature 3

<div style="margin-top: 24px;">
<a href="#" style="background: #3b82f6; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; display: inline-block;">Choose Plan</a>
</div>

</div>

<div style="border: 2px solid #3b82f6; border-radius: 12px; padding: 32px; text-align: center; position: relative; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);">
<div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #3b82f6; color: white; padding: 4px 16px; border-radius: 12px; font-size: 12px; font-weight: 600;">POPULAR</div>

### Pro
<div style="font-size: 48px; font-weight: bold; margin: 16px 0;">$29<span style="font-size: 18px; color: #6b7280;">/mo</span></div>

- All Basic features
- Feature 4
- Feature 5
- Priority support

<div style="margin-top: 24px;">
<a href="#" style="background: #3b82f6; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; display: inline-block;">Choose Plan</a>
</div>

</div>

<div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 32px; text-align: center;">

### Enterprise
<div style="font-size: 48px; font-weight: bold; margin: 16px 0;">$99<span style="font-size: 18px; color: #6b7280;">/mo</span></div>

- All Pro features
- Feature 6
- Feature 7
- Dedicated support

<div style="margin-top: 24px;">
<a href="#" style="background: #3b82f6; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; display: inline-block;">Choose Plan</a>
</div>

</div>

</div>\n\n`,
      
      testimonial: `\n\n<div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; margin: 24px 0; background: #f9fafb;">

<div style="font-size: 48px; color: #3b82f6; line-height: 1;">"</div>

<p style="font-size: 18px; font-style: italic; color: #374151; margin: 16px 0;">This is an amazing product that has transformed the way we work. Highly recommended!</p>

<div style="display: flex; align-items: center; margin-top: 24px;">
<div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin-right: 16px;"></div>
<div>
<div style="font-weight: 600; color: #111827;">John Doe</div>
<div style="color: #6b7280; font-size: 14px;">CEO, Company Inc.</div>
</div>
</div>

</div>\n\n`,
      
      faq: `\n\n<details style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
<summary style="font-weight: 600; cursor: pointer; user-select: none;">Question 1: What is this?</summary>
<div style="margin-top: 12px; color: #6b7280;">
This is the answer to your first question. You can add as much detail as needed here.
</div>
</details>

<details style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
<summary style="font-weight: 600; cursor: pointer; user-select: none;">Question 2: How does it work?</summary>
<div style="margin-top: 12px; color: #6b7280;">
Here's how it works with step-by-step instructions.
</div>
</details>

<details style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
<summary style="font-weight: 600; cursor: pointer; user-select: none;">Question 3: Is it free?</summary>
<div style="margin-top: 12px; color: #6b7280;">
Pricing information and details about free tier.
</div>
</details>\n\n`,
    };

    insertMarkdown(templates[template] || "");
    setTemplateDialogOpen(false);
  };

  const handleHorizontalRule = () => insertMarkdown("\n\n---\n\n");
  const handleCodeBlock = () => insertMarkdown("\n```\n", "\n```\n");
  const handleHighlight = () => insertMarkdown("==", "==");
  
  const handleTextColor = (color: string) => {
    insertMarkdown(`<span style="color: ${color};">`, "</span>");
    setColorPickerOpen(false);
  };
  
  const handleBackgroundColor = (color: string) => {
    insertMarkdown(`<span style="background-color: ${color}; padding: 2px 6px; border-radius: 3px;">`, "</span>");
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

  const handleClearFormatting = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const cleanText = selectedText
      .replace(/<[^>]*>/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      .replace(/==([^=]+)==/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/^\s*[-*]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/^>\s+/gm, '');

    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    handleChange(`${beforeText}${cleanText}${afterText}`);
  };

  const markdownToHtml = (markdown: string) => {
    let html = markdown;

    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded my-3 overflow-x-auto border"><code class="text-sm font-mono whitespace-pre">$1</code></pre>');
    
    html = html.replace(/<details>([\s\S]*?)<\/details>/gi, (match, content) => {
      const summaryMatch = content.match(/<summary[^>]*>(.*?)<\/summary>/i);
      const summary = summaryMatch ? summaryMatch[1] : 'Click to expand';
      const body = content.replace(/<summary[^>]*>.*?<\/summary>/i, '').trim();
      return `<details class="my-4 border rounded-lg overflow-hidden">
        <summary class="cursor-pointer bg-gray-50 dark:bg-gray-800 px-4 py-3 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 select-none">${summary}</summary>
        <div class="px-4 py-3 border-t">${body}</div>
      </details>`;
    });

    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>');
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-3 rounded shadow-sm" />');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline dark:text-blue-400 font-medium" target="_blank" rel="noopener">$1</a>');
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/\*([^\*]+?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>');
    html = html.replace(/==(.*?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-500 px-1 rounded">$1</mark>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-600 dark:text-red-400">$1</code>');
    html = html.replace(/^---$/gim, '<hr class="my-6 border-t-2" />');
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 pl-4 pr-4 py-2 italic my-3 rounded-r">$1</blockquote>');
    html = html.replace(/^- \[x\] (.*$)/gim, '<li class="flex items-start gap-2 my-1"><input type="checkbox" checked disabled class="mt-1 rounded" /> <span class="line-through text-gray-500">$1</span></li>');
    html = html.replace(/^- \[ \] (.*$)/gim, '<li class="flex items-start gap-2 my-1"><input type="checkbox" disabled class="mt-1 rounded" /> <span>$1</span></li>');
    html = html.replace(/^\- (.*$)/gim, '<li class="my-1">$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="my-1">$1</li>');
    
    html = html.replace(/((?:<li class="my-1">.*?<\/li>\n?)+)/g, (match) => {
      if (match.includes('flex items-start')) {
        return `<ul class="list-none space-y-1 my-3">${match}</ul>`;
      }
      return `<ul class="list-disc list-inside space-y-1 my-3 ml-4">${match}</ul>`;
    });

    const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g;
    html = html.replace(tableRegex, (match) => {
      const rows = match.trim().split('\n');
      const headers = rows[0].split('|').filter(c => c.trim()).map(h => h.trim());
      const dataRows = rows.slice(2);

      let tableHtml = '<table class="min-w-full border-collapse border border-gray-300 dark:border-gray-600 my-4 rounded-lg overflow-hidden"><thead class="bg-gray-100 dark:bg-gray-800"><tr>';
      headers.forEach(h => {
        tableHtml += `<th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold">${h}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';

      dataRows.forEach(row => {
        const cells = row.split('|').filter(c => c.trim()).map(c => c.trim());
        tableHtml += '<tr class="hover:bg-gray-50 dark:hover:bg-gray-800">';
        cells.forEach(cell => {
          tableHtml += `<td class="border border-gray-300 dark:border-gray-600 px-4 py-2">${cell}</td>`;
        });
        tableHtml += '</tr>';
      });

      tableHtml += '</tbody></table>';
      return tableHtml;
    });

    html = html.replace(/\n\n/g, '<br /><br />');
    html = html.replace(/\n(?!<)/g, '<br />');

    return html;
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border rounded-lg bg-muted/50 shadow-sm">
        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={disabled || historyIndex === 0}
          className="h-9 px-2.5"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={disabled || historyIndex === history.length - 1}
          className="h-9 px-2.5"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Heading Selector */}
        <Select onValueChange={(value) => handleHeading(parseInt(value))} disabled={disabled}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Paragraph</SelectItem>
            <SelectItem value="1">Heading 1</SelectItem>
            <SelectItem value="2">Heading 2</SelectItem>
            <SelectItem value="3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBold}
          disabled={disabled}
          className="h-9 px-2.5"
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
          className="h-9 px-2.5"
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
          className="h-9 px-2.5"
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
          className="h-9 px-2.5"
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
          className="h-9 px-2.5"
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
              className="h-9 px-2.5"
              title="Colors"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start" side="bottom">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="background">Background</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-3">
                <div className="grid grid-cols-8 gap-1.5">
                  {[
                    '#000000', '#374151', '#6b7280', '#9ca3af',
                    '#ef4444', '#f97316', '#f59e0b', '#eab308',
                    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
                    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
                    '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleTextColor(color)}
                      className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="background" className="space-y-3">
                <div className="grid grid-cols-8 gap-1.5">
                  {[
                    '#fef3c7', '#fed7aa', '#fee2e2', '#fce7f3',
                    '#e9d5ff', '#dbeafe', '#d1fae5', '#e5e7eb',
                    '#fbbf24', '#fb923c', '#f87171', '#f472b6',
                    '#c084fc', '#60a5fa', '#34d399', '#94a3b8',
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleBackgroundColor(color)}
                      className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 hover:scale-110 transition-all"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
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
          className="h-9 px-2.5"
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
          className="h-9 px-2.5"
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
          className="h-9 px-2.5"
          title="Checklist"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Insert Elements */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLink}
          disabled={disabled}
          className="h-9 px-2.5"
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImage}
          disabled={disabled}
          className="h-9 px-2.5"
          title="Image"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleTable}
          disabled={disabled}
          className="h-9 px-2.5"
          title="Table"
        >
          <Table className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCode}
          disabled={disabled}
          className="h-9 px-2.5"
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBlockquote}
          disabled={disabled}
          className="h-9 px-2.5"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Templates & Advanced */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setTemplateDialogOpen(true)}
          disabled={disabled}
          className="h-9 px-2.5"
          title={tc('templates')}
        >
          <Layout className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-9 px-2.5"
              title="Callouts"
            >
              <CircleAlert className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCallout("info")}
                className="justify-start gap-2"
              >
                <Info className="h-4 w-4 text-blue-500" /> {tc('callouts.info')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCallout("warning")}
                className="justify-start gap-2"
              >
                <CircleAlert className="h-4 w-4 text-yellow-500" /> {tc('callouts.warning')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCallout("success")}
                className="justify-start gap-2"
              >
                <CheckCircle className="h-4 w-4 text-green-500" /> {tc('callouts.success')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCallout("error")}
                className="justify-start gap-2"
              >
                <XCircle className="h-4 w-4 text-red-500" /> {tc('callouts.error')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAccordion}
          disabled={disabled}
          className="h-9 px-2.5"
          title="Accordion"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Alignment & Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAlignLeft}
          disabled={disabled}
          className="h-9 px-2.5"
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
          className="h-9 px-2.5"
          title="Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAlignRight}
          disabled={disabled}
          className="h-9 px-2.5"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClearFormatting}
          disabled={disabled}
          className="h-9 px-2.5"
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            {tc('visualEditor')}
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-2">
            <FileText className="h-4 w-4" />
            {tc('sourceCode')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-0">
          <div
            className={`border rounded-lg p-6 ${className} bg-background overflow-auto prose prose-sm max-w-none min-h-[400px] shadow-inner`}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(value) || `<p class="text-gray-400">${tc('editor.startTyping')}</p>` }}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-0">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || tc('editor.typeHere')}
            disabled={disabled}
            className={`${className} min-h-[400px] font-mono text-sm`}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link-text">Link Text</Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Click here"
              />
            </div>
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink} disabled={!linkText || !linkUrl}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Describe the image"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertImage} disabled={!imageUrl}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={accordionDialogOpen} onOpenChange={setAccordionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Accordion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="accordion-title">Title</Label>
              <Input
                id="accordion-title"
                value={accordionTitle}
                onChange={(e) => setAccordionTitle(e.target.value)}
                placeholder="Click to expand"
              />
            </div>
            <div>
              <Label htmlFor="accordion-content">Content</Label>
              <Textarea
                id="accordion-content"
                value={accordionContent}
                onChange={(e) => setAccordionContent(e.target.value)}
                placeholder="Hidden content"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccordionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertAccordion} disabled={!accordionTitle || !accordionContent}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="table-rows">Rows</Label>
              <Input
                id="table-rows"
                type="number"
                min="1"
                max="20"
                value={tableRows}
                onChange={(e) => setTableRows(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="table-cols">Columns</Label>
              <Input
                id="table-cols"
                type="number"
                min="1"
                max="10"
                value={tableCols}
                onChange={(e) => setTableCols(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTableDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertTable}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
            <DialogDescription>
              Select a pre-built template to quickly add structured content
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => insertTemplate("card")}
            >
              <Box className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Card</div>
                <div className="text-xs text-muted-foreground">Bordered content card</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => insertTemplate("twoColumn")}
            >
              <Columns className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Two Columns</div>
                <div className="text-xs text-muted-foreground">Side-by-side layout</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => insertTemplate("threeColumn")}
            >
              <Columns className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Three Columns</div>
                <div className="text-xs text-muted-foreground">Three-column grid</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => insertTemplate("hero")}
            >
              <Sparkles className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Hero Section</div>
                <div className="text-xs text-muted-foreground">Eye-catching header</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => insertTemplate("featureGrid")}
            >
              <Layout className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Feature Grid</div>
                <div className="text-xs text-muted-foreground">Showcase features</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => insertTemplate("timeline")}
            >
              <List className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Timeline</div>
                <div className="text-xs text-muted-foreground">Chronological events</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => insertTemplate("pricing")}
            >
              <Box className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Pricing Cards</div>
                <div className="text-xs text-muted-foreground">Three-tier pricing</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => insertTemplate("testimonial")}
            >
              <Quote className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Testimonial</div>
                <div className="text-xs text-muted-foreground">Customer quote</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => insertTemplate("faq")}
            >
              <ChevronDown className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">FAQ Section</div>
                <div className="text-xs text-muted-foreground">Collapsible Q&A</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}