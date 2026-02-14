"use client";

import React, { useRef, useCallback, useEffect } from 'react';
import { EditorProps, TemplateType } from '@/src/lib/types/editor';
import { WYSIWYGEditor } from '@/src/lib/tipTap-editor/WYSIWYGEditor';
import { EditorToolbar } from '@/src/lib/tipTap-editor/EditorToolbar';
import { LinkDialog, ImageDialog, VideoDialog, TableDialog } from '@/src/lib/tipTap-editor/dialogs/editor-dialogs';
import { TemplateGallery } from './TemplateGallery';
import { TemplateEditorDialog } from '@/src/lib/tipTap-editor/dialogs/TemplateEditorDialog';
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
  const [activeTab, setActiveTab] = React.useState<'edit' | 'preview'>('edit');
  const t = useTranslations('common');
  const { dialogs, openDialog, closeDialog, updateDialog, resetDialog } = useEditorDialogs();
  const { addToHistory, undo, redo, canUndo, canRedo } = useEditorHistory(value);  
  // Get TipTap editor instance from window
  const getEditor = useCallback(() => {
    return (window as any).__tiptapEditor;
  }, []);

  // Add to history when content changes
  useEffect(() => {
    if (value) {
      addToHistory(value);
    }
  }, [value]);

  // Toolbar handlers using TipTap commands
  const handleBold = useCallback(() => {
    getEditor()?.chain().focus().toggleBold().run();
  }, [getEditor]);

  const handleItalic = useCallback(() => {
    getEditor()?.chain().focus().toggleItalic().run();
  }, [getEditor]);

  const handleUnderline = useCallback(() => {
    getEditor()?.chain().focus().toggleUnderline().run();
  }, [getEditor]);

  const handleStrikethrough = useCallback(() => {
    getEditor()?.chain().focus().toggleStrike().run();
  }, [getEditor]);

  const handleCode = useCallback(() => {
    getEditor()?.chain().focus().toggleCode().run();
  }, [getEditor]);
  
  const handleHighlight = useCallback(() => {
    getEditor()?.chain().focus().toggleHighlight({ color: '#fef08a' }).run();
  }, [getEditor]);
  
  const handleTextColor = useCallback((color: string) => {
    getEditor()?.chain().focus().setColor(color).run();
  }, [getEditor]);
  
  const handleBackgroundColor = useCallback((color: string) => {
    getEditor()?.chain().focus().toggleHighlight({ color }).run();
  }, [getEditor]);

  const handleHeading = useCallback((level: number) => {
    const editor = getEditor();
    if (!editor) return;
    
    if (level === 0) {
      // If level is 0, clear heading formatting and set as paragraph
      editor.chain().focus().setParagraph().run();
    } else {
      // Otherwise, set the heading level
      editor.chain().focus().setHeading({ level: level as 1 | 2 | 3 }).run();
    }
  }, [getEditor]);

  const handleAlignLeft = useCallback(() => {
    getEditor()?.chain().focus().setTextAlign('left').run();
  }, [getEditor]);

  const handleAlignCenter = useCallback(() => {
    getEditor()?.chain().focus().setTextAlign('center').run();
  }, [getEditor]);

  const handleAlignRight = useCallback(() => {
    getEditor()?.chain().focus().setTextAlign('right').run();
  }, [getEditor]);

  const handleAlignJustify = useCallback(() => {
    getEditor()?.chain().focus().setTextAlign('justify').run();
  }, [getEditor]);

  const handleBulletList = useCallback(() => {
    getEditor()?.chain().focus().toggleBulletList().run();
  }, [getEditor]);

  const handleNumberedList = useCallback(() => {
    getEditor()?.chain().focus().toggleOrderedList().run();
  }, [getEditor]);
  
  const handleTaskList = useCallback(() => {
    getEditor()?.chain().focus().toggleTaskList().run();
  }, [getEditor]);

  const handleIndent = useCallback(() => {
    getEditor()?.chain().focus().sinkListItem('listItem').run();
  }, [getEditor]);

  const handleOutdent = useCallback(() => {
    getEditor()?.chain().focus().liftListItem('listItem').run();
  }, [getEditor]);

  const handleLinkOpen = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);
    const href = editor.getAttributes('link').href;
    
    updateDialog('link', { text, url: href || '' });
    openDialog('link');
  }, [getEditor, updateDialog, openDialog]);

  const handleLinkInsert = useCallback(() => {
    const { url } = dialogs.link;
    const editor = getEditor();
    
    if (!editor) return;
    
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    
    resetDialog('link');
    closeDialog('link');
  }, [dialogs.link, getEditor, resetDialog, closeDialog]);

  const handleImageInsert = useCallback(() => {
    const { url, alt } = dialogs.image;
    getEditor()?.chain().focus().setImage({ src: url, alt }).run();
    resetDialog('image');
    closeDialog('image');
  }, [dialogs.image, getEditor, resetDialog, closeDialog]);

  const handleVideoInsert = useCallback(() => {
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
    
    // Insert as raw HTML to preserve iframe functionality
    getEditor()?.chain().focus().insertContent({
      type: 'rawHtml',
      attrs: {
        html: html,
      },
    }).run();
    
    resetDialog('video');
    closeDialog('video');
  }, [dialogs.video, getEditor, resetDialog, closeDialog]);

  const handleTableInsert = useCallback(() => {
    const { rows, cols } = dialogs.table;
    getEditor()?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    resetDialog('table');
    closeDialog('table');
  }, [dialogs.table, getEditor, resetDialog, closeDialog]);

  const handleQuote = useCallback(() => {
    getEditor()?.chain().focus().toggleBlockquote().run();
  }, [getEditor]);

  const handleDivider = useCallback(() => {
      getEditor()?.chain().focus().setHorizontalRule().run();
    }, [getEditor]);

    const handleTemplateSelect = useCallback((type: TemplateType) => {
    // Open the template editor dialog with the selected type
    updateDialog('templateEditor', { templateType: type });
    openDialog('templateEditor');
    closeDialog('template');
  }, [updateDialog, openDialog, closeDialog]);

  const handleTemplateInsert = useCallback((html: string) => {
    const editor = getEditor();
    
    if (editor && html) {
      // Always focus the editor first and insert at the end if no selection
      const { selection } = editor.state;
      const doc = editor.state.doc;
      const isEmpty = editor.isEmpty;
      
      // Focus the editor
      editor.commands.focus();
      
      // If editor is empty or no clear cursor position, go to end
      if (isEmpty) {
        editor.commands.focus('end');
      }
      
      // Insert as raw HTML node to preserve template styling and functionality
      editor.chain()
        .insertContent({
          type: 'rawHtml',
          attrs: {
            html: html,
          },
        })
        .run();
      
      // Keep focus after insertion
      setTimeout(() => {
        editor.commands.focus('end');
      }, 50);
    }
  }, [getEditor]);

  const handleUndo = useCallback(() => {
    const editor = getEditor();
    if (editor) {
      editor.chain().focus().undo().run();
    } else {
      const previousValue = undo();
      if (previousValue !== null) {
        onChange(previousValue);
      }
    }
  }, [getEditor, undo, onChange]);

  const handleRedo = useCallback(() => {
    const editor = getEditor();
    if (editor) {
      editor.chain().focus().redo().run();
    } else {
      const nextValue = redo();
      if (nextValue !== null) {
        onChange(nextValue);
      }
    }
  }, [getEditor, redo, onChange]);

  const handleClearFormatting = useCallback(() => {
    getEditor()?.chain().focus().clearNodes().unsetAllMarks().run();
  }, [getEditor]);

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
          <div className="flex-1 overflow-auto">
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
            className="prose prose-sm max-w-none 
              [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mt-6 [&>h1]:mb-4
              [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-5 [&>h2]:mb-3
              [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-4 [&>h3]:mb-2
              [&>p]:my-3 [&>p]:leading-7
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-3
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-3
              [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4"
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

      <TemplateEditorDialog
        isOpen={dialogs.templateEditor.isOpen}
        templateType={dialogs.templateEditor.templateType}
        onInsert={handleTemplateInsert}
        onClose={() => closeDialog('templateEditor')}
      />
    </div>
  );
};