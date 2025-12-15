"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export interface PaginationData {
  page: number;
  pages: number;
  total: number;
  limit: number;
}

export interface EventsPaginationProps {
  pagination: PaginationData | undefined;
  onPageChange: (page: number) => void;
}

/**
 * Pagination component for events list.
 * Shows page numbers with previous/next navigation.
 */
export function EventsPagination({
  pagination,
  onPageChange,
}: EventsPaginationProps) {
  if (!pagination || pagination.pages <= 1) {
    return null;
  }

  const maxVisiblePages = 5;
  let startPage = Math.max(
    1,
    pagination.page - Math.floor(maxVisiblePages / 2)
  );
  const endPage = Math.min(
    pagination.pages,
    startPage + maxVisiblePages - 1
  );

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={pagination.page <= 1}
        className="text-[#1A1D14] border-2 border-[#2D3320]/40 hover:bg-[#781D32] hover:text-white hover:border-[#781D32] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#1A1D14] transition-all duration-200"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === pagination.page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className={
            page === pagination.page
              ? "bg-[#781D32] text-white hover:bg-[#5E1727] border-2 border-[#781D32] shadow-lg font-semibold"
              : "text-[#1A1D14] border-2 border-[#2D3320]/40 hover:bg-[#781D32]/10 hover:border-[#781D32]/50 font-medium transition-all duration-200"
          }
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={pagination.page >= pagination.pages}
        className="text-[#1A1D14] border-2 border-[#2D3320]/40 hover:bg-[#781D32] hover:text-white hover:border-[#781D32] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#1A1D14] transition-all duration-200"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
