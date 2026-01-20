"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import {
  usePages,
  useDeletePage,
  useDuplicatePage,
} from "@/src/lib/hooks/use-pages";
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

export function PageBuilderList() {
  const t = useTranslations("adminSettings.pageBuilder");
  const router = useRouter();
  const { data: pages = [], isLoading } = usePages();
  const deletePage = useDeletePage();
  const duplicatePage = useDuplicatePage();
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);

  const handleDelete = async (slug: string) => {
    try {
      await deletePage.mutateAsync(slug);
      toast.success(t("deleteDialog.success"));
      setDeleteConfirmSlug(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("deleteDialog.error"));
    }
  };

  const handleDuplicate = async (slug: string) => {
    try {
      await duplicatePage.mutateAsync(slug);
      toast.success(t("duplicate.success"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("duplicate.error"));
    }
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
        <Button onClick={() => router.push("/en/admin/page-builder/new")}>
          <Plus className="h-4 w-4 mr-2" /> {t("newButton")}
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
              <Button onClick={() => router.push("/en/admin/page-builder/new")}>
                {t("createFirstPage")}
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
                  key={page.slug}
                  className="grid grid-cols-12 gap-4 items-center hover:bg-secondary/5 p-2 rounded-md"
                >
                  <div className="col-span-4 flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <LayoutTemplate className="h-4 w-4 text-primary" />
                    </div>
                    <span className="truncate">{page.title || page.slug}</span>
                  </div>
                  <div className="col-span-3 font-mono text-xs text-muted-foreground truncate">
                    {page.path}
                  </div>
                  <div className="col-span-2">
                    <Badge variant={page.status === "published" ? "default" : "secondary"}>
                      {page.status}
                    </Badge>
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/en/admin/page-builder/${page.slug}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> {t("actions.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(page.slug)}
                      title={t("actions.duplicate")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(page.path, "_blank")}
                      title={t("actions.preview")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmSlug(page.slug)}
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
        open={!!deleteConfirmSlug}
        onOpenChange={() => setDeleteConfirmSlug(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.message", { slug: deleteConfirmSlug || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmSlug && handleDelete(deleteConfirmSlug)}
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
