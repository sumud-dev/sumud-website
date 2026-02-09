/**
 * Page Content Sync Service - Enhanced
 * 
 * CRITICAL: Syncs structure (layout/components) while preserving text content per language
 * 
 * Strategy:
 * - Layout/positioning/components → SYNC across languages
 * - Text content (labels, paragraphs) → KEEP per language
 */

import type { SerializedNodes, SerializedNode } from '@craftjs/core';

export type SyncStrategy = 'structure-only' | 'full-override';

interface SyncOptions {
  strategy: SyncStrategy;
  preserveTextContent: boolean;
}

/**
 * DEFAULT: Structure-only sync to preserve translations
 * CRITICAL: This prevents overwriting language-specific content
 */
export const DEFAULT_SYNC_OPTIONS: SyncOptions = {
  strategy: 'structure-only',
  preserveTextContent: true,
};

/**
 * Text-bearing properties that should be preserved per language
 */
const TEXT_PROPERTIES = [
  'text',
  'content', 
  'label',
  'title',
  'description',
  'placeholder',
  'buttonText',
  'heading',
  'subheading',
  'caption',
  'alt',
  'value',
  'name',
] as const;

/**
 * Component types that contain text content
 */
const TEXT_COMPONENTS = [
  'Text',
  'Button',
  'TextArea',
  'Badge',
  'Alert',
  'Heading',
  'Paragraph',
  'Link',
  'CardBlock',
  'Section',
  'HeritageHero',
  'NewsSection',
  'EventsSection',
  'CampaignsSection',
  'NewsletterSection',
] as const;

/**
 * Check if a node contains text content
 */
function isTextNode(node: SerializedNode): boolean {
  const componentType = typeof node.type === 'string' 
    ? node.type 
    : node.type?.resolvedName;
  return TEXT_COMPONENTS.includes(componentType as any);
}

/**
 * Check if a property should be preserved (is it text content?)
 */
function isTextProperty(key: string): boolean {
  return TEXT_PROPERTIES.includes(key as any);
}

/**
 * Extract text properties from node props
 */
function extractTextProperties(props: Record<string, any>): Record<string, any> {
  const textProps: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(props)) {
    if (isTextProperty(key)) {
      textProps[key] = value;
    }
  }
  
  return textProps;
}

/**
 * Merge new structure with existing text content
 * 
 * CRITICAL FUNCTION: This is what prevents overwriting translations
 * 
 * Logic:
 * 1. Take NEW structure (components, layout, styling)
 * 2. For text components, preserve OLD text content
 * 3. Result: Updated layout with preserved translations
 */
export function mergeStructurePreservingText(
  newContent: SerializedNodes,
  existingContent: SerializedNodes | null
): SerializedNodes {
  // If no existing content, use new content as-is
  if (!existingContent || !existingContent.ROOT) {
    console.log('[mergeStructurePreservingText] No existing content, using new structure');
    return newContent;
  }

  const merged: SerializedNodes = {};
  
  // Track statistics for logging
  let preserved = 0;
  let updated = 0;
  let added = 0;

  // Process each node in NEW content
  for (const [nodeId, newNode] of Object.entries(newContent)) {
    const existingNode = existingContent[nodeId];
    
    // Case 1: Node exists in both - merge structure with preserved text
    if (existingNode) {
      if (isTextNode(newNode)) {
        // Extract text from existing (OLD translations)
        const preservedText = extractTextProperties(existingNode.props || {});
        
        // Use new structure but merge in preserved text
        merged[nodeId] = {
          ...newNode,
          props: {
            ...newNode.props,
            ...preservedText, // Preserved text overwrites new text
          },
        };
        
        if (Object.keys(preservedText).length > 0) {
          preserved++;
          console.log(`[mergeStructurePreservingText] Preserved text for ${nodeId}:`, 
            Object.keys(preservedText));
        }
      } else {
        // Non-text node: use new structure completely
        merged[nodeId] = newNode;
        updated++;
      }
    } 
    // Case 2: New node doesn't exist in old - add it
    else {
      merged[nodeId] = newNode;
      added++;
    }
  }

  console.log('[mergeStructurePreservingText] Merge complete:', {
    preserved,
    updated,
    added,
    total: Object.keys(merged).length,
  });

  return merged;
}

