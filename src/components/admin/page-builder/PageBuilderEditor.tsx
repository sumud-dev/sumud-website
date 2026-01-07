"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import {
  Card,
  CardContent,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  ArrowLeft,
  Save,
  Trash2,
  GripVertical,
  Type,
  Image,
  Columns,
  MousePointer,
  FormInput,
  Video,
  Minus,
  ChevronUp,
  ChevronDown,
  Sparkles,
  BarChart3,
  Grid3X3,
  Quote,
  Plus,
  Loader2,
  Newspaper,
  Calendar,
  Flag,
  Mail,
  LayoutTemplate,
  Heart,
  Globe,
  Users,
  Shield,
  Megaphone,
  BookOpen,
  HandshakeIcon,
  FileText,
  Check,
  Palette,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Checkbox } from "@/src/components/ui/checkbox";
import { toast } from "sonner";
import {
  useCreatePage,
  useUpdatePage,
} from "@/src/lib/hooks/use-pages";
import { TranslationStatusIndicator } from "@/src/components/admin/translation/TranslationStatusIndicator";
import { generateSlug } from "@/src/lib/utils/utils";
import type {
  PageBlock,
  PageBlockType,
  PageData,
  PageLocale,
} from "@/src/lib/types/page";
import { DEFAULT_BLOCK_CONTENT } from "@/src/lib/types/page";

// Supported locales for editing
const LOCALES = ['en', 'fi', 'ar'] as const;
type Locale = typeof LOCALES[number];

// Available icons for visual picker
const AVAILABLE_ICONS = [
  { name: 'Heart', icon: Heart, label: 'Heart' },
  { name: 'Globe', icon: Globe, label: 'Globe' },
  { name: 'Users', icon: Users, label: 'Users' },
  { name: 'Shield', icon: Shield, label: 'Shield' },
  { name: 'Megaphone', icon: Megaphone, label: 'Megaphone' },
  { name: 'BookOpen', icon: BookOpen, label: 'Book' },
  { name: 'HandshakeIcon', icon: HandshakeIcon, label: 'Handshake' },
  { name: 'FileText', icon: FileText, label: 'Document' },
  { name: 'Flag', icon: Flag, label: 'Flag' },
  { name: 'Sparkles', icon: Sparkles, label: 'Sparkles' },
  { name: 'BarChart3', icon: BarChart3, label: 'Chart' },
  { name: 'Grid3X3', icon: Grid3X3, label: 'Grid' },
] as const;

// Available colors for visual picker
const AVAILABLE_COLORS = [
  { value: 'bg-[#781D32]', label: 'Maroon', color: '#781D32' },
  { value: 'bg-[#55613C]', label: 'Olive', color: '#55613C' },
  { value: 'bg-[#3E442B]', label: 'Dark Green', color: '#3E442B' },
  { value: 'bg-[#2D5016]', label: 'Forest Green', color: '#2D5016' },
  { value: 'bg-[#C9184A]', label: 'Red', color: '#C9184A' },
  { value: 'bg-[#7209B7]', label: 'Purple', color: '#7209B7' },
  { value: 'bg-[#0077B6]', label: 'Blue', color: '#0077B6' },
  { value: 'bg-[#2A9D8F]', label: 'Teal', color: '#2A9D8F' },
] as const;

const blockTypes: { type: PageBlockType; label: string; icon: React.ElementType; category?: string }[] = [
  // Basic Blocks
  { type: "hero", label: "Hero Banner", icon: Sparkles, category: "Basic" },
  { type: "heading", label: "Heading", icon: Type, category: "Basic" },
  { type: "text", label: "Text Block", icon: Type, category: "Basic" },
  { type: "image", label: "Image", icon: Image, category: "Basic" },
  { type: "cta", label: "Call to Action", icon: MousePointer, category: "Basic" },
  { type: "divider", label: "Divider", icon: Minus, category: "Basic" },
  
  // Content Blocks
  { type: "stats", label: "Stats Section", icon: BarChart3, category: "Content" },
  { type: "campaigns-grid", label: "Campaigns Grid", icon: Grid3X3, category: "Content" },
  { type: "quote", label: "Quote Section", icon: Quote, category: "Content" },
  { type: "carousel", label: "Carousel", icon: Columns, category: "Content" },
  { type: "form", label: "Form Fields", icon: FormInput, category: "Content" },
  { type: "video", label: "Video", icon: Video, category: "Content" },
  
  // Section Layouts
  { type: "heritage-hero", label: "Heritage Hero", icon: LayoutTemplate, category: "Sections" },
  { type: "news-section", label: "News Section", icon: Newspaper, category: "Sections" },
  { type: "events-section", label: "Events Section", icon: Calendar, category: "Sections" },
  { type: "campaigns-section", label: "Campaigns Section", icon: Flag, category: "Sections" },
  { type: "newsletter-section", label: "Newsletter", icon: Mail, category: "Sections" },
  
  // Editable Page Sections (locale-nested content)
  { type: "page-hero", label: "Page Hero", icon: Sparkles, category: "Page Sections" },
  { type: "mission-section", label: "Mission Section", icon: Type, category: "Page Sections" },
  { type: "features-section", label: "Features Section", icon: Grid3X3, category: "Page Sections" },
  { type: "values-section", label: "Values Section", icon: BarChart3, category: "Page Sections" },
  { type: "engagement-section", label: "Engagement Section", icon: MousePointer, category: "Page Sections" },
  { type: "cta-section", label: "CTA Section", icon: Flag, category: "Page Sections" },
];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Get locales that have content in a block's locale-nested structure
 */
