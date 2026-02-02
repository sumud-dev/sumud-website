# Rich Text Editor - Clean Architecture

A modern, user-friendly WYSIWYG editor built with React and TypeScript following SOLID principles and clean architecture patterns.

## 🎯 Features

### For Users
- **Visual Editing**: See formatting in real-time, like Microsoft Word
- **Split View**: Editor on left, live preview on right
- **No Code Required**: No HTML/Markdown visible to users
- **Easy Dialogs**: Simple popups for links, images, videos, tables
- **Professional Templates**: Pre-built layouts, content sections, and callouts
- **Rich Formatting**: Text styles, colors, alignment, lists, and more
- **Media Support**: Images, videos (YouTube/Vimeo), tables
- **Smart Lists**: Auto-continue numbered lists (1. → 2. → 3.)

### For Developers
- **Clean Architecture**: Separation of concerns
- **Type-Safe**: Full TypeScript support
- **Composable**: Reusable components and hooks
- **DRY**: No code duplication
- **SOLID Principles**: Single responsibility, open/closed, etc.
- **Testable**: Business logic separated from UI
- **Extensible**: Easy to add new features

## 📁 Architecture

```
editor/
├── types.ts                  # TypeScript definitions
├── templates.ts              # Template content & utilities (pure functions)
├── colors.ts                 # Color palettes & utilities (pure functions)
├── hooks.ts                  # Custom hooks (business logic)
├── dialogs.tsx               # Reusable dialog components (UI)
├── TemplateGallery.tsx       # Template selection component (UI)
├── WYSIWYGEditor.tsx         # Visual editor component (UI)
├── EditorToolbar.tsx         # Toolbar component (UI)
├── RichTextEditor.tsx        # Main orchestrator component
├── index.ts                  # Public API exports
└── README.md                 # This file
```

### Design Principles

#### 1. **Separation of Concerns (SoC)**
- **Business Logic** → `hooks.ts`, `templates.ts`, `colors.ts`
- **UI Components** → `*.tsx` files
- **Types** → `types.ts`

#### 2. **Single Responsibility Principle (SRP)**
- Each file has ONE clear purpose
- Each function does ONE thing
- Each component renders ONE concept

#### 3. **DRY (Don't Repeat Yourself)**
- Shared logic in custom hooks
- Reusable dialog components
- Centralized type definitions

#### 4. **Open/Closed Principle**
- Easy to add new templates without modifying existing code
- Easy to add new toolbar buttons without changing structure
- Extensible through composition

#### 5. **Dependency Inversion**
- Components depend on abstractions (interfaces/types)
- Business logic doesn't depend on UI
- Pure functions for transformations

## 🚀 Usage

### Basic Usage

```tsx
import { RichTextEditor } from './editor';

function MyComponent() {
  const [content, setContent] = React.useState('');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start typing..."
    />
  );
}
```

### With Form Integration

```tsx
import { RichTextEditor } from './editor';
import { useForm } from 'react-hook-form';

function ArticleForm() {
  const { register, setValue, watch } = useForm();
  const content = watch('content');

  return (
    <form>
      <RichTextEditor
        value={content || ''}
        onChange={(value) => setValue('content', value)}
        placeholder="Write your article..."
      />
    </form>
  );
}
```

### Custom Hook Usage

```tsx
import { useEditorDialogs, useTemplateInsertion } from './editor';

function CustomEditor() {
  const { dialogs, openDialog, closeDialog } = useEditorDialogs();
  const { insertTemplate } = useTemplateInsertion();

  // Build your own editor UI with these hooks
}
```

## 🎨 Templates

### Available Templates

#### Layouts
- **Card**: Bordered content card with shadow
- **Two Columns**: Side-by-side layout
- **Three Columns**: Three-column grid

#### Content Sections
- **Hero**: Eye-catching header with gradient
- **Features**: Grid of feature cards with icons
- **Pricing**: Three-tier pricing table
- **Testimonial**: Customer quote with profile
- **FAQ**: Collapsible questions and answers
- **Timeline**: Chronological events

