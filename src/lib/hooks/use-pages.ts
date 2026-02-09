'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { getPublishedPage } from '@/src/actions/pages.actions';
import { queryKeys } from '@/src/lib/react-query/query-keys';
import type { SerializedNodes } from '@craftjs/core';
import type { Language } from '@/src/lib/types/page';

interface PageData {
  id: string;
  slug: string;
  title: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  translations: {
    en?: {
      blocks?: Array<{
        id: string;
        type: string;
        content: unknown;
      }>;
    };
    fi?: {
      blocks?: Array<{
        id: string;
        type: string;
        content: unknown;
      }>;
    };
  };
}

/**
 * Hook to fetch a published page by slug
 * Automatically includes the current locale in the request
 */
export function usePage(slug: string) {
  const locale = useLocale() as Language;
  
  const { data, isLoading, error, isError } = useQuery<PageData | null>({
    queryKey: queryKeys.pages.detail(slug, locale),
    queryFn: async () => {
      const result = await getPublishedPage(slug, locale);
      
      if (!result) {
        return null;
      }
      
      // Transform the response to include a translations structure
      // that matches the expected format from components
      const pageData: PageData = {
        ...result.page,
        translations: {
          [locale]: {
            blocks: extractBlocksFromContent(result.content as SerializedNodes),
          },
        },
      };
      
      return pageData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!slug, // Only run query if slug is provided
  });

  return {
    data: data ?? null,
    isLoading,
    error: isError ? error : null,
    isError,
  };
}

/**
 * Helper function to extract blocks from Craft.js serialized content
 * Converts SerializedNodes to a flat array of blocks for easier consumption
 */
function extractBlocksFromContent(content: SerializedNodes): Array<{
  id: string;
  type: string;
  content: unknown;
}> {
  if (!content) return [];
  
  const blocks: Array<{
    id: string;
    type: string;
    content: unknown;
  }> = [];
  
  // Iterate through serialized nodes
  Object.entries(content).forEach(([nodeId, node]) => {
    if (nodeId === 'ROOT') return; // Skip ROOT node
    
    // Extract relevant data from each node
    // node.type can be either a string or an object with resolvedName
    const nodeType = typeof node.type === 'string' 
      ? node.type 
      : node.type?.resolvedName || 'unknown';
    
    blocks.push({
      id: nodeId,
      type: nodeType,
      content: node.props || {},
    });
  });
  
  return blocks;
}
