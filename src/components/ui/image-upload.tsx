"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  folder?: string;
  maxSize?: number; // in MB
  aspectRatio?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  folder = "sumud",
  maxSize = 5,
  aspectRatio,
  className,
}: ImageUploadProps) {
  const t = useTranslations("common");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      setUploading(true);

      try {
        // Create FormData
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        // Upload to API route
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();
        onChange(data.secure_url);
      } catch (err) {
        console.error("Upload error:", err);
        setError(err instanceof Error ? err.message : "Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    },
    maxFiles: 1,
    maxSize: maxSize * 1024 * 1024,
    disabled: disabled || uploading,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === "file-too-large") {
        setError(t("upload.fileTooLarge", { maxSize }));
      } else if (rejection.errors[0]?.code === "file-invalid-type") {
        setError(t("upload.invalidFileType"));
      } else {
        setError(t("upload.error"));
      }
    },
  });

  const handleRemove = () => {
    setError(null);
    if (onRemove) {
      onRemove();
    } else {
      onChange("");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative group">
          <div
            className={cn(
              "relative overflow-hidden rounded-lg border bg-muted",
              aspectRatio ? `aspect-[${aspectRatio}]` : "aspect-video"
            )}
          >
            <Image
              src={value}
              alt="Upload preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive && "border-primary bg-primary/5",
            uploading && "opacity-50 cursor-not-allowed",
            disabled && "opacity-50 cursor-not-allowed",
            !value && !uploading && "hover:border-primary hover:bg-muted/50",
            aspectRatio ? `aspect-[${aspectRatio}]` : "aspect-video"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 h-full">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("upload.uploading")}
                </p>
              </>
            ) : (
              <>
                {isDragActive ? (
                  <Upload className="h-10 w-10 text-primary" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                )}
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {isDragActive
                      ? t("upload.dropHere")
                      : t("upload.dragDrop")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("upload.fileInfo", { maxSize })}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
