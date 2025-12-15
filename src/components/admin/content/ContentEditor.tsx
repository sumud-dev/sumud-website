"use client";

import * as React from "react";
import { toast } from "sonner";
import { Save, RotateCcw, Search, X, Loader2, Languages } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Card } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { bulkUpdateContent, updateContentWithTranslation } from "@/src/actions/content.actions";
import type { SiteContent, ContentType, BulkContentUpdate, Locale } from "@/src/types/Content";

interface ContentEditorProps {
  content: SiteContent[];
  namespace: string;
  locale: string;
  onSaveSuccess?: () => void;
}

interface GroupedContent {
  [prefix: string]: SiteContent[];
}

// Determine content type based on key and value
function inferContentType(key: string, value: string): ContentType {
  if (key.includes("description") || key.includes("content") || key.includes("subtitle")) {
    return "textarea";
  }
  if (value && value.length > 100) {
    return "textarea";
  }
  return "text";
}

// Group content by first key segment
function groupContentByPrefix(content: SiteContent[]): GroupedContent {
  return content.reduce((acc, item) => {
    const key = item.key || "";
    const prefix = key.split(".")[0] || "other";
    if (!acc[prefix]) {
      acc[prefix] = [];
    }
    acc[prefix].push(item);
    return acc;
  }, {} as GroupedContent);
}

// Format key for display
function formatKeyForDisplay(key: string): string {
  const parts = key.split(".");
  return parts.slice(1).join(" → ") || key;
}

// Format prefix for display
function formatPrefixForDisplay(prefix: string): string {
  return prefix
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

interface ContentFieldProps {
  item: SiteContent;
  value: string;
  onChange: (id: string, value: string) => void;
  hasChanged: boolean;
}

function ContentField({ item, value, onChange, hasChanged }: ContentFieldProps) {
  const contentType = inferContentType(item.key || "", item.value || "");
  const displayKey = formatKeyForDisplay(item.key || "");

  return (
    <div className="space-y-2 py-3 border-b last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor={item.id}
          className="text-sm font-medium flex items-center gap-2"
        >
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            {displayKey || item.key}
          </code>
          {hasChanged && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
              Modified
            </Badge>
          )}
        </Label>
      </div>
      {contentType === "textarea" ? (
        <Textarea
          id={item.id}
          value={value}
          onChange={(e) => onChange(item.id, e.target.value)}
          className={`min-h-20 resize-y ${hasChanged ? "border-amber-400" : ""}`}
          placeholder={`Enter ${item.key}...`}
        />
      ) : (
        <Input
          id={item.id}
          value={value}
          onChange={(e) => onChange(item.id, e.target.value)}
          className={hasChanged ? "border-amber-400" : ""}
          placeholder={`Enter ${item.key}...`}
        />
      )}
    </div>
  );
}

