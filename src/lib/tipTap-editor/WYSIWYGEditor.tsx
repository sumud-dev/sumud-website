"use client";

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { ListItem } from '@tiptap/extension-list-item';
import {Link} from '@tiptap/extension-link';
import {Image} from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import {TextAlign} from '@tiptap/extension-text-align';
import {Underline} from '@tiptap/extension-underline';
import {TextStyle} from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import {Highlight} from '@tiptap/extension-highlight';
import {TaskList} from '@tiptap/extension-task-list';
import {TaskItem} from '@tiptap/extension-task-item';
import { RawHtml } from './extensions/html-block';
import { Details, DetailsSummary } from './extensions/details';
import { EditorProps } from '../types/editor';
import { cn } from '@/src/lib/utils/utils';
import { useTranslations } from 'next-intl';

interface WYSIWYGEditorProps extends EditorProps {
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * Process content for editor initialization
 * Preserves HTML formatting and converts plain text newlines to proper HTML
 */
function normalizeContentToHTML(content: string): string {
  if (!content) return '';
  
  // If content contains HTML tags, return completely unchanged
  // This preserves all formatting including headings, paragraphs, line breaks, etc.
  if (/<\/?[a-z][\s\S]*>/i.test(content)) {
    return content;
  }
  
  // Only process plain text content (no HTML tags found)
  // Handle escaped newlines (\\n becomes \n)
  const cleaned = content.replace(/\\n/g, '\n');
  
  // Split by single or multiple newlines
  const lines = cleaned.split('\n');
  const result: string[] = [];
  let currentParagraph: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) {
      // Empty line indicates paragraph break
      if (currentParagraph.length > 0) {
        result.push(`<p>${currentParagraph.join('<br>')}</p>`);
        currentParagraph = [];
      }
      // Add empty paragraph for visual spacing
      result.push('<p><br></p>');
    } else {
      // Add line to current paragraph
      currentParagraph.push(trimmed);
    }
  }
  
  // Don't forget the last paragraph
  if (currentParagraph.length > 0) {
    result.push(`<p>${currentParagraph.join('<br>')}</p>`);
  }
  
  return result.filter(p => p !== '<p><br></p>' || result.length === 1).join('');
}

export const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  onFocus,
  onBlur,
}) => {
  const t = useTranslations('common');
  const translatedPlaceholder = placeholder || t('editor.startTyping');
  // Ensure value is always defined to prevent controlled/uncontrolled warning
  const controlledValue = value ?? '';
  
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // Disable list-related extensions from StarterKit to avoid conflicts
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      // Explicitly add list extensions with proper configuration
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-6 my-3',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-6 my-3',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'my-1',
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse w-full my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 px-4 py-2 font-semibold text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose pl-0',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      Details,
      DetailsSummary,
      RawHtml,
    ],
    content: normalizeContentToHTML(controlledValue), // ✅ Normalize content
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          'w-full min-h-[500px] p-4 rounded-lg border bg-background',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'prose prose-sm max-w-none',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Only emit if content has actually changed
      if (html !== controlledValue) {
        onChange(html);
      }
    },
    onFocus,
    onBlur,
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (!editor || !controlledValue) return;
    
    const currentHTML = editor.getHTML();
    
    // Normalize both for comparison (remove whitespace differences)
    const normalizeForComparison = (html: string) => {
      return html
        .replace(/>\s+</g, '><')  // Remove whitespace between tags
        .replace(/\s+/g, ' ')      // Normalize internal whitespace
        .trim();
    };
    
    const currentNormalized = normalizeForComparison(currentHTML);
    const newNormalized = normalizeForComparison(controlledValue);
    
    // Only update if content is genuinely different
    if (currentNormalized !== newNormalized) {
      const processedContent = normalizeContentToHTML(controlledValue);
      
      // Use setContent without emitting update to prevent infinite loops
      editor.commands.setContent(processedContent, { emitUpdate: false });
    }
  }, [controlledValue, editor]);

  // Return editor instance for parent component to access
  useEffect(() => {
    if (editor) {
      // Store editor instance on window for toolbar access
      (window as any).__tiptapEditor = editor;
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative w-full">
      {editor.isEmpty && (
        <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none select-none">
          {translatedPlaceholder}
        </div>
      )}
      <EditorContent editor={editor} />
      
      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }
        
        .ProseMirror h1 {
          @apply text-3xl font-bold mt-6 mb-4;
        }
        
        .ProseMirror h2 {
          @apply text-2xl font-bold mt-5 mb-3;
        }
        
        .ProseMirror h3 {
          @apply text-xl font-semibold mt-4 mb-2;
        }
        
        .ProseMirror h4 {
          @apply text-lg font-semibold mt-3 mb-2;
        }
        
        .ProseMirror p {
          @apply my-3 leading-7;
        }
        
        /* Regular bullet list */
        .ProseMirror ul:not([data-type="taskList"]) {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        
        /* Regular ordered list */
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        
        /* List items for regular lists */
        .ProseMirror ul:not([data-type="taskList"]) > li,
        .ProseMirror ol > li {
          list-style: inherit;
          margin: 0.25rem 0;
          padding-left: 0.25rem;
        }
        
        /* Nested lists */
        .ProseMirror ul:not([data-type="taskList"]) ul:not([data-type="taskList"]) {
          list-style-type: circle;
          margin: 0.5rem 0;
        }
        
        .ProseMirror ul:not([data-type="taskList"]) ul:not([data-type="taskList"]) ul:not([data-type="taskList"]) {
          list-style-type: square;
        }
        
        .ProseMirror blockquote {
          @apply border-l-4 border-primary pl-4 italic my-4;
        }
        
        .ProseMirror code {
          @apply bg-muted px-1.5 py-0.5 rounded text-sm font-mono;
        }
        
        .ProseMirror pre {
          @apply bg-muted p-4 rounded-lg my-4 overflow-x-auto;
        }
        
        .ProseMirror pre code {
          @apply bg-transparent p-0;
        }
        
        .ProseMirror a {
          @apply text-primary underline font-medium;
        }
        
        .ProseMirror img {
          @apply max-w-full h-auto rounded-lg my-4;
        }
        
        .ProseMirror hr {
          @apply my-6 border-t-2;
        }
        
        .ProseMirror table {
          @apply w-full border-collapse my-4;
        }
        
        .ProseMirror th {
          @apply border border-border bg-muted px-4 py-2 text-left font-semibold;
        }
        
        .ProseMirror td {
          @apply border border-border px-4 py-2;
        }
        
        /* Task lists */
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
          margin: 1rem 0;
        }
        
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin: 0.25rem 0;
        }
        
        .ProseMirror ul[data-type="taskList"] li > label {
          flex-shrink: 0;
          margin-top: 0.25rem;
        }
        
        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1;
        }
        
        /* Raw HTML blocks - preserve all styling and functionality */
        .ProseMirror div[data-raw-html] {
          @apply my-2;
        }
        
        .ProseMirror div[data-raw-html] * {
          all: revert;
        }
        
        /* Ensure details/summary elements work properly */
        .ProseMirror details {
          cursor: default;
        }
        
        .ProseMirror details summary {
          cursor: pointer;
          position: relative;
        }
        
        /* Add chevron icon via CSS - not editable */
        .ProseMirror details summary[data-has-chevron="true"]::after {
          content: '▼';
          margin-left: auto;
          font-size: 1.25rem;
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};