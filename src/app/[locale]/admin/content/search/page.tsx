"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Globe, Loader2, Search, X, Edit2 } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Link } from "@/src/i18n/navigation";
import { searchContent, updateContent } from "@/src/actions/content.actions";
import type { SiteContent, Locale } from "@/src/types/Content";

export default function ContentSearchPage() {
  const searchParams = useSearchParams();
  const initialLocale = (searchParams.get("locale") as Locale) || "en";

  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeLocale, setActiveLocale] = React.useState<Locale | undefined>(
    initialLocale
  );
  const [results, setResults] = React.useState<SiteContent[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [editItem, setEditItem] = React.useState<SiteContent | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // Search when query changes (debounced)
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const result = await searchContent(searchQuery, activeLocale);
        if (result.data) {
          setResults(result.data);
        }
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Search failed");
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeLocale]);

  // Open edit dialog
  const handleEdit = (item: SiteContent) => {
    setEditItem(item);
    setEditValue(item.value || "");
  };

  // Save edit
  const handleSave = async () => {
    if (!editItem) return;

    setIsSaving(true);
    try {
      const result = await updateContent(editItem.id, editValue);
      if (result.success) {
        toast.success("Content updated");
        // Update local results
        setResults((prev) =>
          prev.map((item) =>
            item.id === editItem.id ? { ...item, value: editValue } : item
          )
        );
        setEditItem(null);
      } else {
        toast.error(result.error || "Failed to update");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link href="/admin/content">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Content
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Search className="h-8 w-8" />
            Search All Content
          </h1>
          <p className="text-muted-foreground mt-1">
            Search across all translations by key or value
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search keys or values (min 2 characters)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
            autoFocus
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

        <div className="flex items-center gap-2">
          <Button
            variant={activeLocale === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveLocale(undefined)}
          >
            All Languages
          </Button>
          {(["en", "ar", "fi"] as Locale[]).map((locale) => (
            <Button
              key={locale}
              variant={activeLocale === locale ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveLocale(locale)}
            >
              {locale.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : searchQuery.length < 2 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Enter at least 2 characters to search</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No results found for &quot;{searchQuery}&quot;</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{results.length} results</Badge>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Locale</TableHead>
                  <TableHead className="w-[150px]">Section</TableHead>
                  <TableHead className="w-[250px]">Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {(item.locale || "").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {item.namespace}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded break-all">
                        {item.key}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-[400px]">
                      <p className="truncate text-sm">{item.value}</p>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              <span className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  {(editItem?.locale || "").toUpperCase()}
                </Badge>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {editItem?.namespace}.{editItem?.key}
                </code>
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-value">Value</Label>
              <Textarea
                id="edit-value"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="min-h-[150px]"
                placeholder="Enter content..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
