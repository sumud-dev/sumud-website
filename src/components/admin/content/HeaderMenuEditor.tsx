"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Save, Plus, Trash2, GripVertical, Loader2, ChevronDown, ChevronRight, X } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ImageUpload } from "@/src/components/ui/image-upload";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { toast } from "sonner";
import {
  getHeaderConfig,
  updateHeaderConfig,
  getAvailablePages,
  type HeaderConfig,
  type NavLink as ConfigNavLink,
  type Locale,
  type AvailablePage,
} from "@/src/actions/navigation.actions";

interface EditorNavLink {
  labelKey: string;
  label: string;
  href: string;
  children?: EditorNavLink[];
}

interface HeaderMenuEditorProps {
  locale: Locale;
  onSaveSuccess?: () => void;
}

const localeNames: Record<Locale, string> = {
  en: "English",
  fi: "Suomi",
};

// Helper to convert config NavLink to editor format
function configLinkToEditorLink(link: ConfigNavLink, locale: Locale): EditorNavLink {
  return {
    labelKey: link.labelKey,
    label: link.labels[locale] || "",
    href: link.href,
    children: link.children?.map(child => configLinkToEditorLink(child, locale)),
  };
}

function editorLinkToConfigLink(
  editorLink: EditorNavLink,
  existingLink: ConfigNavLink | undefined,
  locale: Locale
): ConfigNavLink {
  return {
    labelKey: editorLink.labelKey,
    labels: {
      en: locale === "en" ? editorLink.label : existingLink?.labels.en || "",
      fi: locale === "fi" ? editorLink.label : existingLink?.labels.fi || "",
    },
    href: editorLink.href,
    children: editorLink.children?.map((child, i) =>
      editorLinkToConfigLink(child, existingLink?.children?.[i], locale)
    ),
  };
}

