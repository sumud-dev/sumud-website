'use client';

import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/tooltip';
import { Undo2, Redo2, Save, Globe, Loader2, Check, ArrowLeft } from 'lucide-react';
import { usePageEditor } from '@/src/lib/hooks/usePageEditor';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { Language } from '@/src/lib/types/page';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

interface TopBarProps {
  pageId: string;
  language: Language;
}

/**
 * TopBar Component
 * Editor toolbar with save, publish, undo/redo actions
 * Uses usePageEditor hook for clean state management
 */
export function TopBar({ pageId, language }: TopBarProps) {
  const t = useTranslations('adminSettings.pageBuilder');
  const router = useRouter();
  
  // Fetch page metadata
  const { data: page } = useQuery({
    queryKey: ['page', pageId],
    queryFn: async () => {
      const response = await fetch(`/api/pages/${pageId}`);
      if (!response.ok) throw new Error('Failed to fetch page');
      const result = await response.json();
      return result.data;
    },
  });
  
  const {
    isSaving,
    isPublishing,
    lastSaved,
    save,
    publish,
    undo,
    redo,
  } = usePageEditor({
    pageId,
    language,
    onSaveSuccess: () => {
      console.log('[TopBar] Save successful');
    },
    onPublishSuccess: () => {
      console.log('[TopBar] Publish successful');
    },
  });

  const handleBackClick = () => {
    router.back();
  };

  return (
    <TooltipProvider>
      <div className="h-16 bg-background border-b flex items-center justify-between px-6">
      {/* Left Section: Title & Info */}
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('toolbar.back')}</TooltipContent>
        </Tooltip>
        
        <h1 className="font-semibold text-lg font-display">
          {page?.title || t('title')}
        </h1>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Badge variant="secondary" className="font-normal">
          <Globe className="h-3 w-3 mr-1" />
          {language.toUpperCase()}
        </Badge>
        
        {lastSaved && (
          <Badge variant="outline" className="font-normal text-xs">
            <Check className="h-3 w-3 mr-1" />
            {t('savedLabel')} {formatDistanceToNow(lastSaved, { addSuffix: true })}
          </Badge>
        )}
      </div>
      
      {/* Right Section: Actions */}
      <div className="flex items-center gap-2">
        {/* History Controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={isSaving || isPublishing}
            >
              <Undo2 className="h-4 w-4 mr-1" />
              {t('toolbar.undo')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('toolbar.undoTooltip')}</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={isSaving || isPublishing}
            >
              <Redo2 className="h-4 w-4 mr-1" />
              {t('toolbar.redo')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('toolbar.redoTooltip')}</TooltipContent>
        </Tooltip>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Save Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              onClick={save}
              disabled={isSaving || isPublishing}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  {t('toolbar.saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  {t('toolbar.save')}
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {t('toolbar.saveTooltip')}
          </TooltipContent>
        </Tooltip>
        
        {/* Publish Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              onClick={publish}
              disabled={isSaving || isPublishing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  {t('toolbar.publishing')}
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-1" />
                  {t('toolbar.publish')}
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {t('toolbar.publishTooltip')}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
    </TooltipProvider>
  );
}