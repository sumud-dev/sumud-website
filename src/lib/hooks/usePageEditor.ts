'use client';

import { useState, useCallback } from 'react';
import { useEditor } from '@craftjs/core';
import type { SerializedNodes } from '@craftjs/core';
import { updatePageContent, publishPage, updatePage } from '@/src/actions/pages.actions';
import { toast } from 'sonner';
import type { Language } from '@/src/lib/types/page';

interface UsePageEditorOptions {
  pageId: string;
  language: Language;
  status?: 'draft' | 'published';
  pageTitle?: string;
  pageSlug?: string;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  onPublishSuccess?: () => void;
  onPublishError?: (error: Error) => void;
}

interface UsePageEditorReturn {
  // State
  isSaving: boolean;
  isPublishing: boolean;
  lastSaved: Date | null;
  
  // Actions
  save: () => Promise<void>;
  publish: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  
  // Editor query
  query: ReturnType<typeof useEditor>['query'];
}

/**
 * Custom hook for managing page editor state and operations
 * Provides clean API for saving, publishing, and managing editor state
 */
export function usePageEditor({
  pageId,
  language,
  status,
  pageTitle,
  pageSlug,
  onSaveSuccess,
  onSaveError,
  onPublishSuccess,
  onPublishError,
}: UsePageEditorOptions): UsePageEditorReturn {
  const { query, actions } = useEditor();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  /**
   * Save current editor content
   * Automatically syncs to all languages
   */
  const save = useCallback(async () => {
    if (isSaving) {
      console.warn('[usePageEditor] Save already in progress');
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('[usePageEditor] Starting save...', { pageId, language });
      
      // Serialize editor content
      const json = query.serialize();
      const content = JSON.parse(json) as SerializedNodes;
      
      // Validate ROOT node exists
      if (!content || !('ROOT' in content)) {
        throw new Error('Invalid editor content: Missing ROOT node');
      }

      console.log('[usePageEditor] Content serialized:', {
        nodeCount: Object.keys(content).length,
        hasRoot: 'ROOT' in content,
      });

      // Save with automatic sync to all languages
      await updatePageContent(pageId, language, content, {
        syncAcrossLanguages: true,
        syncStrategy: 'full-override',
      });

      // Update page metadata if provided
      const updates: { status?: 'draft' | 'published'; title?: string; slug?: string } = {};
      
      if (status !== 'draft') {
        updates.status = 'draft';
      }
      
      if (pageTitle) {
        updates.title = pageTitle;
      }
      
      if (pageSlug) {
        updates.slug = pageSlug;
      }
      
      if (Object.keys(updates).length > 0) {
        await updatePage(pageId, updates);
      }

      setLastSaved(new Date());
      
      toast.success('Changes saved', {
        description: 'Layout synced across all languages',
      });

      onSaveSuccess?.();
      
      console.log('[usePageEditor] Save completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('[usePageEditor] Save failed:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      toast.error('Failed to save changes', {
        description: errorMessage,
      });

      onSaveError?.(error instanceof Error ? error : new Error(String(error)));
      
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [pageId, language, isSaving, query, status, pageTitle, pageSlug, onSaveSuccess, onSaveError]);

  /**
   * Publish the page
   */
  const publish = useCallback(async () => {
    if (isPublishing) {
      console.warn('[usePageEditor] Publish already in progress');
      return;
    }

    setIsPublishing(true);
    
    try {
      console.log('[usePageEditor] Publishing page...', { pageId });
      
      // First save the current content
      const json = query.serialize();
      const content = JSON.parse(json) as SerializedNodes;
      
      if (!content || !('ROOT' in content)) {
        throw new Error('Invalid editor content: Missing ROOT node');
      }

      await updatePageContent(pageId, language, content, {
        syncAcrossLanguages: true,
        syncStrategy: 'full-override',
      });

      // Update page metadata before publishing
      const updates: { title?: string; slug?: string } = {};
      
      if (pageTitle) {
        updates.title = pageTitle;
      }
      
      if (pageSlug) {
        updates.slug = pageSlug;
      }
      
      if (Object.keys(updates).length > 0) {
        await updatePage(pageId, updates);
      }

      // Then publish the page
      await publishPage(pageId);
      
      setLastSaved(new Date());
      
      toast.success('Page published', {
        description: 'Changes are now live on all language versions',
      });

      onPublishSuccess?.();
      
      console.log('[usePageEditor] Publish completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('[usePageEditor] Publish failed:', errorMessage);

      toast.error('Failed to publish page', {
        description: errorMessage,
      });

      onPublishError?.(error instanceof Error ? error : new Error(String(error)));
      
      throw error;
    } finally {
      setIsPublishing(false);
    }
  }, [pageId, language, isPublishing, query, pageTitle, pageSlug, onPublishSuccess, onPublishError]);

  /**
   * Undo last action
   */
  const undo = useCallback(() => {
    try {
      actions.history.undo();
      console.log('[usePageEditor] Undo executed');
    } catch (error) {
      console.error('[usePageEditor] Undo failed:', error);
      toast.error('Cannot undo');
    }
  }, [actions]);

  /**
   * Redo last undone action
   */
  const redo = useCallback(() => {
    try {
      actions.history.redo();
      console.log('[usePageEditor] Redo executed');
    } catch (error) {
      console.error('[usePageEditor] Redo failed:', error);
      toast.error('Cannot redo');
    }
  }, [actions]);

  return {
    // State
    isSaving,
    isPublishing,
    lastSaved,
    
    // Actions
    save,
    publish,
    undo,
    redo,
    
    // Editor query
    query,
  };
}