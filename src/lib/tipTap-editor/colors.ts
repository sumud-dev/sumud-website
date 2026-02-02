import { ColorOption } from '../types/editor';

/**
 * Predefined color palettes
 */

export const TEXT_COLORS: ColorOption[] = [
  { name: 'Black', value: '#000000', category: 'text' },
  { name: 'Dark Gray', value: '#374151', category: 'text' },
  { name: 'Gray', value: '#6b7280', category: 'text' },
  { name: 'Red', value: '#ef4444', category: 'text' },
  { name: 'Orange', value: '#f97316', category: 'text' },
  { name: 'Amber', value: '#f59e0b', category: 'text' },
  { name: 'Yellow', value: '#eab308', category: 'text' },
  { name: 'Lime', value: '#84cc16', category: 'text' },
  { name: 'Green', value: '#22c55e', category: 'text' },
  { name: 'Emerald', value: '#10b981', category: 'text' },
  { name: 'Teal', value: '#14b8a6', category: 'text' },
  { name: 'Cyan', value: '#06b6d4', category: 'text' },
  { name: 'Sky', value: '#0ea5e9', category: 'text' },
  { name: 'Blue', value: '#3b82f6', category: 'text' },
  { name: 'Indigo', value: '#6366f1', category: 'text' },
  { name: 'Violet', value: '#8b5cf6', category: 'text' },
  { name: 'Purple', value: '#a855f7', category: 'text' },
  { name: 'Fuchsia', value: '#d946ef', category: 'text' },
  { name: 'Pink', value: '#ec4899', category: 'text' },
  { name: 'Rose', value: '#f43f5e', category: 'text' },
];

export const BACKGROUND_COLORS: ColorOption[] = [
  { name: 'Light Yellow', value: '#fef3c7', category: 'background' },
  { name: 'Light Orange', value: '#fed7aa', category: 'background' },
  { name: 'Light Red', value: '#fee2e2', category: 'background' },
  { name: 'Light Pink', value: '#fce7f3', category: 'background' },
  { name: 'Light Purple', value: '#e9d5ff', category: 'background' },
  { name: 'Light Blue', value: '#dbeafe', category: 'background' },
  { name: 'Light Cyan', value: '#cffafe', category: 'background' },
  { name: 'Light Green', value: '#d1fae5', category: 'background' },
  { name: 'Light Gray', value: '#e5e7eb', category: 'background' },
  { name: 'Yellow', value: '#fbbf24', category: 'background' },
  { name: 'Orange', value: '#fb923c', category: 'background' },
  { name: 'Red', value: '#f87171', category: 'background' },
  { name: 'Pink', value: '#f472b6', category: 'background' },
  { name: 'Purple', value: '#c084fc', category: 'background' },
  { name: 'Blue', value: '#60a5fa', category: 'background' },
  { name: 'Cyan', value: '#22d3ee', category: 'background' },
  { name: 'Green', value: '#34d399', category: 'background' },
  { name: 'Gray', value: '#94a3b8', category: 'background' },
];

export const HIGHLIGHT_COLORS: ColorOption[] = [
  { name: 'Yellow Highlight', value: '#fef08a', category: 'highlight' },
  { name: 'Green Highlight', value: '#86efac', category: 'highlight' },
  { name: 'Blue Highlight', value: '#93c5fd', category: 'highlight' },
  { name: 'Pink Highlight', value: '#f9a8d4', category: 'highlight' },
  { name: 'Orange Highlight', value: '#fdba74', category: 'highlight' },
  { name: 'Purple Highlight', value: '#d8b4fe', category: 'highlight' },
];

/**
 * Apply color to selection
 */
export const applyTextColor = (color: string): string => {
  return `<span style="color: ${color};">`;
};

export const applyBackgroundColor = (color: string): string => {
  return `<span style="background-color: ${color}; padding: 2px 6px; border-radius: 3px;">`;
};

export const applyHighlight = (color: string): string => {
  return `<mark style="background-color: ${color}; padding: 2px 4px; border-radius: 2px;">`;
};

/**
 * Get all colors by category
 */
export const getColorsByCategory = (category: 'text' | 'background' | 'highlight'): ColorOption[] => {
  switch (category) {
    case 'text':
      return TEXT_COLORS;
    case 'background':
      return BACKGROUND_COLORS;
    case 'highlight':
      return HIGHLIGHT_COLORS;
    default:
      return [];
  }
};