export default function HeaderMenuEditor({ locale, onSaveSuccess }: HeaderMenuEditorProps) {
  const t = useTranslations("adminSettings.content");
  const [isLoading, setIsLoading] = React.useState(true);
  const [fullConfig, setFullConfig] = React.useState<HeaderConfig | null>(null);
  const [navItems, setNavItems] = React.useState<EditorNavLink[]>([]);
  const [siteName, setSiteName] = React.useState("");
  const [logo, setLogo] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [availablePages, setAvailablePages] = React.useState<AvailablePage[]>([]);
  const [expandedItems, setExpandedItems] = React.useState<Set<number>>(new Set());
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [subDragKey, setSubDragKey] = React.useState<{ parent: number; child: number } | null>(null);
  const [subDragOverIndex, setSubDragOverIndex] = React.useState<number | null>(null);

  // Load config and available pages on mount and when locale changes
  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [configResult, pagesResult] = await Promise.all([
          getHeaderConfig(),
          getAvailablePages(),
        ]);
        
        if (configResult.success) {
          const config = configResult.data;
          setFullConfig(config);
          setSiteName(config.siteName[locale] || "");
          setLogo(config.logo || "");
          setNavItems(config.navigationLinks.map(l => configLinkToEditorLink(l, locale)));
          setHasChanges(false);
        } else {
          toast.error(t("header.error.loadConfig"));
        }
        
        if (pagesResult.success) {
          setAvailablePages(pagesResult.data);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error(t("header.error.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [locale, t]);

  const handleAddLink = () => {
    setNavItems((prev) => [...prev, { labelKey: "", label: "", href: "" }]);
    setHasChanges(true);
  };

  const handleAddSubLink = (parentIndex: number) => {
    setNavItems((prev) =>
      prev.map((item, i) =>
        i === parentIndex
          ? { ...item, children: [...(item.children || []), { labelKey: "", label: "", href: "" }] }
          : item
      )
    );
    setExpandedItems((prev) => new Set([...prev, parentIndex]));
    setHasChanges(true);
  };

  const handleRemoveLink = (index: number) => {
    setNavItems((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleRemoveSubLink = (parentIndex: number, childIndex: number) => {
    setNavItems((prev) =>
      prev.map((item, i) =>
        i === parentIndex
          ? { ...item, children: item.children?.filter((_, ci) => ci !== childIndex) }
          : item
      )
    );
    setHasChanges(true);
  };

  const handleUpdateLink = (index: number, field: keyof EditorNavLink, value: string) => {
    setNavItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    setHasChanges(true);
  };

  const handleUpdateSubLink = (parentIndex: number, childIndex: number, field: keyof EditorNavLink, value: string) => {
    setNavItems((prev) =>
      prev.map((item, i) =>
        i === parentIndex
          ? {
              ...item,
              children: item.children?.map((child, ci) =>
                ci === childIndex ? { ...child, [field]: value } : child
              ),
            }
          : item
      )
    );
    setHasChanges(true);
  };

  const handleSelectPage = (index: number, pageSlug: string, isSubItem: boolean = false, parentIndex?: number) => {
    const page = availablePages.find(p => p.slug === pageSlug);
    if (!page) return;

    if (isSubItem && parentIndex !== undefined) {
      setNavItems((prev) =>
        prev.map((item, i) =>
          i === parentIndex
            ? {
                ...item,
                children: item.children?.map((child, ci) =>
                  ci === index
                    ? { ...child, labelKey: page.slug, label: page.title.replace(/ - Sumud$/, ''), href: page.path }
                    : child
                ),
              }
            : item
        )
      );
    } else {
      setNavItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? { ...item, labelKey: page.slug, label: page.title.replace(/ - Sumud$/, ''), href: page.path }
            : item
        )
      );
    }
    setHasChanges(true);
  };

  const handleDrop = (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    setNavItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    setHasChanges(true);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSubDrop = (parentIndex: number, dropChildIndex: number) => {
    if (!subDragKey || subDragKey.parent !== parentIndex || subDragKey.child === dropChildIndex) return;
    setNavItems((prev) =>
      prev.map((item, i) => {
        if (i !== parentIndex) return item;
        const children = [...(item.children || [])];
        const [moved] = children.splice(subDragKey.child, 1);
        children.splice(dropChildIndex, 0, moved);
        return { ...item, children };
      })
    );
    setHasChanges(true);
    setSubDragKey(null);
    setSubDragOverIndex(null);
  };

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!fullConfig) return;
    
    setIsSaving(true);
    try {
      const updatedConfig: Omit<HeaderConfig, 'updatedAt'> = {
        siteName: {
          ...fullConfig.siteName,
          [locale]: siteName,
        },
        logo,
        navigationLinks: navItems.map((link, i) =>
          editorLinkToConfigLink(link, fullConfig.navigationLinks[i], locale)
        ),
      };

      const result = await updateHeaderConfig(updatedConfig);
      
      if (result.success) {
        setFullConfig(result.data);
        toast.success(t("header.success", { locale: localeNames[locale] }));
        setHasChanges(false);
        onSaveSuccess?.();
      } else {
        toast.error(result.error || t("header.error.saveFailed"));
      }
    } catch (error) {
      console.error("Error saving header menu:", error);
      toast.error(t("header.error.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("header.branding.title")}</CardTitle>
          <CardDescription>
            {t("header.branding.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">{t("header.siteName.label")}</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => {
                setSiteName(e.target.value);
                setHasChanges(true);
              }}
              placeholder={t("header.siteName.placeholder")}
              className="max-w-md"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("header.logo.label")}</Label>
            <div className="space-y-3">
              {logo && (
                <div className="relative w-40 h-20 bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={logo}
                    alt={t("header.logo.alt")}
                    fill
                    className="object-contain"
                  />
                  <button
                    onClick={() => {
                      setLogo("");
                      setHasChanges(true);
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <ImageUpload
                value={logo}
                onChange={(url) => {
                  setLogo(url);
                  setHasChanges(true);
                }}
                folder="sumud/branding"
                aspectRatio="16/9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("header.navigation.title")}</CardTitle>
          <CardDescription>
            {t("header.navigation.description", { locale: localeNames[locale] })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Column Headers */}
          <div className="hidden md:grid grid-cols-4 gap-2 px-12 text-xs font-medium text-muted-foreground">
            <span>{t("header.navigation.columnPage")}</span>
            <span>{t("header.navigation.columnKey")}</span>
            <span>{t("header.navigation.columnLabel")}</span>
            <span>{t("header.navigation.columnPath")}</span>
          </div>
          <div className="space-y-3">
            {navItems.map((item, index) => (
              <div
                key={index}
                className={`space-y-2 transition-opacity ${dragIndex === index ? "opacity-40" : ""} ${dragOverIndex === index && dragIndex !== index ? "ring-2 ring-primary/50 rounded-lg" : ""}`}
                draggable
                onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDragIndex(index); }}
                onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index); }}
                onDrop={() => handleDrop(index)}
                onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
              >
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 pt-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                    {item.children && item.children.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpand(index)}
                        className="h-6 w-6"
                      >
                        {expandedItems.has(index) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Select
                        value={item.labelKey || "__custom__"}
                        onValueChange={(value) => {
                          if (value === "__custom__") {
                            handleUpdateLink(index, "labelKey", "");
                          } else {
                            handleSelectPage(index, value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("header.navigation.selectPage")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__custom__">{t("header.navigation.customLink")}</SelectItem>
                          {availablePages.map((page) => (
                            <SelectItem key={page.slug} value={page.slug}>
                              {page.title.replace(/ - Sumud$/, '')} ({page.path})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={item.labelKey}
                        onChange={(e) => handleUpdateLink(index, "labelKey", e.target.value)}
                        placeholder={t("header.navigation.placeholderKey")}
                        className="font-mono text-sm"
                      />
                      <Input
                        value={item.label}
                        onChange={(e) => handleUpdateLink(index, "label", e.target.value)}
                        placeholder={t("header.navigation.placeholderLabel", { locale: localeNames[locale] })}
                      />
                      <Input
                        value={item.href}
                        onChange={(e) => handleUpdateLink(index, "href", e.target.value)}
                        placeholder={t("header.navigation.placeholderPath")}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddSubLink(index)}
                      className="text-xs"
                      title={t("header.navigation.addSubTitle")}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {t("header.navigation.addSub")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveLink(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {/* Sub-menu items */}
                {item.children && item.children.length > 0 && expandedItems.has(index) && (
                  <div className="ml-10 space-y-2 border-l-2 border-muted pl-4">
                    {item.children.map((child, childIndex) => (
                      <div
                        key={childIndex}
                        className={`flex items-center gap-2 p-2 bg-muted/30 rounded-lg transition-opacity ${subDragKey?.parent === index && subDragKey?.child === childIndex ? "opacity-40" : ""} ${subDragOverIndex === childIndex && subDragKey?.child !== childIndex ? "ring-2 ring-primary/50" : ""}`}
                        draggable
                        onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setSubDragKey({ parent: index, child: childIndex }); }}
                        onDragOver={(e) => { e.preventDefault(); setSubDragOverIndex(childIndex); }}
                        onDrop={() => handleSubDrop(index, childIndex)}
                        onDragEnd={() => { setSubDragKey(null); setSubDragOverIndex(null); }}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0" />
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
                          <Select
                            value={child.labelKey || "__custom__"}
                            onValueChange={(value) => {
                              if (value === "__custom__") {
                                handleUpdateSubLink(index, childIndex, "labelKey", "");
                              } else {
                                handleSelectPage(childIndex, value, true, index);
                              }
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("header.navigation.selectPage")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__custom__">{t("header.navigation.customLink")}</SelectItem>
                              {availablePages.map((page) => (
                                <SelectItem key={page.slug} value={page.slug}>
                                  {page.title.replace(/ - Sumud$/, '')} ({page.path})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={child.labelKey}
                            onChange={(e) => handleUpdateSubLink(index, childIndex, "labelKey", e.target.value)}
                            placeholder={t("header.navigation.placeholderKey")}
                            className="font-mono text-sm"
                          />
                          <Input
                            value={child.label}
                            onChange={(e) => handleUpdateSubLink(index, childIndex, "label", e.target.value)}
                            placeholder={t("header.navigation.placeholderLabel", { locale: localeNames[locale] })}
                          />
                          <Input
                            value={child.href}
                            onChange={(e) => handleUpdateSubLink(index, childIndex, "href", e.target.value)}
                            placeholder={t("header.navigation.placeholderPath")}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSubLink(index, childIndex)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" onClick={handleAddLink} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("header.navigation.addLink")}
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4">
        {hasChanges && (
          <span className="text-sm text-muted-foreground">{t("header.unsaved")}</span>
        )}
        <Button onClick={handleSave} disabled={isSaving || !hasChanges} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t("header.save")}
        </Button>
      </div>
    </div>
  );
}