export default function ContentEditor({
  content,
  namespace,
  locale,
  onSaveSuccess,
}: ContentEditorProps) {
  // Track edited values
  const [editedValues, setEditedValues] = React.useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>([]);
  const [autoTranslate, setAutoTranslate] = React.useState(false);
  const [isTranslating, setIsTranslating] = React.useState(false);

  // Initialize edited values from content
  React.useEffect(() => {
    const initial: Record<string, string> = {};
    content.forEach((item) => {
      initial[item.id] = item.value || "";
    });
    setEditedValues(initial);
  }, [content]);

  // Handle value change
  const handleValueChange = (id: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [id]: value }));
  };

  // Check if a value has been modified
  const hasChanged = (id: string): boolean => {
    const original = content.find((c) => c.id === id)?.value || "";
    return editedValues[id] !== original;
  };

  // Get all changed items
  const getChangedItems = (): BulkContentUpdate[] => {
    return content
      .filter((item) => hasChanged(item.id))
      .map((item) => ({
        id: item.id,
        value: editedValues[item.id],
      }));
  };

  // Count changes
  const changedCount = content.filter((item) => hasChanged(item.id)).length;

  // Reset all changes
  const handleReset = () => {
    const initial: Record<string, string> = {};
    content.forEach((item) => {
      initial[item.id] = item.value || "";
    });
    setEditedValues(initial);
    toast.info("Changes reset");
  };

  // Save all changes
  const handleSave = async () => {
    const changes = getChangedItems();
    if (changes.length === 0) {
      toast.info("No changes to save");
      return;
    }

    setIsSaving(true);
    if (autoTranslate) {
      setIsTranslating(true);
    }

    try {
      if (autoTranslate) {
        // Save with translation for each changed item
        const results = await Promise.all(
          changes.map(async (change) => {
            const item = content.find((c) => c.id === change.id);
            if (!item) return { success: false, error: "Item not found" };

            return updateContentWithTranslation(
              change.id,
              change.value,
              locale as Locale,
              item.namespace || namespace,
              item.key || "",
              true
            );
          })
        );

        const errors = results.filter((r) => r.error);
        const translatedCount = results.filter(
          (r) => r.translatedLocales && r.translatedLocales.length > 1
        ).length;

        if (errors.length > 0 && errors.some((e) => !e.success)) {
          toast.error(`Some updates failed: ${errors.map((e) => e.error).join(", ")}`);
        } else if (errors.length > 0) {
          toast.warning(
            `Saved ${changes.length} change(s) with ${translatedCount} translated. Some translations had issues.`
          );
        } else {
          toast.success(
            `Saved and translated ${changes.length} change(s) to all languages!`
          );
        }
      } else {
        // Regular bulk update without translation
        const result = await bulkUpdateContent(changes);
        if (result.success) {
          toast.success(`Saved ${changes.length} change(s) successfully`);
        } else {
          toast.error(result.error || "Failed to save changes");
        }
      }
      onSaveSuccess?.();
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
      setIsTranslating(false);
    }
  };

  // Filter content by search
  const filteredContent = content.filter(
    (item) =>
      (item.key?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.value?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Group filtered content
  const groupedContent = groupContentByPrefix(filteredContent);
  const groupKeys = Object.keys(groupedContent).sort();

  // Expand all groups initially or when there's a search
  React.useEffect(() => {
    if (searchQuery) {
      setExpandedGroups(groupKeys);
    }
  }, [searchQuery, groupKeys]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 bg-background/95 backdrop-blur py-3 z-10 border-b">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search keys or values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <Badge variant="secondary">
              {filteredContent.length} result{filteredContent.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {changedCount > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              {changedCount} unsaved change{changedCount !== 1 ? "s" : ""}
            </Badge>
          )}
          
          {/* Auto-translate toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-background">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="auto-translate" className="text-sm font-normal cursor-pointer">
              Auto-translate
            </Label>
            <Switch
              id="auto-translate"
              checked={autoTranslate}
              onCheckedChange={setAutoTranslate}
              disabled={isSaving}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={changedCount === 0 || isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={changedCount === 0 || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isTranslating ? "Translating..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Content Groups */}
      {filteredContent.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {searchQuery
              ? `No content matching "${searchQuery}"`
              : "No content found in this section"}
          </p>
        </Card>
      ) : (
        <Accordion
          type="multiple"
          value={expandedGroups}
          onValueChange={setExpandedGroups}
          className="space-y-2"
        >
          {groupKeys.map((prefix) => {
            const items = groupedContent[prefix];
            const groupChangedCount = items.filter((item) => hasChanged(item.id)).length;

            return (
              <AccordionItem
                key={prefix}
                value={prefix}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatPrefixForDisplay(prefix)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {items.length} key{items.length !== 1 ? "s" : ""}
                    </Badge>
                    {groupChangedCount > 0 && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                        {groupChangedCount} modified
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-1 pt-2">
                    {items.map((item) => (
                      <ContentField
                        key={item.id}
                        item={item}
                        value={editedValues[item.id] || ""}
                        onChange={handleValueChange}
                        hasChanged={hasChanged(item.id)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
