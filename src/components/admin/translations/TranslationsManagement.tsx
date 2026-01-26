"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";
import {
  getTranslationsAction,
  getTranslationStatsAction,
  upsertTranslationAction,
  deleteTranslationAction,
  compareTranslationsAction,
  getAvailableLanguagesAction,
} from "@/src/actions/translations";
import type { UITranslation } from "@/src/lib/db/schema/translations";
import { Pencil, Trash2, Plus, Download, Upload, Search } from "lucide-react";

export function TranslationsManagement() {
  const t = useTranslations("adminSettings.translations");
  const [translations, setTranslations] = useState<UITranslation[]>([]);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [filteredTranslations, setFilteredTranslations] = useState<UITranslation[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedNamespace, setSelectedNamespace] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingTranslation, setEditingTranslation] = useState<UITranslation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state for editing/creating
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    namespace: "",
    language: selectedLanguage,
  });

  // Load available languages
  useEffect(() => {
    loadAvailableLanguages();
  }, []);

  // Load translations when language or namespace changes
  useEffect(() => {
    loadTranslations();
  }, [selectedLanguage, selectedNamespace]);

  // Filter translations based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = translations.filter(
        (trans) =>
          trans.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trans.value.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTranslations(filtered);
    } else {
      setFilteredTranslations(translations);
    }
  }, [searchQuery, translations]);

  const loadAvailableLanguages = async () => {
    const result = await getAvailableLanguagesAction();
    if (result.success && result.data) {
      setAvailableLanguages(result.data);
    }
  };

  const loadTranslations = async () => {
    setLoading(true);
    const result = await getTranslationsAction(selectedLanguage);
    if (result.success && result.data) {
      let data = result.data;
      if (selectedNamespace !== "all") {
        data = data.filter((t) => t.namespace === selectedNamespace);
      }
      setTranslations(data);
      setFilteredTranslations(data);
    }
    
    // Load stats
    const statsResult = await getTranslationStatsAction(selectedLanguage);
    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data);
    }
    
    setLoading(false);
  };

  const handleEdit = (translation: UITranslation) => {
    setEditingTranslation(translation);
    setFormData({
      key: translation.key,
      value: translation.value,
      namespace: translation.namespace,
      language: translation.language,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTranslation(null);
    setFormData({
      key: "",
      value: "",
      namespace: selectedNamespace !== "all" ? selectedNamespace : "",
      language: selectedLanguage,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.key || !formData.value || !formData.namespace) {
      toast.error("Please fill in all required fields");
      return;
    }

    const result = await upsertTranslationAction(formData);
    if (result.success) {
      toast.success(editingTranslation ? "Translation updated" : "Translation created");
      
      // Show warning if there is one
      if (result.warning) {
        toast.warning(result.warning);
      }
      
      setIsDialogOpen(false);
      loadTranslations();
    } else {
      toast.error(result.error || "Failed to save translation");
      
      // Show suggestion if available
      if (result.suggestion) {
        toast.info(result.suggestion);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this translation?")) {
      return;
    }

    const result = await deleteTranslationAction(id);
    if (result.success) {
      toast.success("Translation deleted");
      loadTranslations();
    } else {
      toast.error(result.error || "Failed to delete translation");
    }
  };

  const compareLanguages = async () => {
    const targetLang = prompt("Compare with language code (e.g., 'fi', 'en'):");
    if (!targetLang) return;

    const result = await compareTranslationsAction(selectedLanguage, targetLang);
    if (result.success && result.data) {
      const { missingInTarget, coverage, sourceCount, targetCount } = result.data;
      alert(
        `Comparison Results:\n\nSource (${selectedLanguage}): ${sourceCount} translations\nTarget (${targetLang}): ${targetCount} translations\nCoverage: ${coverage}%\nMissing keys in ${targetLang}: ${missingInTarget.length}\n\nMissing keys:\n${missingInTarget.slice(0, 10).join("\n")}${missingInTarget.length > 10 ? "\n..." : ""}`
      );
    }
  };

  const namespaces = stats?.byNamespace ? Object.keys(stats.byNamespace) : [];

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      {showInfoBanner && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="text-blue-600 mt-0.5">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">UI Translations Only</h3>
                  <p className="text-sm text-blue-800">
                    This section manages <strong>UI/Interface translations</strong> (buttons, labels, messages). 
                    Content translations are managed separately:
                  </p>
                  <ul className="text-sm text-blue-800 mt-2 ml-4 space-y-1">
                    <li>• <strong>Pages</strong> → Page Builder (/admin/page-builder)</li>
                    <li>• <strong>Events</strong> → Events Manager (/admin/events)</li>
                    <li>• <strong>Campaigns</strong> → Campaigns Manager (/admin/campaigns)</li>
                    <li>• <strong>Posts/Articles</strong> → Articles Manager (/admin/articles)</li>
                    <li>• <strong>Navigation</strong> → Content Settings (/admin/content)</li>
                  </ul>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowInfoBanner(false)}
                className="text-blue-600 hover:text-blue-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Translations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.needsReview}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Namespaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{namespaces.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Translations</CardTitle>
              <CardDescription>
                Edit, create, and manage UI translations for all languages
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={compareLanguages} variant="outline" size="sm">
                Compare
              </Button>
              <Button onClick={handleCreate} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Translation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="language">Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fi">Finnish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="namespace">Namespace</Label>
              <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                <SelectTrigger id="namespace">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Namespaces</SelectItem>
                  {namespaces.map((ns, index) => (
                    <SelectItem key={`${ns}-${index}`} value={ns}>
                      {ns} ({stats.byNamespace[ns]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by key or value..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* Translations Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Namespace</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading translations...
                    </TableCell>
                  </TableRow>
                ) : filteredTranslations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No translations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTranslations.map((translation) => (
                    <TableRow key={translation.id}>
                      <TableCell className="font-mono text-sm">
                        {translation.key}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {translation.value}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{translation.namespace}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(translation)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(translation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTranslation ? "Edit Translation" : "Create Translation"}
            </DialogTitle>
            <DialogDescription>
              {editingTranslation
                ? "Update the translation details below"
                : "Add a new translation entry"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dialog-key">Key *</Label>
              <Input
                id="dialog-key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="e.g., common.loading"
                disabled={!!editingTranslation}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dialog-value">Value *</Label>
              <Textarea
                id="dialog-value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Translation text"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dialog-namespace">Namespace *</Label>
              <Input
                id="dialog-namespace"
                value={formData.namespace}
                onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
                placeholder="e.g., common, admin, navigation"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dialog-language">Language *</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
                disabled={!!editingTranslation}
              >
                <SelectTrigger id="dialog-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fi">Finnish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingTranslation ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
