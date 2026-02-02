"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
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
  ChevronRight,
  MessageCircle,
  UserCheck,
  Package,
  Space,
  AlertCircle,
  Link2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Share2,
  Star,
  DollarSign,
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
import { ArticlesUITranslationsEditor } from "@/src/components/admin/articles/ArticlesUITranslationsEditor";
import { EventsUITranslationsEditor } from "@/src/components/admin/events/EventsUITranslationsEditor";
import { CampaignsUITranslationsEditor } from "@/src/components/admin/campaigns/CampaignsUITranslationsEditor";
import { generateSlug } from "@/src/lib/utils/utils";
import type {
  PageBlock,
  PageBlockType,
  PageData,
  PageLocale,
} from "@/src/lib/types/page";
import { DEFAULT_BLOCK_CONTENT } from "@/src/lib/types/page";

// Supported locales for editing
const LOCALES = ['en', 'fi'] as const;
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
  initialLocale?: PageLocale;
}

export function PageBuilderEditor({ initialData, isNew = false, initialLocale = 'en' }: PageBuilderEditorProps) {
  const router = useRouter();
  const locale = useLocale();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const t = useTranslations("adminSettings.pageBuilder");

  // Check if this page uses UI translations by checking metadata
  // UI translations info is stored in metadata.customFields
  const metadataEn = initialData?.metadata?.en;
  const metadataFi = initialData?.metadata?.fi;
  const usesUITranslations = 
    metadataEn?.uiTranslations === true || 
    metadataFi?.uiTranslations === true;
  
  const uiTranslationsNamespace = usesUITranslations 
    ? (metadataEn?.uiTranslationsNamespace || metadataFi?.uiTranslationsNamespace) as string | null
    : null;

  // Initialize state directly from props, respecting the initial locale
  const initialTrans = initialData?.translations || {};
  const initialLangData = initialTrans[initialLocale] || initialTrans.en || { title: "", description: "", blocks: [] };
  
  const [allTranslations, setAllTranslations] = useState<PageData["translations"]>(initialTrans);
  const [currentLang, setCurrentLang] = useState<PageLocale>(initialLocale);
  const [blocks, setBlocks] = useState<PageBlock[]>(initialLangData.blocks || []);
  const [pageTitle, setPageTitle] = useState(initialLangData.title || initialData?.slug || "");
  const [pageDescription, setPageDescription] = useState(initialLangData.description || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [path, setPath] = useState(initialData?.path || "/");
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Get translated block types
  const blockTypes: { type: PageBlockType; label: string; icon: React.ElementType; category?: string }[] = [
    // Basic Blocks
    { type: "hero", label: t("blockTypes.hero"), icon: Sparkles, category: t("blockCategories.Basic") },
    { type: "heading", label: t("blockTypes.heading"), icon: Type, category: t("blockCategories.Basic") },
    { type: "text", label: t("blockTypes.text"), icon: Type, category: t("blockCategories.Basic") },
    { type: "image", label: t("blockTypes.image"), icon: Image, category: t("blockCategories.Basic") },
    { type: "cta", label: t("blockTypes.cta"), icon: MousePointer, category: t("blockCategories.Basic") },
    { type: "divider", label: t("blockTypes.divider"), icon: Minus, category: t("blockCategories.Basic") },
    { type: "spacer", label: t("blockTypes.spacer"), icon: Space, category: t("blockCategories.Basic") },
    
    // Content Blocks
    { type: "stats", label: t("blockTypes.stats"), icon: BarChart3, category: t("blockCategories.Content") },
    { type: "campaigns-grid", label: t("blockTypes.campaigns-grid"), icon: Grid3X3, category: t("blockCategories.Content") },
    { type: "quote", label: t("blockTypes.quote"), icon: Quote, category: t("blockCategories.Content") },
    { type: "carousel", label: t("blockTypes.carousel"), icon: Columns, category: t("blockCategories.Content") },
    { type: "form", label: t("blockTypes.form"), icon: FormInput, category: t("blockCategories.Content") },
    { type: "video", label: t("blockTypes.video"), icon: Video, category: t("blockCategories.Content") },
    { type: "accordion", label: t("blockTypes.accordion"), icon: ChevronRight, category: t("blockCategories.Content") },
    { type: "tabs", label: t("blockTypes.tabs"), icon: Columns, category: t("blockCategories.Content") },
    { type: "testimonials", label: t("blockTypes.testimonials"), icon: MessageCircle, category: t("blockCategories.Content") },
    { type: "team-members", label: t("blockTypes.team-members"), icon: UserCheck, category: t("blockCategories.Content") },
    { type: "icon-box", label: t("blockTypes.icon-box"), icon: Package, category: t("blockCategories.Content") },
    { type: "pricing-table", label: t("blockTypes.pricing-table"), icon: DollarSign, category: t("blockCategories.Content") },
    { type: "alert", label: t("blockTypes.alert"), icon: AlertCircle, category: t("blockCategories.Content") },
    { type: "button-group", label: t("blockTypes.button-group"), icon: Link2, category: t("blockCategories.Content") },
    { type: "social-icons", label: t("blockTypes.social-icons"), icon: Share2, category: t("blockCategories.Content") },
    
    // Section Layouts
    { type: "heritage-hero", label: t("blockTypes.heritage-hero"), icon: LayoutTemplate, category: t("blockCategories.Sections") },
    { type: "news-section", label: t("blockTypes.news-section"), icon: Newspaper, category: t("blockCategories.Sections") },
    { type: "events-section", label: t("blockTypes.events-section"), icon: Calendar, category: t("blockCategories.Sections") },
    { type: "campaigns-section", label: t("blockTypes.campaigns-section"), icon: Flag, category: t("blockCategories.Sections") },
    { type: "newsletter-section", label: t("blockTypes.newsletter-section"), icon: Mail, category: t("blockCategories.Sections") },
    
    // Editable Page Sections (locale-nested content)
    { type: "page-hero", label: t("blockTypes.page-hero"), icon: Sparkles, category: t("blockCategories.Page Sections") },
    { type: "mission-section", label: t("blockTypes.mission-section"), icon: Type, category: t("blockCategories.Page Sections") },
    { type: "features-section", label: t("blockTypes.features-section"), icon: Grid3X3, category: t("blockCategories.Page Sections") },
    { type: "values-section", label: t("blockTypes.values-section"), icon: BarChart3, category: t("blockCategories.Page Sections") },
    { type: "engagement-section", label: t("blockTypes.engagement-section"), icon: MousePointer, category: t("blockCategories.Page Sections") },
    { type: "cta-section", label: t("blockTypes.cta-section"), icon: Flag, category: t("blockCategories.Page Sections") },
  ];

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
        toast.success(t("pageCreated"));
        router.push(`/${locale}/admin/page-builder`);
      } else {
        await updatePage.mutateAsync({
          slug: initialData!.slug,
          data: {
            translations: finalTranslations,
            status,
            path: finalPath,
          },
        });
        toast.success(t("pageUpdated"));
        router.push(`/${locale}/admin/page-builder`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("saveFailed"));
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
            onClick={() => router.push(`/${locale}/admin/page-builder`)}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> {t("backToPages")}
          </Button>
          <h1 className="text-3xl font-display font-bold">
            {isNew ? t("createNewPage") : t("editPage", { title: initialLangData.title || initialData?.slug || "" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("buildInstruction")}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" /> {t("savePage")}
        </Button>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="settings">{t("pageSettings")}</TabsTrigger>
          <TabsTrigger value="blocks">{t("pageBuilder")}</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("pageTitle")}</Label>
                  <Input
                    value={pageTitle}
                    onChange={(e) => handlePageTitleChange(e.target.value)}
                    placeholder={t("pageTitlePlaceholder")}
                  />
                </div>
                <div>
                  <Label>{t("urlPath")}</Label>
                  <Input
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    className="font-mono"
                    placeholder={t("urlPathPlaceholder")}
                  />
                </div>
              </div>
              <div>
                <Label>{t("slug")}</Label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="font-mono"
                  placeholder={t("slugPlaceholder")}
                  disabled={!isNew}
                />
                {!isNew && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("slugLocked")}
                  </p>
                )}
                {isNew && slug && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("pageAccessible", { path: `/p/${slug}` })}
                  </p>
                )}
              </div>
              <div>
                <Label>{t("description")}</Label>
                <Textarea
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                  placeholder={t("descriptionPlaceholder")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("status")}</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t("draft")}</SelectItem>
                      <SelectItem value="published">{t("published")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("language")}</Label>
                  <Select value={currentLang} onValueChange={(v) => handleLangChange(v as PageLocale)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t("english")}</SelectItem>
                      <SelectItem value="fi">{t("finnish")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocks" className="space-y-4">
          {usesUITranslations && uiTranslationsNamespace ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <LayoutTemplate className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                          {t("uiTranslationsMode.title") || "UI Translations Mode"}
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {t("uiTranslationsMode.description") || `This page uses UI translations from the "${uiTranslationsNamespace}" namespace. Edit the text content below.`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {uiTranslationsNamespace === "articlesPage" && <ArticlesUITranslationsEditor />}
                  {uiTranslationsNamespace === "events" && <EventsUITranslationsEditor />}
                  {uiTranslationsNamespace === "campaigns" && <CampaignsUITranslationsEditor />}
                </div>
              </CardContent>
            </Card>
          ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg mb-4">{blockTypes.map((bt) => (
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
                    {t("noBlocksYet")}
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
          )}
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
 * { content: { en: { title, description }, fi: {...} } }
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
  const t = useTranslations("adminSettings.pageBuilder");
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
      key: `item-${generateId()}`,
      content: {
        en: {},
        fi: {},
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
        <Label className="text-sm font-medium">{t("labels.sectionHeader")}</Label>
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
          <Label className="text-sm font-medium">{t("labels.items", { count: items.length })}</Label>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" /> {t("labels.addItem")}
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
                    {itemContent.en?.title || t("labels.item", { number: index + 1 })}
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
                          <Label className="text-xs capitalize">{field === 'icon' ? t("labels.iconCapitalized") : field === 'color' ? t("labels.color") : field === 'href' ? t("labels.href") : field}</Label>
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
                                      <span className="text-muted-foreground">{t("labels.selectIcon")}</span>
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
                                        <span className="text-muted-foreground">{t("labels.selectColor")}</span>
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
  const t = useTranslations("adminSettings.pageBuilder");
  const content = block.content as unknown as Record<string, unknown>;

  switch (block.type) {
    case "heading":
      return (
        <div className="grid grid-cols-4 gap-2">
          <Input
            className="col-span-3"
            value={(content.text as string) || ""}
            onChange={(e) => onUpdate({ ...content, text: e.target.value })}
            placeholder={t("placeholders.headingText")}
          />
          <Select
            value={(content.level as string) || "h2"}
            onValueChange={(v) => onUpdate({ ...content, level: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="h1">{t("selectOptions.h1")}</SelectItem>
              <SelectItem value="h2">{t("selectOptions.h2")}</SelectItem>
              <SelectItem value="h3">{t("selectOptions.h3")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

    case "text":
      return (
        <Textarea
          value={(content.text as string) || ""}
          onChange={(e) => onUpdate({ ...content, text: e.target.value })}
          placeholder={t("placeholders.textContent")}
        />
      );

    case "image":
      return (
        <div className="space-y-2">
          <Input
            value={(content.src as string) || ""}
            onChange={(e) => onUpdate({ ...content, src: e.target.value })}
            placeholder={t("placeholders.imageUrl")}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={(content.alt as string) || ""}
              onChange={(e) => onUpdate({ ...content, alt: e.target.value })}
              placeholder={t("placeholders.altText")}
            />
            <Input
              value={(content.caption as string) || ""}
              onChange={(e) => onUpdate({ ...content, caption: e.target.value })}
              placeholder={t("placeholders.caption")}
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
            placeholder={t("placeholders.buttonText")}
          />
          <Input
            value={(content.url as string) || ""}
            onChange={(e) => onUpdate({ ...content, url: e.target.value })}
            placeholder={t("placeholders.linkUrl")}
          />
          <Select
            value={(content.style as string) || "primary"}
            onValueChange={(v) => onUpdate({ ...content, style: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">{t("selectOptions.primary")}</SelectItem>
              <SelectItem value="secondary">{t("selectOptions.secondary")}</SelectItem>
              <SelectItem value="outline">{t("selectOptions.outline")}</SelectItem>
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
            placeholder={t("placeholders.videoUrl")}
          />
          <div className="flex items-center gap-2">
            <Checkbox
              checked={(content.autoplay as boolean) || false}
              onCheckedChange={(v) => onUpdate({ ...content, autoplay: v })}
            />
            <Label>{t("labels.autoplay")}</Label>
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
                placeholder={t("placeholders.imageUrl")}
                className="flex-1"
              />
              <Input
                value={slide.caption}
                onChange={(e) => onUpdateSlide(idx, "caption", e.target.value)}
                placeholder={t("placeholders.caption")}
                className="flex-1"
              />
              <Button variant="ghost" size="sm" onClick={() => onRemoveSlide(idx)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={onAddSlide} className="gap-1">
            <Plus className="h-3 w-3" /> {t("labels.addSlide")}
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
                  <SelectItem value="text">{t("selectOptions.text")}</SelectItem>
                  <SelectItem value="email">{t("selectOptions.email")}</SelectItem>
                  <SelectItem value="textarea">{t("selectOptions.textarea")}</SelectItem>
                  <SelectItem value="checkbox">{t("selectOptions.checkbox")}</SelectItem>
                  <SelectItem value="select">{t("selectOptions.select")}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={field.label}
                onChange={(e) => onUpdateField(idx, "label", e.target.value)}
                placeholder={t("placeholders.label")}
                className="flex-1"
              />
              <Input
                value={field.placeholder}
                onChange={(e) => onUpdateField(idx, "placeholder", e.target.value)}
                placeholder={t("placeholders.placeholder")}
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                <Checkbox
                  checked={field.required}
                  onCheckedChange={(v) => onUpdateField(idx, "required", !!v)}
                />
                <span className="text-xs">{t("labels.required")}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onRemoveField(idx)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={onAddField} className="gap-1">
            <Plus className="h-3 w-3" /> {t("labels.addField")}
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
            <SelectItem value="line">{t("selectOptions.line")}</SelectItem>
            <SelectItem value="dashed">{t("selectOptions.dashed")}</SelectItem>
            <SelectItem value="space">{t("selectOptions.space")}</SelectItem>
          </SelectContent>
        </Select>
      );

    case "hero":
      return (
        <div className="space-y-2">
          <Input
            value={(content.title as string) || ""}
            onChange={(e) => onUpdate({ ...content, title: e.target.value })}
            placeholder={t("placeholders.heroTitle")}
          />
          <Input
            value={(content.subtitle as string) || ""}
            onChange={(e) => onUpdate({ ...content, subtitle: e.target.value })}
            placeholder={t("placeholders.subtitle")}
          />
          <Input
            value={(content.image as string) || ""}
            onChange={(e) => onUpdate({ ...content, image: e.target.value })}
            placeholder={t("placeholders.backgroundImageUrl")}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={(content.buttonText as string) || ""}
              onChange={(e) => onUpdate({ ...content, buttonText: e.target.value })}
              placeholder={t("placeholders.buttonText")}
            />
            <Input
              value={(content.buttonUrl as string) || ""}
              onChange={(e) => onUpdate({ ...content, buttonUrl: e.target.value })}
              placeholder={t("placeholders.buttonUrl")}
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
                placeholder={t("placeholders.value")}
                className="w-24"
              />
              <Input
                value={item.label}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx] = { ...newItems[idx], label: e.target.value };
                  onUpdate({ ...content, items: newItems });
                }}
                placeholder={t("placeholders.label")}
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
            <Plus className="h-3 w-3" /> {t("labels.addStat")}
          </Button>
        </div>
      );

    case "campaigns-grid":
      return (
        <div className="space-y-2">
          <Input
            value={(content.title as string) || ""}
            onChange={(e) => onUpdate({ ...content, title: e.target.value })}
            placeholder={t("placeholders.sectionTitle")}
          />
          <Input
            value={(content.subtitle as string) || ""}
            onChange={(e) => onUpdate({ ...content, subtitle: e.target.value })}
            placeholder={t("placeholders.subtitle")}
          />
          <div className="flex items-center gap-2">
            <Label>{t("labels.showCampaigns")}</Label>
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
            placeholder={t("placeholders.quoteText")}
          />
          <Input
            value={(content.author as string) || ""}
            onChange={(e) => onUpdate({ ...content, author: e.target.value })}
            placeholder={t("placeholders.authorName")}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={(content.buttonText as string) || ""}
              onChange={(e) => onUpdate({ ...content, buttonText: e.target.value })}
              placeholder={t("placeholders.buttonTextOptional")}
            />
            <Input
              value={(content.buttonUrl as string) || ""}
              onChange={(e) => onUpdate({ ...content, buttonUrl: e.target.value })}
              placeholder={t("placeholders.buttonUrl")}
            />
          </div>
        </div>
      );

    // Section Layout Blocks
    case "heritage-hero":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("labels.mainTitle")}</Label>
            <Input
              value={(content.title as string) || ""}
              onChange={(e) => onUpdate({ ...content, title: e.target.value })}
              placeholder={t("examples.preservingHeritage")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("placeholders.subtitle")}</Label>
            <Input
              value={(content.subtitle as string) || ""}
              onChange={(e) => onUpdate({ ...content, subtitle: e.target.value })}
              placeholder={t("examples.buildingFuture")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("labels.descriptionItalicTagline")}</Label>
            <Input
              value={(content.description as string) || ""}
              onChange={(e) => onUpdate({ ...content, description: e.target.value })}
              placeholder={t("examples.throughArtCulture")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("labels.mainParagraph")}</Label>
            <Textarea
              value={(content.tagline as string) || ""}
              onChange={(e) => onUpdate({ ...content, tagline: e.target.value })}
              placeholder={t("examples.mainDescriptionParagraph")}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("labels.joinButtonText")}</Label>
              <Input
                value={(content.joinButtonText as string) || ""}
                onChange={(e) =>
                  onUpdate({ ...content, joinButtonText: e.target.value })
                }
                placeholder={t("examples.joinOurMovement")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("labels.joinButtonUrl")}</Label>
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
              <Label>{t("labels.learnButtonText")}</Label>
              <Input
                value={(content.learnButtonText as string) || ""}
                onChange={(e) =>
                  onUpdate({ ...content, learnButtonText: e.target.value })
                }
                placeholder={t("examples.visitOurShop")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("labels.learnButtonUrl")}</Label>
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
            <Label>{t("labels.heroImage")}</Label>
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
                        throw new Error(t("messages.uploadFailed"));
                      }

                      const data = await response.json();
                      onUpdate({ ...content, image: data.secure_url });
                      toast.success(t("messages.imageUploadedSuccess"));
                    } catch (error) {
                      toast.error(t("messages.imageUploadFailed"));
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
                  alt={t("placeholders.imageUrl")}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <Input
              value={(content.image as string) || ""}
              onChange={(e) => onUpdate({ ...content, image: e.target.value })}
              placeholder={t("placeholders.imageUrlOrPaste")}
              className="text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("labels.fullScreenHeroDescription")}
          </p>
        </div>
      );

    case "news-section":
      return (
        <div className="space-y-2">
          <Input
            value={(content.title as string) || ""}
            onChange={(e) => onUpdate({ ...content, title: e.target.value })}
            placeholder={t("placeholders.sectionTitle")}
          />
          <div className="flex items-center gap-2">
            <Label>{t("labels.numberOfArticles")}</Label>
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
            {t("labels.displaysLatestNews")}
          </p>
        </div>
      );

    case "events-section":
      return (
        <div className="space-y-2">
          <Input
            value={(content.title as string) || ""}
            onChange={(e) => onUpdate({ ...content, title: e.target.value })}
            placeholder={t("placeholders.sectionTitle")}
          />
          <div className="flex items-center gap-2">
            <Label>{t("labels.numberOfEvents")}</Label>
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
            {t("labels.displaysUpcomingEvents")}
          </p>
        </div>
      );

    case "campaigns-section":
      return (
        <div className="space-y-2">
          <Input
            value={(content.title as string) || ""}
            onChange={(e) => onUpdate({ ...content, title: e.target.value })}
            placeholder={t("placeholders.sectionTitle")}
          />
          <Input
            value={(content.subtitle as string) || ""}
            onChange={(e) => onUpdate({ ...content, subtitle: e.target.value })}
            placeholder={t("placeholders.subtitle")}
          />
          <div className="flex items-center gap-2">
            <Label>{t("labels.numberOfCampaigns")}</Label>
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
            {t("labels.displaysActiveCampaigns")}
          </p>
        </div>
      );

    case "newsletter-section":
      return (
        <div className="space-y-2">
          <Label>{t("labels.newsletterVariant")}</Label>
          <Select
            value={(content.variant as string) || "default"}
            onValueChange={(v) => onUpdate({ ...content, variant: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{t("selectOptions.default")}</SelectItem>
              <SelectItem value="compact">{t("selectOptions.compact")}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t("labels.newsletterDescription")}
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
            { key: 'title', label: t("labels.title"), type: 'input' },
            { key: 'subtitle', label: t("placeholders.subtitle"), type: 'input' },
            { key: 'description', label: t("labels.description"), type: 'textarea' },
          ]}
          extraFields={
            <div className="space-y-2">
              <Label>{t("labels.iconLucideNameLabel")}</Label>
              <Input
                value={(content.icon as string) || ''}
                onChange={(e) => onUpdate({ ...content, icon: e.target.value })}
                placeholder={t("placeholders.iconLucideName")}
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
            { key: 'title', label: t("labels.title"), type: 'input' },
            { key: 'description', label: t("labels.description"), type: 'textarea' },
          ]}
        />
      );

    case "features-section":
      return (
        <LocaleNestedItemsEditor
          content={content}
          onUpdate={onUpdate}
          headerFields={[
            { key: 'title', label: t("labels.title"), type: 'input' },
            { key: 'subtitle', label: t("placeholders.subtitle"), type: 'textarea' },
          ]}
          itemFields={[
            { key: 'title', label: t("labels.title"), type: 'input' },
            { key: 'description', label: t("labels.description"), type: 'textarea' },
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
            { key: 'title', label: t("labels.title"), type: 'input' },
            { key: 'subtitle', label: t("placeholders.subtitle"), type: 'textarea' },
          ]}
          itemFields={[
            { key: 'title', label: t("labels.title"), type: 'input' },
            { key: 'description', label: t("labels.description"), type: 'textarea' },
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
            { key: 'title', label: t("labels.title"), type: 'input' },
            { key: 'subtitle', label: t("placeholders.subtitle"), type: 'textarea' },
          ]}
          itemFields={[
            { key: 'title', label: t("labels.title"), type: 'input' },
            { key: 'description', label: t("labels.description"), type: 'textarea' },
            { key: 'action', label: t("labels.actionButtonText"), type: 'input' },
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
            { key: 'title', label: t("labels.title"), type: 'input' },
            { key: 'description', label: t("labels.description"), type: 'textarea' },
            { key: 'primaryButtonText', label: t("labels.primaryButtonUrl"), type: 'input' },
            { key: 'secondaryButtonText', label: t("labels.secondaryButtonUrl"), type: 'input' },
          ]}
          extraFields={
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("labels.primaryButtonUrl")}</Label>
                <Input
                  value={(content.primaryButtonHref as string) || ""}
                  onChange={(e) => onUpdate({ ...content, primaryButtonHref: e.target.value })}
                  placeholder="/membership"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("labels.secondaryButtonUrl")}</Label>
                <Input
                  value={(content.secondaryButtonHref as string) || ""}
                  onChange={(e) => onUpdate({ ...content, secondaryButtonHref: e.target.value })}
                  placeholder="/about"
                />
              </div>
            </div>
          }
        />
      );

    // WordPress/Elementor-style Blocks
    case "accordion":
      const accordionItems = (content.items as Array<{ title: string; content: string; isOpen?: boolean }>) || [];
      return (
        <div className="space-y-3">
          {accordionItems.map((item, idx) => (
            <div key={idx} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={item.title}
                  onChange={(e) => {
                    const newItems = [...accordionItems];
                    newItems[idx] = { ...item, title: e.target.value };
                    onUpdate({ ...content, items: newItems });
                  }}
                  placeholder={t("placeholders.accordionTitle")}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newItems = accordionItems.filter((_, i) => i !== idx);
                    onUpdate({ ...content, items: newItems });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={item.content}
                onChange={(e) => {
                  const newItems = [...accordionItems];
                  newItems[idx] = { ...item, content: e.target.value };
                  onUpdate({ ...content, items: newItems });
                }}
                placeholder={t("placeholders.accordionContent")}
              />
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newItems = [...accordionItems, { title: '', content: '', isOpen: false }];
              onUpdate({ ...content, items: newItems });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.addItem")}
          </Button>
        </div>
      );

    case "testimonials":
      const testimonials = (content.items as Array<{ name: string; role: string; company?: string; image?: string; quote: string; rating?: number }>) || [];
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={(content.layout as string) || "grid"}
              onValueChange={(v) => onUpdate({ ...content, layout: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">{t("options.grid")}</SelectItem>
                <SelectItem value="slider">{t("options.slider")}</SelectItem>
                <SelectItem value="single">{t("options.single")}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String((content.columns as number) || 3)}
              onValueChange={(v) => onUpdate({ ...content, columns: parseInt(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 {t("options.columns")}</SelectItem>
                <SelectItem value="3">3 {t("options.columns")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Testimonial {idx + 1}</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newItems = testimonials.filter((_, i) => i !== idx);
                    onUpdate({ ...content, items: newItems });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={testimonial.name}
                onChange={(e) => {
                  const newItems = [...testimonials];
                  newItems[idx] = { ...testimonial, name: e.target.value };
                  onUpdate({ ...content, items: newItems });
                }}
                placeholder={t("placeholders.name")}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={testimonial.role}
                  onChange={(e) => {
                    const newItems = [...testimonials];
                    newItems[idx] = { ...testimonial, role: e.target.value };
                    onUpdate({ ...content, items: newItems });
                  }}
                  placeholder={t("placeholders.role")}
                />
                <Input
                  value={testimonial.company || ""}
                  onChange={(e) => {
                    const newItems = [...testimonials];
                    newItems[idx] = { ...testimonial, company: e.target.value };
                    onUpdate({ ...content, items: newItems });
                  }}
                  placeholder={t("placeholders.company")}
                />
              </div>
              <Input
                value={testimonial.image || ""}
                onChange={(e) => {
                  const newItems = [...testimonials];
                  newItems[idx] = { ...testimonial, image: e.target.value };
                  onUpdate({ ...content, items: newItems });
                }}
                placeholder={t("placeholders.imageUrl")}
              />
              <Textarea
                value={testimonial.quote}
                onChange={(e) => {
                  const newItems = [...testimonials];
                  newItems[idx] = { ...testimonial, quote: e.target.value };
                  onUpdate({ ...content, items: newItems });
                }}
                placeholder={t("placeholders.testimonialQuote")}
              />
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newItems = [...testimonials, { name: '', role: '', quote: '', rating: 5 }];
              onUpdate({ ...content, items: newItems });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.addTestimonial")}
          </Button>
        </div>
      );

    case "tabs":
      const tabs = (content.tabs as Array<{ title: string; content: string; icon?: string }>) || [];
      return (
        <div className="space-y-3">
          {tabs.map((tab, idx) => (
            <div key={idx} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  value={tab.title}
                  onChange={(e) => {
                    const newTabs = [...tabs];
                    newTabs[idx] = { ...tab, title: e.target.value };
                    onUpdate({ ...content, tabs: newTabs });
                  }}
                  placeholder={t("placeholders.tabTitle")}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newTabs = tabs.filter((_, i) => i !== idx);
                    onUpdate({ ...content, tabs: newTabs });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={tab.content}
                onChange={(e) => {
                  const newTabs = [...tabs];
                  newTabs[idx] = { ...tab, content: e.target.value };
                  onUpdate({ ...content, tabs: newTabs });
                }}
                placeholder={t("placeholders.tabContent")}
              />
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newTabs = [...tabs, { title: '', content: '', icon: '' }];
              onUpdate({ ...content, tabs: newTabs });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.addTab")}
          </Button>
        </div>
      );

    case "team-members":
      const members = (content.members as Array<{ name: string; role: string; bio?: string; image?: string; email?: string; social?: { linkedin?: string; twitter?: string; facebook?: string } }>) || [];
      return (
        <div className="space-y-3">
          <Select
            value={String((content.columns as number) || 3)}
            onValueChange={(v) => onUpdate({ ...content, columns: parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 {t("options.columns")}</SelectItem>
              <SelectItem value="3">3 {t("options.columns")}</SelectItem>
              <SelectItem value="4">4 {t("options.columns")}</SelectItem>
            </SelectContent>
          </Select>
          {members.map((member, idx) => (
            <div key={idx} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Member {idx + 1}</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newMembers = members.filter((_, i) => i !== idx);
                    onUpdate({ ...content, members: newMembers });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={member.name}
                  onChange={(e) => {
                    const newMembers = [...members];
                    newMembers[idx] = { ...member, name: e.target.value };
                    onUpdate({ ...content, members: newMembers });
                  }}
                  placeholder={t("placeholders.name")}
                />
                <Input
                  value={member.role}
                  onChange={(e) => {
                    const newMembers = [...members];
                    newMembers[idx] = { ...member, role: e.target.value };
                    onUpdate({ ...content, members: newMembers });
                  }}
                  placeholder={t("placeholders.role")}
                />
              </div>
              <Input
                value={member.image || ""}
                onChange={(e) => {
                  const newMembers = [...members];
                  newMembers[idx] = { ...member, image: e.target.value };
                  onUpdate({ ...content, members: newMembers });
                }}
                placeholder={t("placeholders.imageUrl")}
              />
              <Textarea
                value={member.bio || ""}
                onChange={(e) => {
                  const newMembers = [...members];
                  newMembers[idx] = { ...member, bio: e.target.value };
                  onUpdate({ ...content, members: newMembers });
                }}
                placeholder={t("placeholders.bio")}
              />
              <Input
                value={member.email || ""}
                onChange={(e) => {
                  const newMembers = [...members];
                  newMembers[idx] = { ...member, email: e.target.value };
                  onUpdate({ ...content, members: newMembers });
                }}
                placeholder={t("placeholders.email")}
              />
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newMembers = [...members, { name: '', role: '', bio: '', image: '', email: '' }];
              onUpdate({ ...content, members: newMembers });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.addMember")}
          </Button>
        </div>
      );

    case "icon-box":
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={(content.icon as string) || "Heart"}
              onValueChange={(v) => onUpdate({ ...content, icon: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ICONS.map((icon) => (
                  <SelectItem key={icon.name} value={icon.name}>
                    {icon.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={(content.iconPosition as string) || "top"}
              onValueChange={(v) => onUpdate({ ...content, iconPosition: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">{t("options.top")}</SelectItem>
                <SelectItem value="left">{t("options.left")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            value={(content.title as string) || ""}
            onChange={(e) => onUpdate({ ...content, title: e.target.value })}
            placeholder={t("placeholders.title")}
          />
          <Textarea
            value={(content.description as string) || ""}
            onChange={(e) => onUpdate({ ...content, description: e.target.value })}
            placeholder={t("placeholders.description")}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={(content.linkText as string) || ""}
              onChange={(e) => onUpdate({ ...content, linkText: e.target.value })}
              placeholder={t("placeholders.linkText")}
            />
            <Input
              value={(content.linkUrl as string) || ""}
              onChange={(e) => onUpdate({ ...content, linkUrl: e.target.value })}
              placeholder={t("placeholders.linkUrl")}
            />
          </div>
        </div>
      );

    case "pricing-table":
      const plans = (content.plans as Array<{ name: string; price: string; period?: string; features: string[]; buttonText: string; buttonUrl: string; highlighted?: boolean; badge?: string }>) || [];
      return (
        <div className="space-y-3">
          <Select
            value={String((content.columns as number) || 3)}
            onValueChange={(v) => onUpdate({ ...content, columns: parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 {t("options.columns")}</SelectItem>
              <SelectItem value="3">3 {t("options.columns")}</SelectItem>
              <SelectItem value="4">4 {t("options.columns")}</SelectItem>
            </SelectContent>
          </Select>
          {plans.map((plan, idx) => (
            <div key={idx} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Plan {idx + 1}</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newPlans = plans.filter((_, i) => i !== idx);
                    onUpdate({ ...content, plans: newPlans });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={plan.name}
                  onChange={(e) => {
                    const newPlans = [...plans];
                    newPlans[idx] = { ...plan, name: e.target.value };
                    onUpdate({ ...content, plans: newPlans });
                  }}
                  placeholder={t("placeholders.planName")}
                />
                <Input
                  value={plan.price}
                  onChange={(e) => {
                    const newPlans = [...plans];
                    newPlans[idx] = { ...plan, price: e.target.value };
                    onUpdate({ ...content, plans: newPlans });
                  }}
                  placeholder={t("placeholders.price")}
                />
                <Input
                  value={plan.period || ""}
                  onChange={(e) => {
                    const newPlans = [...plans];
                    newPlans[idx] = { ...plan, period: e.target.value };
                    onUpdate({ ...content, plans: newPlans });
                  }}
                  placeholder={t("placeholders.period")}
                />
              </div>
              <Textarea
                value={plan.features.join('\n')}
                onChange={(e) => {
                  const newPlans = [...plans];
                  newPlans[idx] = { ...plan, features: e.target.value.split('\n').filter(f => f.trim()) };
                  onUpdate({ ...content, plans: newPlans });
                }}
                placeholder={t("placeholders.features")}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={plan.buttonText}
                  onChange={(e) => {
                    const newPlans = [...plans];
                    newPlans[idx] = { ...plan, buttonText: e.target.value };
                    onUpdate({ ...content, plans: newPlans });
                  }}
                  placeholder={t("placeholders.buttonText")}
                />
                <Input
                  value={plan.buttonUrl}
                  onChange={(e) => {
                    const newPlans = [...plans];
                    newPlans[idx] = { ...plan, buttonUrl: e.target.value };
                    onUpdate({ ...content, plans: newPlans });
                  }}
                  placeholder={t("placeholders.buttonUrl")}
                />
              </div>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newPlans = [...plans, { name: '', price: '', features: [], buttonText: 'Choose Plan', buttonUrl: '' }];
              onUpdate({ ...content, plans: newPlans });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.addPlan")}
          </Button>
        </div>
      );

    case "spacer":
      return (
        <div className="space-y-2">
          <Label>{t("labels.height")} (px)</Label>
          <Input
            type="number"
            value={(content.height as number) || 50}
            onChange={(e) => onUpdate({ ...content, height: parseInt(e.target.value) || 50 })}
            placeholder="50"
          />
        </div>
      );

    case "alert":
      return (
        <div className="space-y-2">
          <Select
            value={(content.type as string) || "info"}
            onValueChange={(v) => onUpdate({ ...content, type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">{t("options.info")}</SelectItem>
              <SelectItem value="success">{t("options.success")}</SelectItem>
              <SelectItem value="warning">{t("options.warning")}</SelectItem>
              <SelectItem value="error">{t("options.error")}</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={(content.title as string) || ""}
            onChange={(e) => onUpdate({ ...content, title: e.target.value })}
            placeholder={t("placeholders.alertTitle")}
          />
          <Textarea
            value={(content.message as string) || ""}
            onChange={(e) => onUpdate({ ...content, message: e.target.value })}
            placeholder={t("placeholders.alertMessage")}
          />
          <div className="flex items-center gap-2">
            <Checkbox
              checked={(content.dismissible as boolean) || false}
              onCheckedChange={(checked) => onUpdate({ ...content, dismissible: checked })}
            />
            <Label>{t("labels.dismissible")}</Label>
          </div>
        </div>
      );

    case "button-group":
      const buttons = (content.buttons as Array<{ text: string; url: string; style: string; icon?: string }>) || [];
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={(content.alignment as string) || "center"}
              onValueChange={(v) => onUpdate({ ...content, alignment: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">{t("options.left")}</SelectItem>
                <SelectItem value="center">{t("options.center")}</SelectItem>
                <SelectItem value="right">{t("options.right")}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={(content.stack as boolean) || false}
                onCheckedChange={(checked) => onUpdate({ ...content, stack: checked })}
              />
              <Label>{t("labels.stackButtons")}</Label>
            </div>
          </div>
          {buttons.map((button, idx) => (
            <div key={idx} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Button {idx + 1}</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newButtons = buttons.filter((_, i) => i !== idx);
                    onUpdate({ ...content, buttons: newButtons });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={button.text}
                  onChange={(e) => {
                    const newButtons = [...buttons];
                    newButtons[idx] = { ...button, text: e.target.value };
                    onUpdate({ ...content, buttons: newButtons });
                  }}
                  placeholder={t("placeholders.buttonText")}
                />
                <Input
                  value={button.url}
                  onChange={(e) => {
                    const newButtons = [...buttons];
                    newButtons[idx] = { ...button, url: e.target.value };
                    onUpdate({ ...content, buttons: newButtons });
                  }}
                  placeholder={t("placeholders.buttonUrl")}
                />
                <Select
                  value={button.style}
                  onValueChange={(v) => {
                    const newButtons = [...buttons];
                    newButtons[idx] = { ...button, style: v };
                    onUpdate({ ...content, buttons: newButtons });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">{t("options.primary")}</SelectItem>
                    <SelectItem value="secondary">{t("options.secondary")}</SelectItem>
                    <SelectItem value="outline">{t("options.outline")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newButtons = [...buttons, { text: '', url: '', style: 'primary' }];
              onUpdate({ ...content, buttons: newButtons });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.addButton")}
          </Button>
        </div>
      );

    case "social-icons":
      const platforms = (content.platforms as Array<{ name: string; url: string; icon: string }>) || [];
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Select
              value={(content.style as string) || "rounded"}
              onValueChange={(v) => onUpdate({ ...content, style: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{t("options.default")}</SelectItem>
                <SelectItem value="rounded">{t("options.rounded")}</SelectItem>
                <SelectItem value="square">{t("options.square")}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={(content.size as string) || "md"}
              onValueChange={(v) => onUpdate({ ...content, size: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">{t("options.small")}</SelectItem>
                <SelectItem value="md">{t("options.medium")}</SelectItem>
                <SelectItem value="lg">{t("options.large")}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={(content.alignment as string) || "center"}
              onValueChange={(v) => onUpdate({ ...content, alignment: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">{t("options.left")}</SelectItem>
                <SelectItem value="center">{t("options.center")}</SelectItem>
                <SelectItem value="right">{t("options.right")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {platforms.map((platform, idx) => (
            <div key={idx} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Platform {idx + 1}</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newPlatforms = platforms.filter((_, i) => i !== idx);
                    onUpdate({ ...content, platforms: newPlatforms });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={platform.name}
                  onChange={(e) => {
                    const newPlatforms = [...platforms];
                    newPlatforms[idx] = { ...platform, name: e.target.value };
                    onUpdate({ ...content, platforms: newPlatforms });
                  }}
                  placeholder={t("placeholders.platformName")}
                />
                <Input
                  value={platform.url}
                  onChange={(e) => {
                    const newPlatforms = [...platforms];
                    newPlatforms[idx] = { ...platform, url: e.target.value };
                    onUpdate({ ...content, platforms: newPlatforms });
                  }}
                  placeholder={t("placeholders.url")}
                />
              </div>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newPlatforms = [...platforms, { name: '', url: '', icon: 'Share2' }];
              onUpdate({ ...content, platforms: newPlatforms });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.addPlatform")}
          </Button>
        </div>
      );

    default:
      return null;
  }
}
