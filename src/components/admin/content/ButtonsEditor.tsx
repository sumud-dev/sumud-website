"use client";

import * as React from "react";
import { Save, Plus, Trash2, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { toast } from "sonner";
import { getTranslationsByNamespaceAction, upsertTranslationAction } from "@/src/actions/translations";

type Locale = "en" | "fi";

interface ButtonItem {
  key: string;
  label: string;
}

interface ButtonSection {
  namespace: string;
  path: string;
  buttons: ButtonItem[];
  expanded?: boolean;
}

interface ButtonsEditorProps {
  locale: Locale;
  onSaveSuccess?: () => void;
}

// locale names come from translations

// Define button sections based on namespaces in the database
const BUTTON_SECTIONS: Record<string, { namespace: string; labelKey: string; descriptionKey: string }> = {
  "common": {
    namespace: "common",
    labelKey: "buttonSections.common.label",
    descriptionKey: "buttonSections.common.description"
  },
  "footer": {
    namespace: "footer",
    labelKey: "buttonSections.footer.label",
    descriptionKey: "buttonSections.footer.description"
  },
};

export default function ButtonsEditor({ locale, onSaveSuccess }: ButtonsEditorProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [buttonSections, setButtonSections] = React.useState<ButtonSection[]>([]);
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());
  const t = useTranslations("adminSettings.content");

  // Load buttons from database
  React.useEffect(() => {
    async function loadButtons() {
      setIsLoading(true);
      try {
        const sections: ButtonSection[] = [];
        
        // Load translations for each button section
        for (const [key, config] of Object.entries(BUTTON_SECTIONS)) {
          const result = await getTranslationsByNamespaceAction(config.namespace, locale);
          
          if (result.success && result.data) {
            // Filter only button-related keys
            const buttonKeys = result.data.filter(
              t => t.key.includes('button') || t.key.includes('btn') || t.key.includes('cta')
            );
            
            const buttons: ButtonItem[] = buttonKeys.map(t => ({
              key: t.key,
              label: t.value,
            }));
            
            sections.push({
              namespace: config.namespace,
              path: 'buttons',
              buttons,
              expanded: false,
            });
          }
        }
        
        setButtonSections(sections);
        setHasChanges(false);
        } catch (error) {
        console.error("Error loading buttons:", error);
        toast.error("Failed to load buttons configuration");
      } finally {
        setIsLoading(false);
      }
    }
    loadButtons();
  }, [locale]);

  const toggleSection = (index: number) => {
    const sectionKey = buttonSections[index].namespace;
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  const handleUpdateButton = (sectionIndex: number, buttonIndex: number, value: string) => {
    setButtonSections((prev) =>
      prev.map((section, si) =>
        si === sectionIndex
          ? {
              ...section,
              buttons: section.buttons.map((btn, bi) =>
                bi === buttonIndex ? { ...btn, label: value } : btn
              ),
            }
          : section
      )
    );
    setHasChanges(true);
  };

  const handleAddButton = (sectionIndex: number) => {
    setButtonSections((prev) =>
      prev.map((section, si) =>
        si === sectionIndex
          ? {
              ...section,
              buttons: [...section.buttons, { key: `newButton${Date.now()}`, label: "" }],
            }
          : section
      )
    );
    setHasChanges(true);
  };

  const handleRemoveButton = (sectionIndex: number, buttonIndex: number) => {
    setButtonSections((prev) =>
      prev.map((section, si) =>
        si === sectionIndex
          ? {
              ...section,
              buttons: section.buttons.filter((_, bi) => bi !== buttonIndex),
            }
          : section
      )
    );
    setHasChanges(true);
  };

  const handleUpdateButtonKey = (sectionIndex: number, buttonIndex: number, value: string) => {
    setButtonSections((prev) =>
      prev.map((section, si) =>
        si === sectionIndex
          ? {
              ...section,
              buttons: section.buttons.map((btn, bi) =>
                bi === buttonIndex ? { ...btn, key: value } : btn
              ),
            }
          : section
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save each button translation to the database
      for (const section of buttonSections) {
        for (const button of section.buttons) {
          const result = await upsertTranslationAction({
            key: button.key,
            value: button.label,
            language: locale,
            namespace: section.namespace,
          });
          
          if (!result.success) {
            throw new Error(`Failed to save button: ${button.key}`);
          }
        }
      }
      
      toast.success(t("savedForLocale", { locale: t(`locale.${locale}`) }));
      setHasChanges(false);
      onSaveSuccess?.();
    } catch (error) {
      console.error("Error saving buttons:", error);
      toast.error("Failed to save buttons. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t("buttons.titleWithLocale", { locale: t(`locale.${locale}`) })}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t("buttons.description")}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
              {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("buttons.save.saving")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t("buttons.save.default")}
            </>
          )}
        </Button>
      </div>

      {/* Button Sections */}
      <div className="space-y-4">
        {buttonSections.map((section, sectionIndex) => {
          const sectionKey = section.namespace;
          const sectionConfig = BUTTON_SECTIONS[sectionKey];
          const isExpanded = expandedSections.has(sectionKey);
          
          return (
            <Card key={sectionKey}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection(sectionIndex)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-base">
                        {sectionConfig ? t(sectionConfig.labelKey) : sectionKey}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {sectionConfig ? t(sectionConfig.descriptionKey) : ""}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {section.buttons.length} {t("buttons.section.buttonsCount")}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="space-y-4 pt-4">
                  {section.buttons.map((button, buttonIndex) => (
                    <div key={buttonIndex} className="flex gap-3 items-start">
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Button Key
                        </Label>
                        <Input
                          value={button.key}
                          onChange={(e) =>
                            handleUpdateButtonKey(sectionIndex, buttonIndex, e.target.value)
                          }
                          placeholder="Button key (e.g., takeAction)"
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Button Label
                        </Label>
                        <Input
                          value={button.label}
                          onChange={(e) =>
                            handleUpdateButton(sectionIndex, buttonIndex, e.target.value)
                          }
                          placeholder="Button text"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-6 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveButton(sectionIndex, buttonIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => handleAddButton(sectionIndex)}
                  >
                    <Plus className="h-4 w-4" />
                    {t("buttons.section.addButton")}
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Save Reminder */}
      {hasChanges && (
        <div className="sticky bottom-4 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-amber-800">
                {t("buttons.unsavedMessage")}
              </p>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Now
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
