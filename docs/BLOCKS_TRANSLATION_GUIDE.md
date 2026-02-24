# Block Components Translation Guide

## Overview
All block components in `/src/components/blocks/` need to be updated to use translations from the `adminSettings.pageBuilder` namespace instead of hardcoded English strings.

## Translation Keys Added
A comprehensive set of 159 translation keys has been added to the database covering:
- Common labels (title, subtitle, description, etc.)
- Actions (add, remove, etc.)
- Variants and options
- Placeholders
- Form labels
- Size, alignment, and layout options

## Pattern to Follow

### 1. Import the translation hook
```typescript
import { useTranslations } from 'next-intl';
```

### 2. Add the hook in Settings component
```typescript
export function ComponentSettings() {
  const t = useTranslations('adminSettings.pageBuilder');
  // ... rest of component
}
```

### 3. Replace hardcoded strings with translation keys
```typescript
// Before:
<Label>Title</Label>

// After:
<Label>{t('labels.title') || 'Title'}</Label>
```

## Available Translation Keys

### Common Labels
- `t('labels.title')` - "Title"
- `t('labels.subtitle')` - "Subtitle"
- `t('labels.description')` - "Description"
- `t('labels.content')` - "Content"
- `t('labels.backgroundColor')` - "Background Color"
- `t('labels.titleColor')` - "Title Color"
- `t('labels.textColor')` - "Text Color"
- `t('labels.accentColor')` - "Accent Color"
- `t('labels.variant')` - "Variant"
- `t('labels.size')` - "Size"
- `t('labels.alignment')` - "Alignment"
- `t('labels.imageUrl')` - "Image URL"
- `t('labels.altText')` - "Alt Text"
- `t('labels.buttonText')` - "Button Text"
- `t('labels.buttonUrl')` - "Button URL"
- `t('labels.name')` - "Name"
- `t('labels.email')` - "Email"
- `t('labels.role')` - "Role"
- `t('labels.bio')` - "Bio"
- `t('labels.items')` - "Items"
- `t('labels.width')` - "Width"
- `t('labels.height')` - "Height"
- `t('labels.padding')` - "Padding"
- `t('labels.type')` - "Type"
- `t('labels.layout')` - "Layout"
- `t('labels.orientation')` - "Orientation"

### Actions
- `t('actions.add')` - "Add"
- `t('actions.remove')` - "Remove"
- `t('actions.addItem')` - "Add Item"
- `t('actions.addSlide')` - "Add Slide"
- `t('actions.addMember')` - "Add Member"
- `t('actions.addFAQ')` - "Add FAQ"
- `t('actions.addFeature')` - "Add Feature"
- `t('actions.addTestimonial')` - "Add Testimonial"
- `t('actions.addEvent')` - "Add Event"
- `t('actions.subscribe')` - "Subscribe"
- `t('actions.sendMessage')` - "Send Message"
- `t('actions.learnMore')` - "Learn More"
- `t('actions.getInvolved')` - "Get Involved"
- `t('actions.contactUs')` - "Contact Us"

### Variants
- `t('variants.default')` - "Default"
- `t('variants.primary')` - "Primary"
- `t('variants.secondary')` - "Secondary"
- `t('variants.destructive')` - "Destructive"
- `t('variants.outline')` - "Outline"
- `t('variants.ghost')` - "Ghost"
- `t('variants.success')` - "Success"
- `t('variants.warning')` - "Warning"
- `t('variants.error')` - "Error"
- `t('variants.info')` - "Info"

### Alignment
- `t('alignment.left')` - "Left"
- `t('alignment.center')` - "Center"
- `t('alignment.right')` - "Right"

### Size
- `t('size.small')` - "Small"
- `t('size.medium')` - "Medium"
- `t('size.large')` - "Large"

### Placeholders
- `t('placeholders.enterTitle')` - "Enter title"
- `t('placeholders.enterSubtitle')` - "Enter subtitle"
- `t('placeholders.enterDescription')` - "Enter description"
- `t('placeholders.enterText')` - "Enter text"
- `t('placeholders.imageUrl')` - "https://example.com/image.jpg"
- `t('placeholders.buttonUrl')` - "https://..."
- `t('placeholders.email')` - "your.email@example.com"
- `t('placeholders.emailAddress')` - "Email address"

### Help Text
- `t('help.useDoubleLine')` - "Use double line breaks for paragraphs"
- `t('help.dragColumns')` - "Place columns inside a Row block for side-by-side layouts."
- `t('help.inlineDisplay')` - "Use this to display elements inline (side by side)"
- `t('help.orEnterUrl')` - "Or Enter Image URL"
- `t('help.uploadImage')` - "Upload Image"

### Form Labels
- `t('form.name')` - "Name *"
- `t('form.email')` - "Email *"
- `t('form.subject')` - "Subject"
- `t('form.message')` - "Message *"
- `t('form.yourName')` - "Your name"
- `t('form.yourMessage')` - "Your message..."
- `t('form.whatsThisAbout')` - "What's this about?"