#### Callouts
- **Info**: Blue callout for helpful information
- **Warning**: Yellow callout for important notes
- **Success**: Green callout for confirmations
- **Error**: Red callout for critical issues

### Adding New Templates

1. Add type to `types.ts`:
```typescript
export type TemplateType = 
  | 'existing-types'
  | 'my-new-template';
```

2. Add content to `templates.ts`:
```typescript
export const templateContent: Record<TemplateType, string> = {
  // ... existing templates
  'my-new-template': `<div>My template HTML</div>`,
};
```

3. Add to gallery in `TemplateGallery.tsx`:
```typescript
const TEMPLATES: Template[] = [
  // ... existing templates
  {
    id: 'my-new-template',
    name: 'My Template',
    description: 'Description here',
    icon: MyIcon,
    category: 'content',
  },
];
```

## 🎨 Customization

### Colors

Colors are centralized in `colors.ts`:
- **TEXT_COLORS**: 20 predefined text colors
- **BACKGROUND_COLORS**: 18 background colors
- **HIGHLIGHT_COLORS**: 6 highlight colors

### Styling

The editor uses Tailwind CSS utility classes. Customize by:
1. Modifying the `prose` classes in `WYSIWYGEditor.tsx`
2. Adjusting toolbar styles in `EditorToolbar.tsx`
3. Customizing dialog appearance in `dialogs.tsx`

## 🧪 Testing

### Unit Tests (Recommended)

```typescript
// Test hooks
import { renderHook, act } from '@testing-library/react-hooks';
import { useEditorHistory } from './hooks';

test('should undo changes', () => {
  const { result } = renderHook(() => useEditorHistory('initial'));
  
  act(() => {
    result.current.addToHistory('change 1');
    result.current.addToHistory('change 2');
  });
  
  expect(result.current.canUndo).toBe(true);
  
  act(() => {
    const previous = result.current.undo();
    expect(previous).toBe('change 1');
  });
});
```

```typescript
// Test utilities
import { generateTable } from './templates';

test('should generate table with correct dimensions', () => {
  const table = generateTable(3, 4);
  expect(table).toContain('<th>Header 1</th>');
  expect(table).toContain('<th>Header 4</th>');
  expect(table.match(/<tr>/g)).toHaveLength(4); // 1 header + 3 body rows
});
```

## 🔧 Extending the Editor

### Add a New Toolbar Button

1. Add handler in `RichTextEditor.tsx`:
```typescript
const handleMyFeature = () => {
  // Your logic here
  execCommand('myCommand');
};
```

2. Add button in `EditorToolbar.tsx`:
```typescript
<ToolbarButton 
  onClick={onMyFeature} 
  icon={MyIcon} 
  title="My Feature" 
/>
```

3. Pass handler as prop:
```typescript
<EditorToolbar
  // ... existing props
  onMyFeature={handleMyFeature}
/>
```

### Add a New Dialog

1. Create dialog component in `dialogs.tsx`
2. Add dialog state to `hooks.ts`
3. Wire up in `RichTextEditor.tsx`

## 📊 Performance

### Optimizations
- `useCallback` for stable function references
- `useMemo` for expensive computations
- Ref-based updates to avoid unnecessary re-renders
- Debounced onChange for large documents (if needed)

### Best Practices
```typescript
// Good: Stable reference
const handleChange = useCallback((value: string) => {
  onChange(value);
}, [onChange]);

// Bad: New function on every render
const handleChange = (value: string) => {
  onChange(value);
};
```

## 🐛 Troubleshooting

### Editor content not updating
- Ensure `value` prop is controlled
- Check that `onChange` is being called
- Verify no race conditions with refs

### Formatting not applying
- Check browser's `execCommand` support
- Ensure focus is inside the editor
- Verify no conflicting CSS

### Templates not inserting
- Check `insertHTML` function
- Verify cursor position
- Ensure template HTML is valid

## 🤝 Contributing

1. Follow the existing architecture
2. Keep business logic separate from UI
3. Add TypeScript types for everything
4. Write tests for new features
5. Update this README

## 📝 License

[Your License Here]

## 🙏 Acknowledgments

Built with:
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide Icons
