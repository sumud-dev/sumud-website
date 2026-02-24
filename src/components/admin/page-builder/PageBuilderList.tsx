"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  Edit,
  Eye,
  LayoutTemplate,
  Plus,
  Trash2,
  Copy,
  Loader2,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { createPage, deletePage } from "@/src/actions/pages.actions";

interface Page {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

export function PageBuilderList() {
  const t = useTranslations("adminSettings.pageBuilder");
  const router = useRouter();
  const locale = useLocale() as "en" | "fi";
  const queryClient = useQueryClient();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: pages = [], isLoading } = useQuery<Page[]>({
    queryKey: ["pages"],
    queryFn: async () => {
      const response = await fetch("/api/pages");
      const result = await response.json();
      return result.data || [];
    },
  });

  const createPageMutation = useMutation({
    mutationFn: async () => {
      // Generate unique slug with timestamp
      const timestamp = Date.now();
      const slug = `new-page-${timestamp}`;
      const page = await createPage(slug, `New Page`);
      // Ensure page is created as draft (this should be the default in createPage action)
      return page;
    },
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success(t("messages.createSuccess") || "Page created successfully");
      router.push(`/${locale}/admin/page-builder/${page.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("messages.createError") || "Failed to create page");
    },
  });

  const handleCreatePage = () => {
    createPageMutation.mutate();
  };

  const handleDuplicate = async (_id: string) => {
    try {
      // TODO: Implement page duplication logic
      toast.success(t("messages.duplicateSuccess") || "Page duplicated successfully");
    } catch (error) {
      toast.error(t("messages.duplicateError") || "Failed to duplicate page");
      console.error("Error duplicating page:", error);
    }
  };

  const deletePageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      await deletePage(pageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success(t("messages.deleteSuccess") || "Page deleted successfully");
      setDeleteConfirmId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("messages.deleteError") || "Failed to delete page");
      setDeleteConfirmId(null);
    },
  });

  const handleDelete = async (id: string) => {
    deletePageMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button onClick={handleCreatePage} disabled={createPageMutation.isPending}>
          {createPageMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("createDialog.creating") || "Creating..."}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" /> {t("newButton")}
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("allPages")}</CardTitle>
          <CardDescription>{t("managePages")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="animate-spin h-6 w-6 text-primary" />
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{t("noPagesYet")}</p>
              <Button onClick={handleCreatePage} disabled={createPageMutation.isPending}>
                {createPageMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("createDialog.creating") || "Creating..."}
                  </>
                ) : (
                  t("createFirstPage")
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 font-medium text-sm px-2">
                <div className="col-span-4">{t("table.title")}</div>
                <div className="col-span-3">{t("table.path")}</div>
                <div className="col-span-2">{t("table.status")}</div>
                <div className="col-span-3 text-right">{t("table.actions")}</div>
              </div>
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="grid grid-cols-12 gap-4 items-center hover:bg-secondary/5 p-2 rounded-md"
                >
                  <div className="col-span-4 flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <LayoutTemplate className="h-4 w-4 text-primary" />
                    </div>
                    <span className="truncate">{page.title || page.slug}</span>
                  </div>
                  <div className="col-span-3 font-mono text-xs text-muted-foreground truncate">
                    {page.slug === '/' ? '/' : `/${page.slug}`}
                  </div>
                  <div className="col-span-2">
                    <Badge variant={page.status === "published" ? "default" : "secondary"}>
                      {t(`status.${page.status}`)}
                    </Badge>
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/${locale}/admin/page-builder/${page.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> {t("actions.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(page.id)}
                      title={t("actions.duplicate")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(`/${page.id}`, "_blank")}
                      title={t("actions.preview")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmId(page.id)}
                      title={t("actions.delete")}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>



      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.message", { slug: pages.find(p => p.id === deleteConfirmId)?.slug || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
