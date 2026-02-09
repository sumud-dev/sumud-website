'use client';

import { useEditor } from '@craftjs/core';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Separator } from '@/src/components/ui/separator';
import { Trash2, Settings2 } from 'lucide-react';

export function SettingsPanel() {
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
        {selected ? (
          <Card className="border-0 rounded-none">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg">{selected.name}</CardTitle>
                </div>
              </div>
              <CardDescription>{t('settingsPanel.configureElement')}</CardDescription>
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
                    {t('settingsPanel.deleteElement')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 rounded-none">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">{t('settingsPanel.properties')}</CardTitle>
              <CardDescription>{t('settingsPanel.noElementSelected')}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <Settings2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">{t('settingsPanel.selectElementMessage')}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </ScrollArea>
    </div>
  );
}