function getBlockAvailableLocales(block: PageBlock): Locale[] {
  const content = block.content as unknown as Record<string, unknown>;
  const locales: Locale[] = [];
  
  // Check main content wrapper
  const contentWrapper = content.content as Record<string, unknown> | undefined;
  if (contentWrapper) {
    LOCALES.forEach(locale => {
      if (contentWrapper[locale] && Object.keys(contentWrapper[locale] as object).length > 0) {
        locales.push(locale);
      }
    });
  }
  
  // Check header for section blocks
  const header = content.header as Record<string, unknown> | undefined;
  if (header) {
    LOCALES.forEach(locale => {
      if (header[locale] && Object.keys(header[locale] as object).length > 0 && !locales.includes(locale)) {
        locales.push(locale);
      }
    });
  }
  
  return locales.length > 0 ? locales : ['en'];
}

interface PageBuilderEditorProps {
  initialData?: PageData;
  isNew?: boolean;
}

export function PageBuilderEditor({ initialData, isNew = false }: PageBuilderEditorProps) {
  const router = useRouter();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();

  // Initialize state directly from props
  const initialTrans = initialData?.translations || {};
  const initialLangData = initialTrans.en || { title: "", description: "", blocks: [] };
  
  const [allTranslations, setAllTranslations] = useState<PageData["translations"]>(initialTrans);
  const [currentLang, setCurrentLang] = useState<PageLocale>("en");
  const [blocks, setBlocks] = useState<PageBlock[]>(initialLangData.blocks || []);
  const [pageTitle, setPageTitle] = useState(initialLangData.title || initialData?.slug || "");
  const [pageDescription, setPageDescription] = useState(initialLangData.description || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [path, setPath] = useState(initialData?.path || "/");
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Auto-generate slug and path when title changes (only for new pages and if not manually edited)
  const handlePageTitleChange = (newTitle: string) => {
    setPageTitle(newTitle);
    if (isNew && !slugManuallyEdited) {
      const generatedSlug = generateSlug(newTitle);
      setSlug(generatedSlug);
      setPath(`/${generatedSlug}`);
    }
  };

  const saveLangData = useCallback(() => {
    setAllTranslations((prev) => ({
      ...prev,
      [currentLang]: { title: pageTitle, description: pageDescription, blocks },
    }));
  }, [currentLang, pageTitle, pageDescription, blocks]);

  const handleLangChange = (newLang: PageLocale) => {
    saveLangData();
    setCurrentLang(newLang);
    const langData = allTranslations[newLang] || { title: "", description: "", blocks: [] };
    setPageTitle(langData.title || "");
    setPageDescription(langData.description || "");
    setBlocks(langData.blocks || []);
  };

  const addBlock = (type: PageBlockType) => {
    const newBlock: PageBlock = {
      id: generateId(),
      type,
      content: JSON.parse(JSON.stringify(DEFAULT_BLOCK_CONTENT[type])),
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: Record<string, unknown>) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content: content as unknown as PageBlock["content"] } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newBlocks = [...blocks];
    const draggedBlock = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(index, 0, draggedBlock);
    setBlocks(newBlocks);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Slide helpers for carousel
  const addSlide = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block && "slides" in block.content) {
      const slides = [...((block.content as { slides: Array<{ image: string; caption: string }> }).slides || []), { image: "", caption: "" }];
      updateBlock(blockId, { ...block.content, slides });
    }
  };

  const updateSlide = (blockId: string, index: number, field: string, value: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block && "slides" in block.content) {
      const slides = [...(block.content as { slides: Array<{ image: string; caption: string }> }).slides];
      slides[index] = { ...slides[index], [field]: value };
      updateBlock(blockId, { ...block.content, slides });
    }
  };

  const removeSlide = (blockId: string, index: number) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block && "slides" in block.content) {
      const slides = (block.content as { slides: Array<{ image: string; caption: string }> }).slides.filter((_, i) => i !== index);
      updateBlock(blockId, { ...block.content, slides });
    }
  };

  // Field helpers for form
  const addField = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block && "fields" in block.content) {
      const fields = [
        ...((block.content as { fields: Array<{ type: string; label: string; placeholder: string; required: boolean }> }).fields || []),
        { type: "text", label: "", placeholder: "", required: false },
      ];
      updateBlock(blockId, { ...block.content, fields });
    }
  };

  const updateField = (blockId: string, index: number, field: string, value: string | boolean) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block && "fields" in block.content) {
      const fields = [...(block.content as { fields: Array<{ type: string; label: string; placeholder: string; required: boolean }> }).fields];
      fields[index] = { ...fields[index], [field]: value };
      updateBlock(blockId, { ...block.content, fields });
    }
  };

  const removeField = (blockId: string, index: number) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block && "fields" in block.content) {
      const fields = (block.content as { fields: Array<{ type: string; label: string; placeholder: string; required: boolean }> }).fields.filter((_, i) => i !== index);
      updateBlock(blockId, { ...block.content, fields });
    }
  };

  const handleSave = async () => {
    const finalTranslations = {
      ...allTranslations,
      [currentLang]: { title: pageTitle, description: pageDescription, blocks },
    };

    const finalSlug = slug || generateSlug(pageTitle);
    const finalPath = path || `/${finalSlug}`;

    try {
      if (isNew) {
        await createPage.mutateAsync({
          slug: finalSlug,
          path: finalPath,
          status,
          translations: finalTranslations,
        });
        toast.success("Page created successfully");
        router.push("/en/admin/page-builder");
      } else {
        await updatePage.mutateAsync({
          slug: initialData!.slug,
          data: {
            translations: finalTranslations,
            status,
            path: finalPath,
          },
        });
        toast.success("Page updated successfully");
        router.push("/en/admin/page-builder");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save page");
    }
  };

  const isSaving = createPage.isPending || updatePage.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/en/admin/page-builder")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Pages
          </Button>
          <h1 className="text-3xl font-display font-bold">
            {isNew ? "Create New Page" : `Edit: ${initialLangData.title || initialData?.slug}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Build your page with blocks below.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" /> Save Page
        </Button>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="settings">Page Settings</TabsTrigger>
          <TabsTrigger value="blocks">Page Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Page Title</Label>
                  <Input
                    value={pageTitle}
                    onChange={(e) => handlePageTitleChange(e.target.value)}
                    placeholder="Enter page title"
                  />
                </div>
                <div>
                  <Label>URL Path</Label>
                  <Input
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    className="font-mono"
                    placeholder="/page-path"
                  />
                </div>
              </div>
              <div>
                <Label>Slug (URL identifier)</Label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="font-mono"
                  placeholder="page-slug"
                  disabled={!isNew}
                />
                {!isNew && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Slug cannot be changed after creation
                  </p>
                )}
                {isNew && slug && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Page will be accessible at: <span className="font-mono text-foreground">/p/{slug}</span>
                  </p>
                )}
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                  placeholder="Page description for SEO"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Language</Label>
                  <Select value={currentLang} onValueChange={(v) => handleLangChange(v as PageLocale)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="fi">Suomi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocks" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg mb-4">
                {blockTypes.map((bt) => (
                  <Button
                    key={bt.type}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => addBlock(bt.type)}
                  >
                    <bt.icon className="h-3 w-3" /> {bt.label}
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                {blocks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No blocks yet. Add blocks above to build your page.
                  </p>
                ) : (
                  blocks.map((block, idx) => (
                    <Card
                      key={block.id}
                      className={`p-4 ${draggedIndex === idx ? "opacity-50 border-primary" : ""}`}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-1">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveBlock(idx, "up")}
                            disabled={idx === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveBlock(idx, "down")}
                            disabled={idx === blocks.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{block.type}</Badge>
                              {/* Show translation status for blocks with locale-nested content */}
                              {['page-hero', 'mission-section', 'features-section', 'values-section', 'engagement-section', 'cta-section'].includes(block.type) && (
                                <TranslationStatusIndicator
                                  meta={block.meta}
                                  availableLocales={getBlockAvailableLocales(block)}
                                  compact
                                />
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBlock(block.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          <BlockEditor
                            block={block}
                            onUpdate={(content) => updateBlock(block.id, content)}
                            onAddSlide={() => addSlide(block.id)}
                            onUpdateSlide={(index, field, value) =>
                              updateSlide(block.id, index, field, value)
                            }
                            onRemoveSlide={(index) => removeSlide(block.id, index)}
                            onAddField={() => addField(block.id)}
                            onUpdateField={(index, field, value) =>
                              updateField(block.id, index, field, value)
                            }
                            onRemoveField={(index) => removeField(block.id, index)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ====================================================
// Locale-Nested Content Editor Components
// ====================================================

interface FieldConfig {
  key: string;
  label: string;
  type: 'input' | 'textarea';
}

interface LocaleNestedEditorProps {
  content: Record<string, unknown>;
  onUpdate: (content: Record<string, unknown>) => void;
  fields: FieldConfig[];
  extraFields?: React.ReactNode;
}

/**
 * Editor for blocks with simple locale-nested content structure:
 * { content: { en: { title, description }, fi: {...}, ar: {...} } }
 */
function LocaleNestedEditor({ content, onUpdate, fields, extraFields }: LocaleNestedEditorProps) {
  const [activeLocale, setActiveLocale] = useState<Locale>('en');
  
  const localeContent = (content.content as Record<string, Record<string, string>>) || {};
  
  const updateLocaleField = (locale: Locale, field: string, value: string) => {
    const newContent = {
      ...content,
      content: {
        ...localeContent,
        [locale]: {
          ...localeContent[locale],
          [field]: value,
        },
      },
    };
    onUpdate(newContent);
  };

  return (
    <div className="space-y-4">
      {extraFields}
      
      <div className="border rounded-lg p-3 space-y-3">
        <div className="flex gap-1">
          {LOCALES.map((locale) => (
            <Button
              key={locale}
              variant={activeLocale === locale ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveLocale(locale)}
              className="uppercase text-xs"
            >
              {locale}
            </Button>
          ))}
        </div>
        
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label className="text-sm">{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  value={localeContent[activeLocale]?.[field.key] || ''}
                  onChange={(e) => updateLocaleField(activeLocale, field.key, e.target.value)}
                  placeholder={`${field.label} (${activeLocale.toUpperCase()})`}
                  rows={3}
                />
              ) : (
                <Input
                  value={localeContent[activeLocale]?.[field.key] || ''}
                  onChange={(e) => updateLocaleField(activeLocale, field.key, e.target.value)}
                  placeholder={`${field.label} (${activeLocale.toUpperCase()})`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface LocaleNestedItemsEditorProps {
  content: Record<string, unknown>;
  onUpdate: (content: Record<string, unknown>) => void;
  headerFields: FieldConfig[];
  itemFields: FieldConfig[];
  itemExtraFields?: string[];
}

/**
 * Editor for blocks with header and items array, each with locale-nested content:
 * { header: { en: {...}, fi: {...} }, items: [{ key, icon, content: { en: {...}, ... }}] }
 */
function LocaleNestedItemsEditor({ 
  content, 
  onUpdate, 
  headerFields, 
  itemFields,
  itemExtraFields = [],
}: LocaleNestedItemsEditorProps) {
  const [activeLocale, setActiveLocale] = useState<Locale>('en');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));
  
  const headerContent = (content.header as Record<string, Record<string, string>>) || {};
  const items = (content.items as Array<Record<string, unknown>>) || [];
  
  const updateHeaderField = (locale: Locale, field: string, value: string) => {
    const newContent = {
      ...content,
      header: {
        ...headerContent,
        [locale]: {
          ...headerContent[locale],
          [field]: value,
        },
      },
    };
    onUpdate(newContent);
  };

  const updateItemField = (index: number, locale: Locale, field: string, value: string) => {
    const newItems = [...items];
    const item = newItems[index];
    const itemContent = (item.content as Record<string, Record<string, string>>) || {};
    
    newItems[index] = {
      ...item,
      content: {
        ...itemContent,
        [locale]: {
          ...itemContent[locale],
          [field]: value,
        },
      },
    };
    
    onUpdate({ ...content, items: newItems });
  };

  const updateItemExtra = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdate({ ...content, items: newItems });
  };

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const addItem = () => {
    const newItem: Record<string, unknown> = {
      key: `item-${Date.now()}`,
      content: {
        en: {},
        fi: {},
        ar: {},
      },
    };
    itemExtraFields.forEach(field => {
      newItem[field] = '';
    });
    onUpdate({ ...content, items: [...items, newItem] });
    setExpandedItems(new Set([...expandedItems, items.length]));
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onUpdate({ ...content, items: newItems });
  };

  return (
    <div className="space-y-4">
      {/* Locale Tabs */}
      <div className="flex gap-1">
        {LOCALES.map((locale) => (
          <Button
            key={locale}
            variant={activeLocale === locale ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveLocale(locale)}
            className="uppercase text-xs"
          >
            {locale}
          </Button>
        ))}
      </div>

      {/* Header Section */}
      <div className="border rounded-lg p-3 space-y-3">
        <Label className="text-sm font-medium">Section Header</Label>
        {headerFields.map((field) => (
          <div key={field.key} className="space-y-1">
            <Label className="text-xs text-muted-foreground">{field.label}</Label>
            {field.type === 'textarea' ? (
              <Textarea
                value={headerContent[activeLocale]?.[field.key] || ''}
                onChange={(e) => updateHeaderField(activeLocale, field.key, e.target.value)}
                placeholder={`${field.label} (${activeLocale.toUpperCase()})`}
                rows={2}
              />
            ) : (
              <Input
                value={headerContent[activeLocale]?.[field.key] || ''}
                onChange={(e) => updateHeaderField(activeLocale, field.key, e.target.value)}
                placeholder={`${field.label} (${activeLocale.toUpperCase()})`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Items Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Items ({items.length})</Label>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </div>
        
        {items.map((item, index) => {
          const itemContent = (item.content as Record<string, Record<string, string>>) || {};
          const isExpanded = expandedItems.has(index);
          
          return (
            <div key={item.key as string || index} className="border rounded-lg overflow-hidden">
              <div 
                className="flex items-center justify-between p-2 bg-muted/30 cursor-pointer"
                onClick={() => toggleItem(index)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {itemContent.en?.title || `Item ${index + 1}`}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); removeItem(index); }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
              
              {isExpanded && (
                <div className="p-3 space-y-3">
                  {/* Extra fields (icon, color, href) */}
                  {itemExtraFields.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {itemExtraFields.map((field) => (
                        <div key={field} className="space-y-1">
                          <Label className="text-xs capitalize">{field}</Label>
                          {field === 'icon' ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-start gap-2 h-9">
                                  {(() => {
                                    const selectedIcon = AVAILABLE_ICONS.find(i => i.name === (item[field] as string));
                                    const IconComponent = selectedIcon?.icon;
                                    return IconComponent ? (
                                      <><IconComponent className="h-4 w-4" /> {selectedIcon.label}</>
                                    ) : (
                                      <span className="text-muted-foreground">Select icon...</span>
                                    );
                                  })()}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-64 p-2" align="start">
                                <div className="grid grid-cols-4 gap-1">
                                  {AVAILABLE_ICONS.map(({ name, icon: IconComponent, label }) => (
                                    <Button
                                      key={name}
                                      variant={(item[field] as string) === name ? "default" : "ghost"}
                                      size="sm"
                                      className="h-12 flex flex-col gap-1"
                                      onClick={() => updateItemExtra(index, field, name)}
                                    >
                                      <IconComponent className="h-4 w-4" />
                                      <span className="text-[10px]">{label}</span>
                                    </Button>
                                  ))}
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : field === 'color' ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-start gap-2 h-9">
                                  {(() => {
                                    const selectedColor = AVAILABLE_COLORS.find(c => c.value === (item[field] as string));
                                    return selectedColor ? (
                                      <>
                                        <div className="w-4 h-4 rounded border" style={{ backgroundColor: selectedColor.color }} />
                                        {selectedColor.label}
                                      </>
                                    ) : (
                                      <>
                                        <Palette className="h-4 w-4" />
                                        <span className="text-muted-foreground">Select color...</span>
                                      </>
                                    );
                                  })()}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-80 p-3" align="start">
                                <div className="grid grid-cols-2 gap-2">
                                  {AVAILABLE_COLORS.map(({ value, label, color }) => (
                                    <Button
                                      key={value}
                                      variant={(item[field] as string) === value ? "default" : "outline"}
                                      size="sm"
                                      className="justify-start gap-2 h-auto py-2.5 px-3"
                                      onClick={() => updateItemExtra(index, field, value)}
                                    >
                                      <div className="w-5 h-5 rounded border shrink-0" style={{ backgroundColor: color }} />
                                      <span className="text-xs flex-1 text-left">{label}</span>
                                      {(item[field] as string) === value && <Check className="h-3 w-3 shrink-0" />}
                                    </Button>
                                  ))}
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Input
                              value={(item[field] as string) || ''}
                              onChange={(e) => updateItemExtra(index, field, e.target.value)}
                              placeholder={field === 'href' ? '/path' : ''}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Locale content fields */}
                  {itemFields.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{field.label}</Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          value={itemContent[activeLocale]?.[field.key] || ''}
                          onChange={(e) => updateItemField(index, activeLocale, field.key, e.target.value)}
                          placeholder={`${field.label} (${activeLocale.toUpperCase()})`}
                          rows={2}
                        />
                      ) : (
                        <Input
                          value={itemContent[activeLocale]?.[field.key] || ''}
                          onChange={(e) => updateItemField(index, activeLocale, field.key, e.target.value)}
                          placeholder={`${field.label} (${activeLocale.toUpperCase()})`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Block Editor Component
interface BlockEditorProps {
  block: PageBlock;
  onUpdate: (content: Record<string, unknown>) => void;
  onAddSlide: () => void;
  onUpdateSlide: (index: number, field: string, value: string) => void;
  onRemoveSlide: (index: number) => void;
  onAddField: () => void;
  onUpdateField: (index: number, field: string, value: string | boolean) => void;
  onRemoveField: (index: number) => void;
}

function BlockEditor({
  block,
  onUpdate,
  onAddSlide,
  onUpdateSlide,
  onRemoveSlide,
  onAddField,
  onUpdateField,
  onRemoveField,
}: BlockEditorProps) {
  const content = block.content as unknown as Record<string, unknown>;

  switch (block.type) {
    case "heading":
      return (
        <div className="grid grid-cols-4 gap-2">
          <Input
            className="col-span-3"
            value={(content.text as string) || ""}
            onChange={(e) => onUpdate({ ...content, text: e.target.value })}
            placeholder="Heading text"
          />
          <Select
            value={(content.level as string) || "h2"}
            onValueChange={(v) => onUpdate({ ...content, level: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="h1">H1</SelectItem>
              <SelectItem value="h2">H2</SelectItem>
              <SelectItem value="h3">H3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

    case "text":
      return (
        <Textarea
          value={(content.text as string) || ""}
          onChange={(e) => onUpdate({ ...content, text: e.target.value })}
          placeholder="Text content"
        />
      );

    case "image":
      return (
        <div className="space-y-2">
          <Input
            value={(content.src as string) || ""}
            onChange={(e) => onUpdate({ ...content, src: e.target.value })}
            placeholder="Image URL"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={(content.alt as string) || ""}
              onChange={(e) => onUpdate({ ...content, alt: e.target.value })}
              placeholder="Alt text"
            />
            <Input
              value={(content.caption as string) || ""}
              onChange={(e) => onUpdate({ ...content, caption: e.target.value })}
              placeholder="Caption"
            />
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="grid grid-cols-3 gap-2">
          <Input
            value={(content.text as string) || ""}
            onChange={(e) => onUpdate({ ...content, text: e.target.value })}
            placeholder="Button text"
          />
          <Input
            value={(content.url as string) || ""}
            onChange={(e) => onUpdate({ ...content, url: e.target.value })}
            placeholder="Link URL"
          />
          <Select
            value={(content.style as string) || "primary"}
            onValueChange={(v) => onUpdate({ ...content, style: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

    case "video":
      return (
        <div className="space-y-2">
          <Input
            value={(content.url as string) || ""}
            onChange={(e) => onUpdate({ ...content, url: e.target.value })}
            placeholder="Video URL (YouTube, Vimeo)"
          />
          <div className="flex items-center gap-2">
            <Checkbox
              checked={(content.autoplay as boolean) || false}
              onCheckedChange={(v) => onUpdate({ ...content, autoplay: v })}
            />
            <Label>Autoplay</Label>
          </div>
        </div>
      );

    case "carousel":
      const slides = (content.slides as Array<{ image: string; caption: string }>) || [];
      return (
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div key={idx} className="flex gap-2 items-center p-2 bg-muted/50 rounded">
              <span className="text-xs text-muted-foreground w-6">{idx + 1}</span>
              <Input
                value={slide.image}
                onChange={(e) => onUpdateSlide(idx, "image", e.target.value)}
                placeholder="Image URL"
                className="flex-1"
              />
              <Input
                value={slide.caption}
                onChange={(e) => onUpdateSlide(idx, "caption", e.target.value)}
                placeholder="Caption"
                className="flex-1"
              />
              <Button variant="ghost" size="sm" onClick={() => onRemoveSlide(idx)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={onAddSlide} className="gap-1">
            <Plus className="h-3 w-3" /> Add Slide
          </Button>
        </div>
      );

    case "form":
      const fields = (content.fields as Array<{ type: string; label: string; placeholder: string; required: boolean }>) || [];
      return (
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div key={idx} className="flex gap-2 items-center p-2 bg-muted/50 rounded">
              <Select
                value={field.type}
                onValueChange={(v) => onUpdateField(idx, "type", v)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={field.label}
                onChange={(e) => onUpdateField(idx, "label", e.target.value)}
                placeholder="Label"
                className="flex-1"
              />
              <Input
                value={field.placeholder}
                onChange={(e) => onUpdateField(idx, "placeholder", e.target.value)}
                placeholder="Placeholder"
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                <Checkbox
                  checked={field.required}
                  onCheckedChange={(v) => onUpdateField(idx, "required", !!v)}
                />
                <span className="text-xs">Req</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onRemoveField(idx)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={onAddField} className="gap-1">
            <Plus className="h-3 w-3" /> Add Field
          </Button>
        </div>
      );

    case "divider":
      return (
        <Select
          value={(content.style as string) || "line"}
          onValueChange={(v) => onUpdate({ ...content, style: v })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="space">Space</SelectItem>
          </SelectContent>
        </Select>
      );

    case "hero":
      return (
        <div className="space-y-2">
          <Input
            value={(content.title as string) || ""}
            onChange={(e) => onUpdate({ ...content, title: e.target.value })}
            placeholder="Hero title"
          />
          <Input
            value={(content.subtitle as string) || ""}
            onChange={(e) => onUpdate({ ...content, subtitle: e.target.value })}
            placeholder="Subtitle"
          />
          <Input
            value={(content.image as string) || ""}
            onChange={(e) => onUpdate({ ...content, image: e.target.value })}
            placeholder="Background image URL"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={(content.buttonText as string) || ""}
              onChange={(e) => onUpdate({ ...content, buttonText: e.target.value })}
              placeholder="Button text"
            />
            <Input
              value={(content.buttonUrl as string) || ""}
              onChange={(e) => onUpdate({ ...content, buttonUrl: e.target.value })}
              placeholder="Button URL"
            />
          </div>
        </div>
      );

    case "stats":
      const items = (content.items as Array<{ value: string; label: string }>) || [];
      return (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center p-2 bg-muted/50 rounded">
              <Input
                value={item.value}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx] = { ...newItems[idx], value: e.target.value };
                  onUpdate({ ...content, items: newItems });
                }}
                placeholder="Value (e.g., 100+)"
                className="w-24"
              />
              <Input
                value={item.label}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx] = { ...newItems[idx], label: e.target.value };
                  onUpdate({ ...content, items: newItems });
                }}
                placeholder="Label"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newItems = items.filter((_, i) => i !== idx);
                  onUpdate({ ...content, items: newItems });
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newItems = [...items, { value: "", label: "" }];
              onUpdate({ ...content, items: newItems });
            }}
            className="gap-1"
          >
            <Plus className="h-3 w-3" /> Add Stat
          </Button>
        </div>
      );

    case "campaigns-grid":
      return (
        <div className="space-y-2">
          <Input
            value={(content.title as string) || ""}
            onChange={(e) => onUpdate({ ...content, title: e.target.value })}
            placeholder="Section title"
          />
          <Input
            value={(content.subtitle as string) || ""}
            onChange={(e) => onUpdate({ ...content, subtitle: e.target.value })}
            placeholder="Subtitle"
          />
          <div className="flex items-center gap-2">
            <Label>Show campaigns:</Label>
            <Input
              type="number"
              value={(content.showCount as number) || 6}
              onChange={(e) =>
                onUpdate({ ...content, showCount: parseInt(e.target.value) || 6 })
              }
              className="w-20"
            />
          </div>
        </div>
      );

    case "quote":
      return (
        <div className="space-y-2">
          <Textarea
            value={(content.text as string) || ""}
            onChange={(e) => onUpdate({ ...content, text: e.target.value })}
            placeholder="Quote text"
          />
          <Input
            value={(content.author as string) || ""}
            onChange={(e) => onUpdate({ ...content, author: e.target.value })}
            placeholder="Author name"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={(content.buttonText as string) || ""}
              onChange={(e) => onUpdate({ ...content, buttonText: e.target.value })}
              placeholder="Button text (optional)"
            />
            <Input
              value={(content.buttonUrl as string) || ""}
              onChange={(e) => onUpdate({ ...content, buttonUrl: e.target.value })}
              placeholder="Button URL"
            />
          </div>
        </div>
      );

    // Section Layout Blocks
    case "heritage-hero":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Main Title</Label>
            <Input
              value={(content.title as string) || ""}
              onChange={(e) => onUpdate({ ...content, title: e.target.value })}
              placeholder="e.g., Preserving Our Heritage"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input
              value={(content.subtitle as string) || ""}
              onChange={(e) => onUpdate({ ...content, subtitle: e.target.value })}
              placeholder="e.g., Building Our Future"
            />
          </div>
          <div className="space-y-2">
            <Label>Description (italic tagline)</Label>
            <Input
              value={(content.description as string) || ""}
              onChange={(e) => onUpdate({ ...content, description: e.target.value })}
              placeholder="e.g., Through art, culture, and community"
            />
          </div>
          <div className="space-y-2">
            <Label>Main Paragraph</Label>
            <Textarea
              value={(content.tagline as string) || ""}
              onChange={(e) => onUpdate({ ...content, tagline: e.target.value })}
              placeholder="Main description paragraph..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Join Button Text</Label>
              <Input
                value={(content.joinButtonText as string) || ""}
                onChange={(e) =>
                  onUpdate({ ...content, joinButtonText: e.target.value })
                }
                placeholder="e.g., Join Our Movement"
              />
            </div>
            <div className="space-y-2">
              <Label>Join Button URL</Label>
              <Input
                value={(content.joinButtonUrl as string) || ""}
                onChange={(e) =>
                  onUpdate({ ...content, joinButtonUrl: e.target.value })
                }
                placeholder="/join"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Learn Button Text</Label>
              <Input
                value={(content.learnButtonText as string) || ""}
                onChange={(e) =>
                  onUpdate({ ...content, learnButtonText: e.target.value })
                }
                placeholder="e.g., Visit Our Shop"
              />
            </div>
            <div className="space-y-2">
              <Label>Learn Button URL</Label>
              <Input
                value={(content.learnButtonUrl as string) || ""}
                onChange={(e) =>
                  onUpdate({ ...content, learnButtonUrl: e.target.value })
                }
                placeholder="https://shop.sumud.fi"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Hero Image</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      // Upload to Cloudinary via API
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("folder", "sumud/pages");

                      const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });

                      if (!response.ok) {
                        throw new Error("Upload failed");
                      }

                      const data = await response.json();
                      onUpdate({ ...content, image: data.secure_url });
                      toast.success("Image uploaded successfully");
                    } catch (error) {
                      toast.error("Failed to upload image");
                      console.error("Upload error:", error);
                    }
                  }
                }}
                className="flex-1"
              />
            </div>
            {(content.image as string) && (
              <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                <NextImage
                  src={(content.image as string)}
                  alt="Hero preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <Input
              value={(content.image as string) || ""}
              onChange={(e) => onUpdate({ ...content, image: e.target.value })}
              placeholder="Or paste image URL: /images/hero-embroidery.jpg"
              className="text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Full-screen hero section with Palestinian heritage design
          </p>
        </div>
      );

    case "news-section":
      return (
        <div className="space-y-2">
          <Input
            value={(content.title as string) || ""}
            onChange={(e) => onUpdate({ ...content, title: e.target.value })}
            placeholder="Section title"
          />
          <div className="flex items-center gap-2">
            <Label>Number of articles:</Label>
            <Input
              type="number"
              value={(content.showCount as number) || 4}
              onChange={(e) =>
                onUpdate({ ...content, showCount: parseInt(e.target.value) || 4 })
              }
              className="w-20"
              min="1"
              max="12"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Displays latest news articles with featured content
          </p>
        </div>
      );

    case "events-section":
      return (
        <div className="space-y-2">
          <Input
            value={(content.title as string) || ""}
            onChange={(e) => onUpdate({ ...content, title: e.target.value })}
            placeholder="Section title"
          />
          <div className="flex items-center gap-2">
            <Label>Number of events:</Label>
            <Input
              type="number"
              value={(content.showCount as number) || 3}
              onChange={(e) =>
                onUpdate({ ...content, showCount: parseInt(e.target.value) || 3 })
              }
              className="w-20"
              min="1"
              max="12"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Displays upcoming events with dates and locations
          </p>
        </div>
      );

    case "campaigns-section":
      return (
        <div className="space-y-2">
          <Input
            value={(content.title as string) || ""}
            onChange={(e) => onUpdate({ ...content, title: e.target.value })}
            placeholder="Section title"
          />
          <Input
            value={(content.subtitle as string) || ""}
            onChange={(e) => onUpdate({ ...content, subtitle: e.target.value })}
            placeholder="Subtitle"
          />
          <div className="flex items-center gap-2">
            <Label>Number of campaigns:</Label>
            <Input
              type="number"
              value={(content.showCount as number) || 6}
              onChange={(e) =>
                onUpdate({ ...content, showCount: parseInt(e.target.value) || 6 })
              }
              className="w-20"
              min="1"
              max="12"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Displays active campaigns from the database
          </p>
        </div>
      );

    case "newsletter-section":
      return (
        <div className="space-y-2">
          <Label>Newsletter Variant</Label>
          <Select
            value={(content.variant as string) || "default"}
            onValueChange={(v) => onUpdate({ ...content, variant: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Newsletter signup section with email subscription
          </p>
        </div>
      );

    // ====================================================
    // Editable Page Section Blocks (locale-nested content)
    // ====================================================

    case "page-hero":
      return (
        <LocaleNestedEditor
          content={content}
          onUpdate={onUpdate}
          fields={[
            { key: 'title', label: 'Title', type: 'input' },
            { key: 'subtitle', label: 'Subtitle', type: 'input' },
            { key: 'description', label: 'Description', type: 'textarea' },
          ]}
          extraFields={
            <div className="space-y-2">
              <Label>Icon (Lucide name)</Label>
              <Input
                value={(content.icon as string) || ''}
                onChange={(e) => onUpdate({ ...content, icon: e.target.value })}
                placeholder="e.g., Globe, Heart, Users"
              />
            </div>
          }
        />
      );

    case "mission-section":
      return (
        <LocaleNestedEditor
          content={content}
          onUpdate={onUpdate}
          fields={[
            { key: 'title', label: 'Title', type: 'input' },
            { key: 'description', label: 'Description', type: 'textarea' },
          ]}
        />
      );

    case "features-section":
      return (
        <LocaleNestedItemsEditor
          content={content}
          onUpdate={onUpdate}
          headerFields={[
            { key: 'title', label: 'Title', type: 'input' },
            { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
          ]}
          itemFields={[
            { key: 'title', label: 'Title', type: 'input' },
            { key: 'description', label: 'Description', type: 'textarea' },
          ]}
          itemExtraFields={['icon', 'color']}
        />
      );

    case "values-section":
      return (
        <LocaleNestedItemsEditor
          content={content}
          onUpdate={onUpdate}
          headerFields={[
            { key: 'title', label: 'Title', type: 'input' },
            { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
          ]}
          itemFields={[
            { key: 'title', label: 'Title', type: 'input' },
            { key: 'description', label: 'Description', type: 'textarea' },
          ]}
          itemExtraFields={['icon']}
        />
      );

    case "engagement-section":
      return (
        <LocaleNestedItemsEditor
          content={content}
          onUpdate={onUpdate}
          headerFields={[
            { key: 'title', label: 'Title', type: 'input' },
            { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
          ]}
          itemFields={[
            { key: 'title', label: 'Title', type: 'input' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'action', label: 'Action Button Text', type: 'input' },
          ]}
          itemExtraFields={['icon', 'href']}
        />
      );

    case "cta-section":
      return (
        <LocaleNestedEditor
          content={content}
          onUpdate={onUpdate}
          fields={[
            { key: 'title', label: 'Title', type: 'input' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'primaryButtonText', label: 'Primary Button Text', type: 'input' },
            { key: 'secondaryButtonText', label: 'Secondary Button Text', type: 'input' },
          ]}
          extraFields={
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Button URL</Label>
                <Input
                  value={(content.primaryButtonHref as string) || ''}
                  onChange={(e) => onUpdate({ ...content, primaryButtonHref: e.target.value })}
                  placeholder="/membership"
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary Button URL</Label>
                <Input
                  value={(content.secondaryButtonHref as string) || ''}
                  onChange={(e) => onUpdate({ ...content, secondaryButtonHref: e.target.value })}
                  placeholder="/campaigns"
                />
              </div>
            </div>
          }
        />
      );

    default:
      return null;
  }
}
