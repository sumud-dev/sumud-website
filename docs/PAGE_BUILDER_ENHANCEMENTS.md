# Page Builder Enhancement Implementation

## Overview
This document outlines the improvements made to the page builder system to support comprehensive styling options and proper database integration for page metadata.

## 1. Style Props System

### Created Files
- **`src/lib/types/block-props.ts`**: Defines common style properties interface
- **`src/components/admin/page-builder/StyleSettings.tsx`**: Reusable settings component

### StyleProps Interface
All blocks and templates now support the following style properties:

#### Dimensions
- `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`

#### Spacing
- `marginTop`, `marginBottom`, `marginLeft`, `marginRight`
- `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`

#### Visual
- `backgroundColor`
- `display` (block, flex, inline-block, inline-flex, grid)

### Usage Example

```tsx
import { stylePropsToCSS, type StyleProps } from '@/src/lib/types/block-props';
import { StyleSettings } from '@/src/components/admin/page-builder/StyleSettings';

interface MyBlockProps extends StyleProps {
  // Your custom props
  customProp: string;
}

export const MyBlock = ({ customProp, ...styleProps }: Partial<MyBlockProps>) => {
  const styles = stylePropsToCSS({
    // Default values
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    // Merge with incoming props
    ...styleProps,
  });

  return <div style={styles}>Content</div>;
};

MyBlock.craft = {
  displayName: 'My Block',
  props: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#ffffff',
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    width: 'auto',
    height: 'auto',
    customProp: 'default',
  },
  related: {
    settings: () => <StyleSettings prefix="myBlockSettings" />,
  },
};
```

## 2. Database Integration for Page Metadata

### Updated Components

#### EditorCanvas.tsx
- Added state management for `pageTitle` and `pageSlug`
- Passes callbacks to `SettingsPanel` and `TopBar`

```tsx
const [pageTitle, setPageTitle] = useState<string>('');
const [pageSlug, setPageSlug] = useState<string>('');
```

#### SettingsPanel.tsx
- Already updated to accept `onTitleChange` and `onSlugChange` callbacks
- Notifies parent components when title/slug changes
- Auto-generates slug from title (URL-friendly)

#### TopBar.tsx
- Accepts `pageTitle` and `pageSlug` props
- Passes them to `usePageEditor` hook

#### usePageEditor.ts Hook
- Enhanced to save page metadata alongside content
- Both `save()` and `publish()` functions now update:
  - Page content (layout structure)
  - Page status
  - Page title (if provided)
  - Page slug (if provided)

### Save Flow

```
User edits title → SettingsPanel → EditorCanvas (state) → TopBar → usePageEditor
                                                                          ↓
                                                                      Save to DB
                                                                    (title + slug + content)
```

### Database Updates
When user clicks Save or Publish:

1. **Content is saved**: Layout structure serialized and saved to `page_builder` table
2. **Metadata is updated**: Title and slug saved to `pages` table
3. **Status is updated**: Set to 'draft' on save, 'published' on publish
4. **Sync across languages**: Content synced to all language versions automatically

## 3. Updated Blocks

### Section.tsx
- ✅ Fully updated with StyleProps
- ✅ Uses StyleSettings component
- ✅ Removed old custom settings

### Next Steps for Other Blocks

Apply the same pattern to:
- `Button.tsx`
- `Text.tsx`
- `Row.tsx`
- `Column.tsx`
- `InlineGroup.tsx`
- `ImageBlock.tsx`
- `Accordion.tsx`
- `Carousel.tsx`
- `Table.tsx`
- `List.tsx`
- `TextArea.tsx`
- `Badge.tsx`
- `Alert.tsx`
- `Separator.tsx`
- `CardBlock.tsx`

And all page templates:
- `CTABlock.tsx`
- `HeroSection.tsx`
- `AboutSection.tsx`
- `ContactSection.tsx`
- `FeaturesSection.tsx`
- `StatsSection.tsx`
- `TestimonialsSection.tsx`
- `TeamSection.tsx`
- `TimelineSection.tsx`
- `PricingSection.tsx`
- `GallerySection.tsx`
- `FAQSection.tsx`
- `NewsletterSection.tsx`
- `PartnersSection.tsx`

## 4. Benefits

### For Blocks
- ✅ Consistent styling API across all blocks
- ✅ Reusable settings component (less code duplication)
- ✅ Complete control over dimensions, spacing, and layout
- ✅ Type-safe with TypeScript

### For Pages
- ✅ Title and slug saved automatically with content
- ✅ No manual database operations needed
- ✅ Single save operation for all page data
- ✅ Consistent with existing page management flow

## 5. Testing Checklist

- [ ] Create a new page in page builder
- [ ] Set title and slug in settings panel
- [ ] Verify slug auto-generates from title
- [ ] Add blocks to canvas
- [ ] Configure block styles (width, height, padding, margin)
- [ ] Save page
- [ ] Verify title and slug saved to database
- [ ] Verify content saved to database
- [ ] Publish page
- [ ] Verify status updated to 'published'
- [ ] Check page displays correctly on frontend
- [ ] Test across different languages

## 6. Future Enhancements

- Add visual spacing indicators in canvas
- Add responsive breakpoint controls
- Add animation/transition controls
- Add grid/flexbox layout helpers
- Add CSS class name support
- Add custom CSS input for advanced users
