"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { data: pages = [], isLoading } = usePages();
  const deletePage = useDeletePage();
  const duplicatePage = useDuplicatePage();
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);

  const handleDelete = async (slug: string) => {
    try {
      await deletePage.mutateAsync(slug);
      toast.success("Page deleted successfully");
      setDeleteConfirmSlug(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete page");
    }
  };

  const handleDuplicate = async (slug: string) => {
    try {
      await duplicatePage.mutateAsync(slug);
      toast.success("Page duplicated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate page");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Page Builder</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage pages with the visual page builder.
          </p>
        </div>
        <Button onClick={() => router.push("/en/admin/page-builder/new")}>
          <Plus className="h-4 w-4 mr-2" /> Create New Page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pages</CardTitle>
          <CardDescription>Manage your custom pages</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="animate-spin h-6 w-6 text-primary" />
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No pages created yet.</p>
              <Button onClick={() => router.push("/en/admin/page-builder/new")}>
                Create Your First Page
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 font-medium text-sm px-2">
                <div className="col-span-4">Title</div>
                <div className="col-span-3">Path</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3 text-right">Actions</div>
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
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(page.slug)}
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(page.path, "_blank")}
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmSlug(page.slug)}
                      title="Delete"
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the page
              &quot;{deleteConfirmSlug}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmSlug && handleDelete(deleteConfirmSlug)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