/**
 * Check if content has structural differences (not just text)
 * Used to determine if sync is needed
 */
export function hasStructuralChanges(
  content1: SerializedNodes,
  content2: SerializedNodes
): boolean {
  // Different node count = structural change
  const keys1 = Object.keys(content1);
  const keys2 = Object.keys(content2);
  
  if (keys1.length !== keys2.length) {
    return true;
  }

  // Check if same nodes exist
  const nodeIds1 = new Set(keys1);
  const nodeIds2 = new Set(keys2);
  
  for (const id of nodeIds1) {
    if (!nodeIds2.has(id)) {
      return true;
    }
  }

  // Check if node types changed
  for (const id of keys1) {
    const node1 = content1[id];
    const node2 = content2[id];
    
    const type1 = typeof node1.type === 'string' ? node1.type : node1.type?.resolvedName;
    const type2 = typeof node2.type === 'string' ? node2.type : node2.type?.resolvedName;
    
    if (type1 !== type2) {
      return true;
    }
    
    // Check parent changes (layout restructure)
    if (node1.parent !== node2.parent) {
      return true;
    }
  }

  return false;
}

/**
 * Validates content structure before syncing
 */
export function validateContentStructure(content: SerializedNodes): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!content || typeof content !== 'object') {
    errors.push('Content must be an object');
  }

  if (!('ROOT' in content)) {
    errors.push('Content missing ROOT node');
  }

  if (Object.keys(content).length === 0) {
    errors.push('Content is empty');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Prepares content for sync based on strategy
 * 
 * CRITICAL: Always use structure-only sync to preserve translations
 */
export function prepareContentForSync(
  sourceContent: SerializedNodes,
  targetContent: SerializedNodes | null,
  options: SyncOptions = DEFAULT_SYNC_OPTIONS
): SerializedNodes {
  console.log('[prepareContentForSync] Preparing content:', {
    strategy: options.strategy,
    preserveText: options.preserveTextContent,
    hasTargetContent: !!targetContent,
  });

  // Structure-only: Merge structure while preserving text
  if (options.strategy === 'structure-only') {
    return mergeStructurePreservingText(sourceContent, targetContent);
  }

  // Full override: Use source as-is (DANGEROUS - only for initial setup)
  console.warn('[prepareContentForSync] WARNING: Using full-override strategy');
  return sourceContent;
}

/**
 * Logs sync operation details
 */
export function logSyncOperation(
  pageId: string,
  sourceLanguage: string,
  targetLanguages: string[],
  nodeCount: number,
  preservedText: boolean
): void {
  console.log('[ContentSync] Syncing content:', {
    pageId,
    sourceLanguage,
    targetLanguages,
    nodeCount,
    preservedText: preservedText ? '✓ Text preserved' : '✗ Text NOT preserved',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Extract translatable text from content
 * Returns map of nodeId -> text properties for translation
 */
export function extractTranslatableText(content: SerializedNodes): Map<string, Record<string, string>> {
  const translatableMap = new Map<string, Record<string, string>>();

  for (const [nodeId, node] of Object.entries(content)) {
    if (isTextNode(node) && node.props) {
      const textProps = extractTextProperties(node.props);
      
      if (Object.keys(textProps).length > 0) {
        translatableMap.set(nodeId, textProps);
      }
    }
  }

  return translatableMap;
}

/**
 * Apply translations to content
 */
export function applyTranslations(
  content: SerializedNodes,
  translations: Map<string, Record<string, string>>
): SerializedNodes {
  const translated = { ...content };

  for (const [nodeId, translatedProps] of translations.entries()) {
    if (translated[nodeId]) {
      translated[nodeId] = {
        ...translated[nodeId],
        props: {
          ...translated[nodeId].props,
          ...translatedProps,
        },
      };
    }
  }

  return translated;
}