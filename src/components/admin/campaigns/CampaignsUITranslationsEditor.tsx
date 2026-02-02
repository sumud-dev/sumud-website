"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { toast } from "sonner";
import {
  getTranslationsAction,
  upsertTranslationAction,
} from "@/src/actions/translations";
import type { UITranslation } from "@/src/lib/db/schema/translations";
import { Pencil, Save, Loader2, Languages, CheckCircle2, Eye, Edit3 } from "lucide-react";
import { CampaignsPagePreview } from "./CampaignsPagePreview";

// Helper to group keys by section prefix
function groupKeysBySection(keys: string[]) {
  const sectionMap = new Map<string, string[]>();
  
  keys.forEach(key => {
    const parts = key.split('.');
    const section = parts[0] || 'other';
    
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section)!.push(key);
  });
  
  return Array.from(sectionMap.entries()).map(([section, keys]) => ({
    section,
    keys: keys.sort(),
  }));
}

export function CampaignsUITranslationsEditor() {
  const t = useTranslations("adminSettings.campaigns.uiTranslationsEditor");
  const [translations, setTranslations] = useState<Record<string, UITranslation>>({});
  const [translationKeys, setTranslationKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [selectedLocale, setSelectedLocale] = useState<"en" | "fi">("en");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedView, setSelectedView] = useState<"preview" | "editor">("preview");
  const [highlightedSection, setHighlightedSection] = useState<string>("");
  const [formValues, setFormValues] = useState<{ en: string; fi: string }>({ en: "", fi: "" });

  useEffect(() => {
    loadTranslations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTranslations = async () => {
    setLoading(true);
    try {
      // Load both EN and FI translations
      const [enResult, fiResult] = await Promise.all([
        getTranslationsAction("en"),
        getTranslationsAction("fi"),
      ]);

      const translationsMap: Record<string, UITranslation> = {};
      const keysSet = new Set<string>();
      
      if (enResult.success && enResult.data) {
        enResult.data
          .filter((t) => t.namespace === "campaigns")
          .forEach((t) => {
            translationsMap[`${t.key}-en`] = t;
            keysSet.add(t.key);
          });
      }

      if (fiResult.success && fiResult.data) {
        fiResult.data
          .filter((t) => t.namespace === "campaigns")
          .forEach((t) => {
            translationsMap[`${t.key}-fi`] = t;
            keysSet.add(t.key);
          });
      }

      setTranslations(translationsMap);
      const sortedKeys = Array.from(keysSet).sort();
      setTranslationKeys(sortedKeys);
      
      // Set initial selected section
      if (sortedKeys.length > 0 && !selectedSection) {
        const firstSection = sortedKeys[0].split('.')[0] || 'other';
        setSelectedSection(firstSection);
      }
    } catch (error) {
      toast.error(t("loadFailed"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (key: string) => {
    const enTranslation = translations[`${key}-en`];
    const fiTranslation = translations[`${key}-fi`];
    
    setEditingKey(key);
    setFormValues({
      en: enTranslation?.value || "",
      fi: fiTranslation?.value || "",
    });
  };

  const handleSave = async () => {
    if (!editingKey) return;

    setSaving(editingKey);
    try {
      // Save both EN and FI translations
      const results = await Promise.all([
        upsertTranslationAction({
          namespace: "campaigns",
          key: editingKey,
          language: "en",
          value: formValues.en,
        }),
        upsertTranslationAction({
          namespace: "campaigns",
          key: editingKey,
          language: "fi",
          value: formValues.fi,
        }),
      ]);

      const allSuccess = results.every((r) => r.success);
      if (allSuccess) {
        toast.success(t("updateSuccess"));
        setEditingKey(null);
        loadTranslations();
      } else {
        const errors = results.filter((r) => !r.success).map((r) => r.error).join(", ");
        toast.error(t("updateError", { error: errors }));
      }
    } catch (error) {
      toast.error(t("saveFailed"));
      console.error(error);
    } finally {
      setSaving(null);
    }
  };

  const getTranslationValue = (key: string, locale: "en" | "fi") => {
    return translations[`${key}-${locale}`]?.value || "";
  };

  const handleSectionClick = (section: string) => {
    setSelectedSection(section);
    setSelectedView("editor");
    setHighlightedSection(section);
    // Clear highlight after animation
    setTimeout(() => setHighlightedSection(""), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sections = groupKeysBySection(translationKeys);

  return (
    <div className="space-y-6">
      {/* View Selector: Preview vs Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as "preview" | "editor")}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {t("viewTabs.preview")}
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                {t("viewTabs.editor")}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="mt-6">
              <CampaignsPagePreview 
                selectedLocale={selectedLocale}
                onSectionClick={handleSectionClick}
                highlightedSection={highlightedSection}
              />
            </TabsContent>
            
            <TabsContent value="editor" className="mt-6">
              {/* Locale Selector */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Languages className="h-4 w-4" />
                    {t("languageView")}
                  </CardTitle>
                  <CardDescription>
                    {t("languageViewDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedLocale} onValueChange={(v) => setSelectedLocale(v as "en" | "fi")}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                      <TabsTrigger value="en">{t("english")}</TabsTrigger>
                      <TabsTrigger value="fi">{t("finnish")}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Section Tabs */}
              {sections.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Translation Sections</CardTitle>
                    <CardDescription>
                      Browse translations by section
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={selectedSection} onValueChange={setSelectedSection}>
                      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(sections.length, 6)}, 1fr)` }}>
                        {sections.map((section) => (
                          <TabsTrigger key={section.section} value={section.section}>
                            {t(`sections.${section.section}`)}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Translations for Selected Section */}
              {sections.filter(section => section.section === selectedSection).map((section) => (
                <Card key={section.section}>
                  <CardHeader>
                    <CardTitle className="text-base">{t(`sections.${section.section}`)}</CardTitle>
                    <CardDescription>
                      {t("manageTranslationsFor", { section: t(`sections.${section.section}`).toLowerCase() })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {section.keys.map((key) => {
                        const enValue = getTranslationValue(key, "en");
                        const fiValue = getTranslationValue(key, "fi");
                        const currentValue = selectedLocale === "en" ? enValue : fiValue;
                        const isEditing = editingKey === key;
                        const isSaving = saving === key;
                        const hasTranslation = enValue && fiValue;

                        return (
                          <div key={key} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                    {key}
                                  </code>
                                  {hasTranslation && (
                                    <Badge variant="outline" className="gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      {t("bothLanguages")}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(key)}
                                disabled={isSaving}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                {t("edit")}
                              </Button>
                            </div>

                            {!isEditing && currentValue && (
                              <div className="bg-muted/50 rounded-md p-3">
                                <p className="text-sm font-medium">
                                  {selectedLocale === "en" ? t("english") : t("finnish")}:
                                </p>
                                <p className="text-sm mt-1">{currentValue}</p>
                              </div>
                            )}

                            {isEditing && (
                              <div className="space-y-4 pt-2 border-t">
                                <div className="space-y-2">
                                  <Label htmlFor={`${key}-en`}>{t("englishLabel")}</Label>
                                  <Textarea
                                    id={`${key}-en`}
                                    value={formValues.en}
                                    onChange={(e) => setFormValues({ ...formValues, en: e.target.value })}
                                    rows={3}
                                    className="font-mono text-sm"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`${key}-fi`}>{t("finnishLabel")}</Label>
                                  <Textarea
                                    id={`${key}-fi`}
                                    value={formValues.fi}
                                    onChange={(e) => setFormValues({ ...formValues, fi: e.target.value })}
                                    rows={3}
                                    className="font-mono text-sm"
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleSave}
                                    disabled={isSaving || !formValues.en || !formValues.fi}
                                    size="sm"
                                  >
                                    {isSaving ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t("saving")}
                                      </>
                                    ) : (
                                      <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {t("saveBothLanguages")}
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingKey(null)}
                                    disabled={isSaving}
                                    size="sm"
                                  >
                                    {t("cancel")}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
