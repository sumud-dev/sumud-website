"use client";

import React, { useRef, useCallback } from 'react';
import { EditorProps, TemplateType } from '../types/editor';
import { WYSIWYGEditor } from '@/src/lib/tipTap-editor/WYSIWYGEditor';
import { EditorToolbar } from '@/src/lib/tipTap-editor/EditorToolbar';
import { LinkDialog, ImageDialog, VideoDialog, TableDialog } from '@/src/lib/tipTap-editor/dialogs/editor-dialogs';
import { TemplateGallery } from './TemplateGallery';
import { useEditorDialogs, useEditorHistory, useTemplateInsertion } from '@/src/lib/hooks/use-editor';
import { getTemplate } from '@/src/lib/tipTap-editor/templates/editor-templates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { useTranslations } from 'next-intl';

export const RichTextEditor: React.FC<EditorProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = React.useState<'edit' | 'preview'>('edit');
  const t = useTranslations('common');
  const { dialogs, openDialog, closeDialog, updateDialog, resetDialog } = useEditorDialogs();
  const { addToHistory, undo, redo, canUndo, canRedo } = useEditorHistory(value);
  const { insertTemplate, insertTable } = useTemplateInsertion();

  // Execute document command
  const execCommand = useCallback((command: string, value: string | boolean = false) => {
    document.execCommand(command, false, value as string);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      addToHistory(editorRef.current.innerHTML);
    }
  }, [onChange, addToHistory]);

  // Insert HTML at cursor
  const insertHTML = useCallback((html: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const div = document.createElement('div');
    div.innerHTML = html;

    const fragment = document.createDocumentFragment();
    let node;
    while ((node = div.firstChild)) {
      fragment.appendChild(node);
    }

    range.insertNode(fragment);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      addToHistory(editorRef.current.innerHTML);
    }
  }, [onChange, addToHistory]);

  // Toolbar handlers
  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleStrikethrough = () => execCommand('strikeThrough');
  const handleCode = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    const code = document.createElement('code');
    code.textContent = selectedText;
    code.style.backgroundColor = '#f3f4f6';
    code.style.padding = '2px 6px';
    code.style.borderRadius = '4px';
    code.style.fontFamily = 'monospace';
    code.style.fontSize = '0.9em';
    
    range.deleteContents();
    range.insertNode(code);
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      addToHistory(editorRef.current.innerHTML);
    }
  };
  
  const handleHighlight = () => {
    execCommand('hiliteColor', '#fef08a');
  };
  
  const handleTextColor = (color: string) => {
    execCommand('foreColor', color);
  };
  
  const handleBackgroundColor = (color: string) => {
    execCommand('hiliteColor', color);
  };

  const handleHeading = (level: 1 | 2 | 3) => {
    execCommand('formatBlock', `<h${level}>`);
  };

  const handleAlignLeft = () => execCommand('justifyLeft');
  const handleAlignCenter = () => execCommand('justifyCenter');
  const handleAlignRight = () => execCommand('justifyRight');
  const handleAlignJustify = () => execCommand('justifyFull');

  const handleBulletList = () => execCommand('insertUnorderedList');
  const handleNumberedList = () => execCommand('insertOrderedList');
  
  const handleTaskList = () => {
    const html = `
      <ul style="list-style: none; padding-left: 0;">
        <li style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" style="margin: 0;" />
          <span>Task item</span>
        </li>
      </ul>
    `;
    insertHTML(html);
  };

  const handleIndent = () => execCommand('indent');
  const handleOutdent = () => execCommand('outdent');

  const handleLinkOpen = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      updateDialog('link', { text: selection.toString() });
    }
    openDialog('link');
  };

  const handleLinkInsert = () => {
    const { text, url } = dialogs.link;
    const html = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline; font-weight: 500;">${text}</a>`;
    insertHTML(html);
    resetDialog('link');
    closeDialog('link');
  };

  const handleImageInsert = () => {
    const { url, alt } = dialogs.image;
    const html = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />`;
    insertHTML(html);
    resetDialog('image');
    closeDialog('image');
  };

  const handleVideoInsert = () => {
    const { url } = dialogs.video;
    let embedUrl = url;
    
    // Convert YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : new URLSearchParams(url.split('?')[1] || '').get('v');
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    
    // Convert Vimeo URLs
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      embedUrl = videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    
    const html = `
      <div style="position: relative; padding-bottom: 56.25%; height: 0; margin: 20px 0; border-radius: 8px; overflow: hidden;">
        <iframe 
          src="${embedUrl}" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
          allowfullscreen
        ></iframe>
      </div>
    `;
    insertHTML(html);
    resetDialog('video');
    closeDialog('video');
  };

  const handleTableInsert = () => {
    const { rows, cols } = dialogs.table;
    insertTable(rows, cols, insertHTML);
    resetDialog('table');
    closeDialog('table');
  };

  const handleQuote = () => {
    execCommand('formatBlock', '<blockquote>');
  };

  const handleDivider = () => {
    insertHTML('<hr style="margin: 24px 0; border: none; border-top: 2px solid #e5e7eb;" />');
  };

  const handleTemplateSelect = (type: TemplateType) => {
    insertTemplate(type, insertHTML);
  };

  const handleUndo = () => {
    const previousValue = undo();
    if (previousValue !== null) {
      onChange(previousValue);
    }
  };

  const handleRedo = () => {
    const nextValue = redo();
    if (nextValue !== null) {
      onChange(nextValue);
    }
  };

  const handleClearFormatting = () => {
    execCommand('removeFormat');
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <EditorToolbar
        onBold={handleBold}
        onItalic={handleItalic}
        onUnderline={handleUnderline}
        onStrikethrough={handleStrikethrough}
        onCode={handleCode}
        onHighlight={handleHighlight}
        onTextColor={handleTextColor}
        onBackgroundColor={handleBackgroundColor}
        onHeading={handleHeading}
        onAlignLeft={handleAlignLeft}
        onAlignCenter={handleAlignCenter}
        onAlignRight={handleAlignRight}
        onAlignJustify={handleAlignJustify}
        onBulletList={handleBulletList}
        onNumberedList={handleNumberedList}
        onTaskList={handleTaskList}
        onIndent={handleIndent}
        onOutdent={handleOutdent}
        onLink={handleLinkOpen}
        onImage={() => openDialog('image')}
        onVideo={() => openDialog('video')}
        onTable={() => openDialog('table')}
        onQuote={handleQuote}
        onDivider={handleDivider}
        onTemplate={() => openDialog('template')}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClearFormatting={handleClearFormatting}
        canUndo={canUndo}
        canRedo={canRedo}
        disabled={disabled}
      />

      {/* Tabbed View: Editor and Preview */}
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')} 
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="edit">{t('editorLabel')}</TabsTrigger>
          <TabsTrigger value="preview">{t('preview')}</TabsTrigger>
        </TabsList>

        <TabsContent 
          value="edit" 
          className="flex-1 m-4 mt-2 overflow-hidden border rounded-lg data-[state=active]:flex data-[state=active]:flex-col"
        >
          <div ref={editorRef} className="flex-1 overflow-auto">
            <WYSIWYGEditor
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
            />
          </div>
        </TabsContent>

        <TabsContent 
          value="preview" 
          className="flex-1 m-4 mt-2 overflow-auto border rounded-lg p-6 data-[state=active]:block bg-white"
        >
          <div
            className="
              [&>*]:block
              [&_h1]:block [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
              [&_h2]:block [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-5
              [&_h3]:block [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-4
              [&_p]:block [&_p]:mb-4 [&_p]:leading-7 [&_p]:whitespace-pre-wrap
              [&_div]:block
              [&_strong]:font-semibold
              [&_em]:italic
              [&_ul]:block [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
              [&_ol]:block [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
              [&_li]:block [&_li]:mb-1
              [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800
              [&_img]:block [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4
              [&_hr]:block [&_hr]:my-8 [&_hr]:border-t-2
              [&_table]:block [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
              [&_th]:table-cell [&_th]:bg-gray-100 [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-2
              [&_td]:table-cell [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-2
            "
            dangerouslySetInnerHTML={{ 
              __html: value || `<p class="text-gray-400">${t('editor.emptyPlaceholder')}</p>` 
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <LinkDialog
        isOpen={dialogs.link.isOpen}
        text={dialogs.link.text}
        url={dialogs.link.url}
        onTextChange={(text) => updateDialog('link', { text })}
        onUrlChange={(url) => updateDialog('link', { url })}
        onInsert={handleLinkInsert}
        onClose={() => closeDialog('link')}
      />

      <ImageDialog
        isOpen={dialogs.image.isOpen}
        url={dialogs.image.url}
        alt={dialogs.image.alt}
        onUrlChange={(url) => updateDialog('image', { url })}
        onAltChange={(alt) => updateDialog('image', { alt })}
        onInsert={handleImageInsert}
        onClose={() => closeDialog('image')}
      />

      <VideoDialog
        isOpen={dialogs.video.isOpen}
        url={dialogs.video.url}
        onUrlChange={(url) => updateDialog('video', { url })}
        onInsert={handleVideoInsert}
        onClose={() => closeDialog('video')}
      />

      <TableDialog
        isOpen={dialogs.table.isOpen}
        rows={dialogs.table.rows}
        cols={dialogs.table.cols}
        onRowsChange={(rows) => updateDialog('table', { rows })}
        onColsChange={(cols) => updateDialog('table', { cols })}
        onInsert={handleTableInsert}
        onClose={() => closeDialog('table')}
      />

      <TemplateGallery
        isOpen={dialogs.template.isOpen}
        onSelect={handleTemplateSelect}
        onClose={() => closeDialog('template')}
      />
    </div>
  );
};