### Specific Component Labels
- `t('labels.imagePosition')` - "Image Position"
- `t('labels.showNavigation')` - "Show Navigation Controls"
- `t('labels.autoplay')` - "Autoplay"
- `t('labels.orderedList')` - "Ordered list"
- `t('labels.listStyle')` - "List Style"
- `t('labels.caption')` - "Caption"
- `t('labels.author')` - "Author"
- `t('labels.quote')` - "Quote"
- `t('labels.year')` - "Year"
- `t('labels.event')` - "Event"
- `t('labels.value')` - "Value"
- `t('labels.label')` - "Label"
- `t('labels.statLabel')` - "Stat Label"
- `t('labels.statValue')` - "Stat Value"
- `t('labels.linkedinUrl')` - "LinkedIn URL"
- `t('labels.avatarImage')` - "Avatar Image URL"
- `t('labels.primaryButton')` - "Primary Button Text"
- `t('labels.secondaryButton')` - "Secondary Button Text"
- `t('labels.primaryButtonUrl')` - "Primary Button URL"
- `t('labels.secondaryButtonUrl')` - "Secondary Button URL"
- `t('labels.question')` - "Question"
- `t('labels.answer')` - "Answer"
- `t('labels.headers')` - "Headers"
- `t('labels.rows')` - "Rows"
- `t('labels.addRow')` - "Add Row"
- `t('labels.addColumn')` - "Add Column"
- `t('labels.header')` - "Header"
- `t('labels.footer')` - "Footer (optional)"
- `t('labels.placeholder')` - "Placeholder"
- `t('labels.defaultValue')` - "Default Value"
- `t('labels.disabled')` - "Disabled"
- `t('labels.bold')` - "Bold"
- `t('labels.italic')` - "Italic"
- `t('labels.fontSize')` - "Font Size"
- `t('labels.color')` - "Color"
- `t('labels.display')` - "Display"
- `t('labels.decorativeOnly')` - "Decorative only"
- `t('labels.allowWrap')` - "Allow Wrap"
- `t('labels.gap')` - "Gap (px)"
- `t('labels.justifyContent')` - "Justify Content"
- `t('labels.alignItems')` - "Align Items"

### List Styles
- `t('listStyle.none')` - "None"
- `t('listStyle.circle')` - "Circle"
- `t('listStyle.square')` - "Square"
- `t('listStyle.decimal')` - "Decimal"
- `t('listStyle.roman')` - "Roman"

### Layout Options
- `t('layout.1column')` - "1 Column (100%)"
- `t('layout.2columns')` - "2 Columns (50% each)"
- `t('layout.3columns')` - "3 Columns (33% each)"
- `t('layout.4columns')` - "4 Columns (25% each)"

### Width Options
- `t('width.quarter')` - "25% (1/4)"
- `t('width.third')` - "33% (1/3)"
- `t('width.half')` - "50% (1/2)"
- `t('width.twoThirds')` - "66% (2/3)"
- `t('width.threeQuarters')` - "75% (3/4)"
- `t('width.full')` - "100% (Full)"

### Dynamic Labels
- `t('dynamicLabels.item')` - "Item" (use with index: `${t('dynamicLabels.item')} ${index + 1}`)
- `t('dynamicLabels.slide')` - "Slide"
- `t('dynamicLabels.member')` - "Member"
- `t('dynamicLabels.row')` - "Row"

## Components Status

### ✅ Completed
- FAQSection.tsx (CTA text translated)
- TeamSection.tsx (Settings panel fully translated)
- SettingsPanel.tsx (Settings panel translated)

### ⏳ Remaining (Apply same pattern)
- AboutSection.tsx
- Accordion.tsx
- Alert.tsx
- Badge.tsx
- Button.tsx
- CardBlock.tsx
- Carousel.tsx
- Column.tsx
- ContactSection.tsx
- Container.tsx
- CTABlock.tsx
- FeaturesSection.tsx
- GallerySection.tsx
- HeroSection.tsx
- ImageBlock.tsx
- InlineGroup.tsx
- List.tsx
- NewsletterSection.tsx
- PartnersSection.tsx
- PricingSection.tsx
- Row.tsx
- Section.tsx
- Separator.tsx
- StatsSection.tsx
- Table.tsx
- TestimonialsSection.tsx
- Text.tsx
- TextArea.tsx
- TimelineSection.tsx

## Example: Updating Button.tsx

```typescript
// Before:
export function ButtonSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data?.props,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>Text</Label>
        <Input value={props.text} onChange={...} />
      </div>
      <div>
        <Label>Variant</Label>
        <Select>
          <SelectItem value="default">Default</SelectItem>
          <SelectItem value="destructive">Destructive</SelectItem>
        </Select>
      </div>
    </div>
  );
}

// After:
import { useTranslations } from 'next-intl';

export function ButtonSettings() {
  const t = useTranslations('adminSettings.pageBuilder');
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data?.props,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label>{t('labels.buttonText') || 'Text'}</Label>
        <Input value={props.text} onChange={...} />
      </div>
      <div>
        <Label>{t('labels.variant') || 'Variant'}</Label>
        <Select>
          <SelectItem value="default">{t('variants.default') || 'Default'}</SelectItem>
          <SelectItem value="destructive">{t('variants.destructive') || 'Destructive'}</SelectItem>
        </Select>
      </div>
    </div>
  );
}
```

## Important Notes

1. **Always add fallback values** using `||` operator for backward compatibility
2. **Only translate user-facing text** in Settings panels - don't translate HTML attributes, CSS classes, or technical values
3. **Default prop values** can remain in English for now (they're for demo purposes and can be changed by users)
4. **Focus on Settings panels** first as those are what admins see
5. **Test each component** after translation to ensure nothing breaks

## Next Steps

To complete the translation of all blocks:
1. Apply the same pattern to each remaining component
2. Test each component in the page builder
3. Verify translations appear correctly in both English and Finnish
4. Check for any missing translation keys and add them as needed

The translation infrastructure is now in place with 159 keys covering most common UI text across all blocks.
