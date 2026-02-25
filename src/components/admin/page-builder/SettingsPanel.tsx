'use client';

import React from 'react';
import { useEditor } from '@craftjs/core';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { ScrollArea, ScrollBar } from '@/src/components/ui/scroll-area';
import { Separator } from '@/src/components/ui/separator';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Trash2, Settings2, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PageSettingsPanelProps {
  pageId: string;
  language: 'en' | 'fi';
  status: 'draft' | 'published';
  onStatusChange: (status: 'draft' | 'published') => void;
  onTitleChange?: (title: string) => void;
  onSlugChange?: (slug: string) => void;
}

function PageSettingsPanel({ pageId, language, status, onStatusChange, onTitleChange, onSlugChange }: PageSettingsPanelProps) {
  const t = useTranslations('adminSettings.pageBuilder');
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  // Fetch page data and language-specific content
  const { data: page } = useQuery({
    queryKey: ['page', pageId, language],
    queryFn: async () => {
      const response = await fetch(`/api/pages/${pageId}?language=${language}`);
      if (!response.ok) throw new Error('Failed to fetch page');
      const result = await response.json();
      return result.data;
    },
  });

  // Update state when page data changes
  React.useEffect(() => {
    if (page) {
      setTitle(page.title || '');
      setSlug(page.slug || '');
    }
  }, [page]);



  const handleTitleChange = async (value: string) => {
    setTitle(value);
    
    // Notify parent of changes
    onTitleChange?.(value);
    
    // Update via main page endpoint
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: value }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update title');
      }
      
      // Invalidate cache to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['page', pageId, language] });
      toast.success('Title updated successfully');
    } catch (error) {
      console.error('Failed to update title:', error);
      toast.error('Failed to update title');
    }
  };

  const handleSlugChange = (value: string) => {
    // Clean slug: lowercase, alphanumeric, hyphens only
    const cleanedSlug = value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(cleanedSlug);
    
    // Notify parent of change
    onSlugChange?.(cleanedSlug);
  };

  const handleStatusChange = (value: 'draft' | 'published') => {
    onStatusChange(value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="page-title" className="wrap-break-word">
          {t('pageSettings.title') || 'Page Title'}
        </Label>
        <Input
          id="page-title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={t('pageSettings.titlePlaceholder') || 'Enter page title'}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="page-slug" className="wrap-break-word">
          {t('pageSettings.slug') || 'URL Slug'}
        </Label>
        <Input
          id="page-slug"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder={t('pageSettings.slugPlaceholder') || 'page-slug'}
          className="font-mono text-sm w-full"
        />
        <p className="text-xs text-muted-foreground wrap-break-word">
          {t('pageSettings.slugHint') || 'URL-friendly identifier'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="page-status" className="wrap-break-word">
          {t('pageSettings.status') || 'Status'}
        </Label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger id="page-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">{t('status.draft') || 'Draft'}</SelectItem>
            <SelectItem value="published">{t('status.published') || 'Published'}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface SettingsPanelProps {
  pageId: string;
  language: 'en' | 'fi';
  status: 'draft' | 'published';
  onStatusChange: (status: 'draft' | 'published') => void;
  onTitleChange?: (title: string) => void;
  onSlugChange?: (slug: string) => void;
  width?: string;
  enableHorizontalScroll?: boolean;
  defaultCollapsed?: boolean;
}

export function SettingsPanel({ 
  pageId, 
  language,
  status, 
  onStatusChange, 
  onTitleChange, 
  onSlugChange,
  width = 'w-80',
  enableHorizontalScroll = false,
  defaultCollapsed = false
}: SettingsPanelProps) {
  const t = useTranslations('adminSettings.pageBuilder');
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const { selected, actions } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').last();
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related?.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return { selected };
  });

  // Collapsed view
  if (isCollapsed) {
    return (
      <div className="w-12 bg-background border-l flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="h-8 w-8"
          title={t('settingsPanel.expand') || 'Expand Settings'}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="mt-4 flex flex-col gap-2 items-center">
          <FileText className="h-5 w-5 text-muted-foreground" />
          {selected && <Settings2 className="h-5 w-5 text-muted-foreground" />}
        </div>
      </div>
    );
  }

  return (
    <div className={`${width} bg-background border-l flex flex-col`}>
      {/* Toggle Button */}
      <div className="flex justify-end p-2 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="h-8 w-8"
          title={t('settingsPanel.collapse') || 'Collapse Settings'}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="h-full">
        <div className={enableHorizontalScroll ? '' : 'overflow-x-hidden'}>
          {/* Page Settings - Always visible at the top */}
          <Card className="border-0 rounded-none border-b">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg wrap-break-word">{t('settingsPanel.pageSettings') || 'Page Settings'}</CardTitle>
            </div>
            <CardDescription className="wrap-break-word">
                {t('settingsPanel.configurePageSettings') || 'Configure page title, URL, and status'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <PageSettingsPanel 
                pageId={pageId} 
                language={language}
                status={status} 
                onStatusChange={onStatusChange}
                onTitleChange={onTitleChange}
                onSlugChange={onSlugChange}
              />
            </CardContent>
          </Card>

          {/* Element Settings - Show when element is selected */}
          {selected && (
            <Card className="border-0 rounded-none">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Settings2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <CardTitle className="text-lg wrap-break-word truncate">{selected.name}</CardTitle>
                  </div>
                </div>
                <CardDescription className="wrap-break-word">
                  {t('settingsPanel.configureElement') || 'Configure the selected element settings'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {selected.settings && <selected.settings />}
                
                {selected.isDeletable && (
                  <>
                    <Separator />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => actions.delete(selected.id)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('settingsPanel.deleteElement') || 'Delete Element'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        {enableHorizontalScroll && <ScrollBar orientation="horizontal" />}
      </ScrollArea>
    </div>
  );
}