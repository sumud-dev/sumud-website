"use client";

import * as React from "react";
import { Save, Plus, Trash2, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { toast } from "sonner";

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

const localeNames: Record<Locale, string> = {
  en: "English",
  fi: "Suomi",
};

// Define button sections based on the messages JSON structure
const BUTTON_SECTIONS: Record<string, { namespace: string; path: string; label: string; description: string }> = {
  "common.buttons": {
    namespace: "common",
    path: "buttons",
    label: "Common Buttons",
    description: "Shared buttons used across the site"
  },
  "homepage.hero.buttons": {
    namespace: "homepage",
    path: "hero.buttons",
    label: "Homepage Hero Buttons",
    description: "Buttons in the hero section"
  },
  "homepage.events.buttons": {
    namespace: "homepage",
    path: "events.buttons",
    label: "Homepage Events Buttons",
    description: "Buttons in the events section"
  },
  "homepage.campaigns.buttons": {
    namespace: "homepage",
    path: "campaigns.buttons",
    label: "Homepage Campaign Buttons",
    description: "Buttons in the campaigns section"
  },
  "campaigns.buttons": {
    namespace: "campaigns",
    path: "buttons",
    label: "Campaigns Page Buttons",
    description: "Buttons on the campaigns page"
  },
  "eventsDetail.buttons": {
    namespace: "eventsDetail",
    path: "buttons",
    label: "Event Details Buttons",
    description: "Buttons on event detail pages"
  },
};

export default function ButtonsEditor({ locale, onSaveSuccess }: ButtonsEditorProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [buttonSections, setButtonSections] = React.useState<ButtonSection[]>([]);
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());

  // Load buttons from messages JSON
  React.useEffect(() => {
    async function loadButtons() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/content/messages/${locale}`);
        if (!response.ok) throw new Error("Failed to load messages");
        
        const data = await response.json();
        const messages = data.messages;
        
        // Extract buttons from each section
        const sections: ButtonSection[] = [];
        
        Object.entries(BUTTON_SECTIONS).forEach(([key, config]) => {
          const pathParts = config.path.split(".");
          let currentObj = messages[config.namespace];
          
          // Navigate to the buttons object
          for (const part of pathParts) {
            if (currentObj && typeof currentObj === "object") {
              currentObj = currentObj[part];
            } else {
              currentObj = null;
              break;
            }
          }
          
          // Extract button items
          if (currentObj && typeof currentObj === "object") {
            const buttons: ButtonItem[] = Object.entries(currentObj).map(([k, v]) => ({
              key: k,
              label: String(v),
            }));
            
            sections.push({
              namespace: config.namespace,
              path: config.path,
              buttons,
              expanded: false,
            });
          }
        });
        
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
    const sectionKey = `${buttonSections[index].namespace}.${buttonSections[index].path}`;
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
      // Load current messages
      const response = await fetch(`/api/admin/content/messages/${locale}`);
      if (!response.ok) throw new Error("Failed to load messages");
      
      const data = await response.json();
      const messages = data.messages;
      
      // Update button sections in messages
      buttonSections.forEach((section) => {
        const pathParts = section.path.split(".");
        let currentObj = messages[section.namespace];
        
        // Navigate to parent object
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!currentObj[pathParts[i]]) {
            currentObj[pathParts[i]] = {};
          }
          currentObj = currentObj[pathParts[i]];
        }
        
        // Update buttons
        const lastPart = pathParts[pathParts.length - 1];
        currentObj[lastPart] = section.buttons.reduce((acc, btn) => {
          acc[btn.key] = btn.label;
          return acc;
        }, {} as Record<string, string>);
      });
      
      // Save to server
      const saveResponse = await fetch(`/api/admin/content/buttons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages }),
      });
      
      if (!saveResponse.ok) throw new Error("Failed to save buttons");
      
      toast.success(`Buttons updated successfully for ${localeNames[locale]}`);
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
            Button Labels - {localeNames[locale]}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage button text across all sections of the site
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
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Button Sections */}
      <div className="space-y-4">
        {buttonSections.map((section, sectionIndex) => {
          const sectionKey = `${section.namespace}.${section.path}`;
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
                        {sectionConfig?.label || sectionKey}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {sectionConfig?.description || ""}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {section.buttons.length} buttons
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
                    Add Button
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
              You have unsaved changes. Don&apos;t forget to save before leaving.
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
