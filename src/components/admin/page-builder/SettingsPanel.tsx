'use client';

import React from 'react';
import { useEditor } from '@craftjs/core';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Separator } from '@/src/components/ui/separator';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Trash2, Settings2, FileText } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PageSettingsPanelProps {
  pageId: string;
  status: 'draft' | 'published';
  onStatusChange: (status: 'draft' | 'published') => void;
  onTitleChange?: (title: string) => void;
  onSlugChange?: (slug: string) => void;
}

function PageSettingsPanel({ pageId, status, onStatusChange, onTitleChange, onSlugChange }: PageSettingsPanelProps) {
  const t = useTranslations('adminSettings.pageBuilder');
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  // Fetch page data
  const { data: page } = useQuery({
    queryKey: ['page', pageId],
    queryFn: async () => {
      const response = await fetch(`/api/pages/${pageId}`);
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



  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-generate slug from title
    const autoSlug = value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    setSlug(autoSlug);
    
    // Notify parent of changes
    onTitleChange?.(value);
    onSlugChange?.(autoSlug);
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
        <Label htmlFor="page-title">{t('pageSettings.title') || 'Page Title'}</Label>
        <Input
          id="page-title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={t('pageSettings.titlePlaceholder') || 'Enter page title'}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="page-slug">{t('pageSettings.slug') || 'URL Slug'}</Label>
        <Input
          id="page-slug"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder={t('pageSettings.slugPlaceholder') || 'page-slug'}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          {t('pageSettings.slugHint') || 'URL-friendly identifier'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="page-status">{t('pageSettings.status') || 'Status'}</Label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger id="page-status">
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

export function SettingsPanel({ pageId, status, onStatusChange, onTitleChange, onSlugChange }: { 
  pageId: string;
  status: 'draft' | 'published';
  onStatusChange: (status: 'draft' | 'published') => void;
  onTitleChange?: (title: string) => void;
  onSlugChange?: (slug: string) => void;
}) {
  const t = useTranslations('adminSettings.pageBuilder');
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

  return (
    <div className="w-80 bg-background border-l">
      <ScrollArea className="h-full">
        {/* Page Settings - Always visible at the top */}
        <Card className="border-0 rounded-none border-b">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">{t('settingsPanel.pageSettings') || 'Page Settings'}</CardTitle>
            </div>
            <CardDescription>{t('settingsPanel.configurePageSettings') || 'Configure page title, URL, and status'}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <PageSettingsPanel 
              pageId={pageId} 
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
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg">{selected.name}</CardTitle>
                </div>
              </div>
              <CardDescription>{t('settingsPanel.configureElement') || 'Configure the selected element settings'}</CardDescription>
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
      </ScrollArea>
    </div>
  );
}