# TipTap Editor Migration Guide

## Installation

Install the required TipTap packages:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-text-style @tiptap/extension-color @tiptap/extension-highlight @tiptap/extension-task-list @tiptap/extension-task-item
```

Or with yarn:

```bash
yarn add @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-text-style @tiptap/extension-color @tiptap/extension-highlight @tiptap/extension-task-list @tiptap/extension-task-item
```

## File Replacements

1. **Replace** `/src/lib/tipTap-editor/WYSIWYGEditor.tsx` with the new version
2. **Replace** `/src/lib/tipTap-editor/RichTextEditor.tsx` with the new version

## What Changed?

### Before (contentEditable + execCommand)
- Used deprecated `document.execCommand()`
- Manual HTML manipulation
- Inconsistent rendering
- Poor paste handling
- No proper undo/redo

### After (TipTap)
- Modern, extensible editor framework
- Proper React integration
- Consistent HTML output
- Better paste handling
- Built-in undo/redo
- Easier to extend and customize

## Key Features

✅ **Rich Text Formatting**
- Bold, italic, underline, strikethrough
- Headings (H1-H6)
- Text color and highlighting
- Code formatting

✅ **Lists**
- Bullet lists
- Numbered lists
- Task lists with checkboxes
- Indent/outdent

✅ **Media**
- Images with alt text
- Embedded videos (YouTube, Vimeo)
- Links

✅ **Layout**
- Text alignment (left, center, right, justify)
- Tables with headers
- Horizontal rules
- Blockquotes

✅ **Templates**
- Pre-built content templates
- Layout templates
- Callout boxes

✅ **History**
- Undo/redo support
- Clear formatting

## Database Considerations

The HTML output format is the same, so your existing database schema doesn't need changes. However:

1. **Ensure you're storing HTML as text** (not escaping it)
2. **Use `TEXT` or `LONGTEXT` column types** for large content
3. **Don't use JSON encoding** on the HTML string

Example Supabase schema:
```sql
alter table pages add column content text;
```

Example Prisma schema:
```prisma
model Page {
  id      String @id @default(cuid())
  content String @db.Text
}
```

## Troubleshooting

### Content appears as plain text
**Problem:** HTML is being escaped or stored as a string literal

**Solution:** 
```typescript
// ❌ Wrong - escapes HTML
const content = JSON.stringify(htmlContent);

// ✅ Correct - stores raw HTML
const content = htmlContent;
```

### Styling not applied
**Problem:** TailwindCSS prose classes not working

**Solution:** Ensure you have `@tailwindcss/typography` installed:
```bash
npm install @tailwindcss/typography
```

And add it to `tailwind.config.js`:
```javascript
module.exports = {
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### Editor is empty on load
**Problem:** Content not being set properly

**Solution:** Make sure you're passing the HTML string directly:
```typescript
<RichTextEditor
  value={pageContent} // Should be HTML string
  onChange={setPageContent}
/>
```

### Toolbar buttons don't work
**Problem:** Editor instance not accessible

**Solution:** The editor instance is stored on `window.__tiptapEditor`. This is set automatically when WYSIWYGEditor mounts. Make sure the editor has mounted before toolbar interactions.

## Advanced Customization

### Adding Custom Extensions

Edit `WYSIWYGEditor.tsx`:

```typescript
import YourCustomExtension from './extensions/YourCustomExtension';

const editor = useEditor({
  extensions: [
    StarterKit,
    // ... other extensions
    YourCustomExtension.configure({
      // your config
    }),
  ],
  // ... rest of config
});
```

### Custom Styling

Add custom CSS in the `<style jsx global>` block in `WYSIWYGEditor.tsx`:

```typescript
<style jsx global>{`
  .ProseMirror .custom-class {
    @apply your-tailwind-classes;
  }
`}</style>
```

### Custom Commands

Add custom toolbar buttons by creating new handlers in `RichTextEditor.tsx`:

```typescript
const handleCustomCommand = useCallback(() => {
  getEditor()?.chain().focus().yourCustomCommand().run();
}, [getEditor]);
```

## Migration Checklist

- [ ] Install TipTap packages
- [ ] Replace WYSIWYGEditor.tsx
- [ ] Replace RichTextEditor.tsx
- [ ] Test with existing content
- [ ] Verify all toolbar buttons work
- [ ] Check preview mode renders correctly
- [ ] Test save/load from database
- [ ] Verify on different browsers

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify all TipTap packages are installed
3. Ensure Tailwind typography plugin is configured
4. Check that content is stored as HTML (not escaped)

## Additional Resources

- [TipTap Documentation](https://tiptap.dev/)
- [TipTap Examples](https://tiptap.dev/examples)
- [TipTap Extensions](https://tiptap.dev/extensions)
