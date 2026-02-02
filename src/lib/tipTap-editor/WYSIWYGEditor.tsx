"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { EditorProps } from '../types/editor';
import { cn } from '@/src/lib/utils/utils';

interface WYSIWYGEditorProps extends EditorProps {
  onFocus?: () => void;
  onBlur?: () => void;
}

export const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  disabled = false,
  className,
  onFocus,
  onBlur,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Update editor content when value changes externally
  useEffect(() => {
    if (!editorRef.current || isUpdatingRef.current) return;
    
    const editor = editorRef.current;
    if (editor.innerHTML !== value) {
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
      
      editor.innerHTML = value || '';
      
      // Restore selection if possible
      if (range && editor.contains(range.startContainer)) {
        try {
          selection?.removeAllRanges();
          selection?.addRange(range);
        } catch (e) {
          // Ignore errors from invalid ranges
        }
      }
    }
  }, [value]);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (!editorRef.current || disabled) return;
    
    isUpdatingRef.current = true;
    const html = editorRef.current.innerHTML;
    onChange(html);
    
    // Reset flag after a tick
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  }, [onChange, disabled]);

  // Handle paste events to clean up pasted content
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    const htmlData = clipboardData.getData('text/html');
    const textData = clipboardData.getData('text/plain');
    
    // Try to use HTML if available, otherwise use plain text
    const content = htmlData || textData;
    
    // Insert at cursor position
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const div = document.createElement('div');
      div.innerHTML = content;
      
      const fragment = document.createDocumentFragment();
      let node;
      while ((node = div.firstChild)) {
        fragment.appendChild(node);
      }
      
      range.insertNode(fragment);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      
      handleInput();
    }
  }, [handleInput]);

  // Show placeholder when empty
  const showPlaceholder = !value || value === '' || value === '<br>';

  return (
    <div className="relative w-full">
      {showPlaceholder && (
        <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none select-none">
          {placeholder}
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn(
          "w-full min-h-[500px] p-4 rounded-lg border bg-background",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "prose prose-sm max-w-none",
          "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4",
          "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3",
          "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2",
          "[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-2",
          "[&_p]:my-3 [&_p]:leading-7",
          "[&_ul]:my-3 [&_ul]:ml-6 [&_ul]:list-disc",
          "[&_ol]:my-3 [&_ol]:ml-6 [&_ol]:list-decimal",
          "[&_li]:my-1",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4",
          "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono",
          "[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:my-4 [&_pre]:overflow-x-auto",
          "[&_a]:text-primary [&_a]:underline [&_a]:font-medium",
          "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4",
          "[&_table]:w-full [&_table]:border-collapse [&_table]:my-4",
          "[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold",
          "[&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2",
          "[&_hr]:my-6 [&_hr]:border-t-2",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        suppressContentEditableWarning
      />
    </div>
  );
};
