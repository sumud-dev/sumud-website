// Main Editor Component
export { RichTextEditor } from './RichTextEditor';

// Types
export type {
  EditorProps,
  ToolbarAction,
  ToolbarGroup,
  DialogState,
  TemplateType,
  Template,
  ColorOption,
} from '../types/editor';

// Hooks (for advanced usage)
export {
  useEditorDialogs,
  useEditorHistory,
  useTemplateInsertion,
  useColorPicker,
} from '../hooks/use-editor';

// Utilities (for advanced usage)
export {
  getTemplate,
  generateTable,
  sanitizeHtml,
  templateContent,
} from './templates/editor-templates';

export {
  TEXT_COLORS,
  BACKGROUND_COLORS,
  HIGHLIGHT_COLORS,
  applyTextColor,
  applyBackgroundColor,
  applyHighlight,
  getColorsByCategory,
} from './colors';
