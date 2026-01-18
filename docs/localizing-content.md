# i18n Content Structure Migration Plan

## Overview
Restructure the content and i18n system to follow a locale-first folder architecture, separating page/navigation content from UI translations for better maintainability and scalability.

## Current State
- Page builder content stored in JSON files
- Navigation builder content stored in JSON files
- i18n messages folder for UI strings
- Inconsistent separation between locale and content

## Target Structure

```
content/
├── en/
│   ├── pages/
│   │   ├── home.json
│   │   ├── about.json
│   │   └── [other-pages].json
│   └── navigation/
│       ├── main-nav.json
│       └── [other-navs].json
├── fi/
│   ├── pages/
│   │   ├── home.json
│   │   ├── about.json
│   │   └── [other-pages].json
│   └── navigation/
│       ├── main-nav.json
│       └── [other-navs].json
└── [other-locales]/

messages/
├── en.json
├── fi.json
└── [other-locales].json
```

## Benefits of This Approach

### Content Organization
- **Complete locale independence**: Each folder contains only relevant localized content with localized identifiers in URLs
- **Market-specific flexibility**: Different slugs, SEO metadata, and content structure per locale
- **Easier content management**: Page builders can modify structure independently for each market
- **Clear separation**: Content (pages/navigation) vs UI strings (messages) serve different purposes

### Maintainability
- **Consistent naming**: Follow `language/country/variant` pattern to prevent confusion
- **Logical grouping**: Related strings grouped by feature, avoiding scattered files
- **Update cycle separation**: Page content and UI translations update independently
- **Reduced duplication**: Reuse common keys across files where appropriate

---

## Migration Steps

### Phase 1: Preparation & Analysis
**Duration**: 1-2 days

#### 1.1 Audit Current Structure
- [ ] Document current file locations and structure
- [ ] List all existing locales (e.g., `en`, `fi`)
- [ ] Inventory all page JSON files
- [ ] Inventory all navigation JSON files
- [ ] Identify what's in current `messages/` folder

#### 1.2 Content Classification
- [ ] Separate content types:
  - **Pages**: User-managed page builder content
  - **Navigation**: Menu structures and links
  - **UI Strings**: Buttons, labels, validation messages, common text
- [ ] Identify any mixed concerns (content + UI strings in same files)

#### 1.3 Create Backup
- [ ] Create full backup of current `content/` and `messages/` folders
- [ ] Document current working state
- [ ] Tag current Git commit for easy rollback

---

### Phase 2: Structure Setup
**Duration**: 1 day

#### 2.1 Create New Directory Structure
```bash
# Create locale-first folders
mkdir -p content/{en,fi}/pages
mkdir -p content/{en,fi}/navigation

# Ensure messages folder exists
mkdir -p messages
```

#### 2.2 Define Schema Standards
- [ ] Document JSON schema for pages (if not already documented)
- [ ] Document JSON schema for navigation
- [ ] Document UI strings structure in messages
- [ ] Create example files for each type

**Example schemas:**

```json
// content/en/pages/home.json
{
  "slug": "home",
  "title": "Welcome Home",
  "seo": {
    "metaTitle": "Home - Your Site",
    "metaDescription": "...",
    "ogImage": "/images/home-og.jpg"
  },
  "blocks": [
    {
      "type": "hero",
      "props": {
        "title": "Welcome",
        "subtitle": "..."
      }
    }
  ]
}

// content/en/navigation/main-nav.json
{
  "id": "main-nav",
  "items": [
    {
      "label": "Home",
      "href": "/",
      "children": []
    }
  ]
}

// messages/en.json
{
  "common": {
    "readMore": "Read More",
    "close": "Close"
  },
  "forms": {
    "submit": "Submit",
    "required": "This field is required"
  }
}
```

---

### Phase 3: Content Migration
**Duration**: 2-3 days

#### 3.1 Create Migration Script
- [ ] Write script to move files to new structure
- [ ] Handle file renaming if needed
- [ ] Verify JSON validity during migration
- [ ] Log all moved files

**Migration script outline:**
```javascript
// migrate-content.js
const fs = require('fs');
const path = require('path');

const locales = ['en', 'fi'];
const contentTypes = ['pages', 'navigation'];

// Move existing files to locale folders
// Validate JSON structure
// Create any missing locale versions
```

#### 3.2 Migrate Pages
- [ ] Move existing page JSON files to `content/{locale}/pages/`
- [ ] Ensure each page exists for all locales
- [ ] Update any internal references (IDs, slugs)
- [ ] Verify all pages load correctly

#### 3.3 Migrate Navigation
- [ ] Move navigation JSON files to `content/{locale}/navigation/`
- [ ] Update navigation links to match new page slugs
- [ ] Ensure navigation exists for all locales
- [ ] Verify navigation renders correctly

#### 3.4 Refactor Messages
- [ ] Review current messages files
- [ ] Extract any content that belongs in pages/navigation
- [ ] Keep only UI strings (buttons, labels, validation)
- [ ] Organize by feature/component
- [ ] Remove duplicates using shared keys

---

### Phase 4: Code Updates
**Duration**: 2-3 days

#### 4.1 Update Content Loading Logic
- [ ] Update file path resolution to use locale-first structure
- [ ] Modify page loader: `loadPage(locale, slug)`
- [ ] Modify navigation loader: `loadNavigation(locale, navId)`
- [ ] Update any content queries or filters

**Example:**
```javascript
// Before
const page = loadPage('home');

// After
const page = loadPage('en', 'home');
```

#### 4.2 Update Routing
- [ ] Update route handlers to extract locale from URL
- [ ] Handle locale-specific slugs (e.g., `/en/home`, `/fi/etusivu`)
- [ ] Update dynamic route generation
- [ ] Test all routes with both locales

#### 4.3 Update i18n Configuration
- [ ] Configure i18n library to load from `messages/{locale}.json`
- [ ] Ensure UI strings load correctly
- [ ] Update any hardcoded message paths
- [ ] Test locale switching

#### 4.4 Update Page Builder & Navigation Builder
- [ ] Update builder UI to work with new structure
- [ ] Ensure "save" writes to correct locale folder
- [ ] Update "load" to read from correct locale folder
- [ ] Add locale selector in builder interface if needed

---

### Phase 5: Testing & Validation
**Duration**: 2-3 days

#### 5.1 Automated Testing
- [ ] Write/update tests for content loading
- [ ] Test page rendering in all locales
- [ ] Test navigation rendering in all locales
- [ ] Test locale switching
- [ ] Verify SEO metadata per locale

#### 5.2 Manual Testing
- [ ] Load all pages in all locales
- [ ] Verify content displays correctly
- [ ] Check navigation links work
- [ ] Test page builder save/load
- [ ] Test navigation builder save/load
- [ ] Verify UI strings load from messages

#### 5.3 Edge Cases
- [ ] Test missing translations (fallback behavior)
- [ ] Test new page creation in multiple locales
- [ ] Test page deletion across locales
- [ ] Verify URL structure and redirects

---

### Phase 6: Documentation & Cleanup
**Duration**: 1 day

#### 6.1 Update Documentation
- [ ] Document new folder structure
- [ ] Update developer onboarding docs
- [ ] Document content creation workflow
- [ ] Add examples for adding new locales
- [ ] Document messages organization strategy

#### 6.2 Cleanup
- [ ] Remove old content structure (after verifying migration)
- [ ] Clean up unused files
- [ ] Remove migration scripts (or move to tools folder)
- [ ] Update `.gitignore` if needed

#### 6.3 Team Communication
- [ ] Announce structure change to team
- [ ] Provide migration guide for developers
- [ ] Update any CI/CD scripts
- [ ] Document rollback procedure

---

## Best Practices for Ongoing Maintenance

### Content Management
1. **Always create content per locale**: When adding a new page, create it for all supported locales
2. **Keep filenames consistent**: Use the same filename across locales (e.g., `about.json` in both `en/` and `fi/`)
3. **Document slug patterns**: Maintain a reference of how slugs translate across locales

### UI Strings
1. **Group by feature**: Organize messages by component or feature, not by page
2. **Reuse common keys**: Avoid duplication (e.g., one "Close" button translation)
3. **Namespace appropriately**: Use clear namespaces like `forms.`, `navigation.`, `common.`

### Locale Management
1. **Use consistent locale codes**: Follow `language-COUNTRY` pattern (e.g., `en-US`, `fi-FI`)
2. **Define primary locale**: Choose one locale as source of truth
3. **Sync workflow**: When updating primary locale content, create tasks to update translations

### Version Control
1. **Commit locales together**: When changing content structure, update all locales in same commit
2. **Track translation status**: Use comments or separate file to track translation completion
3. **Review locale differences**: Ensure intentional differences (like market-specific content) are documented

---

## Rollback Plan

If issues arise during migration:

1. **Immediate rollback**: `git reset --hard [backup-commit-hash]`
2. **Restore from backup**: Copy backed-up folders back to original locations
3. **Revert code changes**: Reset any code changes made in Phase 4
4. **Verify functionality**: Ensure site works with old structure
5. **Document issues**: Record what went wrong for next attempt

---

## Success Criteria

- [ ] All pages load correctly in all locales
- [ ] All navigation renders correctly in all locales
- [ ] UI strings load from messages folder
- [ ] Page builder can create/edit pages per locale
- [ ] Navigation builder can create/edit navigation per locale
- [ ] No broken links or missing content
- [ ] Performance is equal or better than before
- [ ] Team understands new structure
- [ ] Documentation is complete

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| 1. Preparation | 1-2 days | Audit, backup, classification |
| 2. Structure Setup | 1 day | New folders, schemas, examples |
| 3. Content Migration | 2-3 days | All content moved, validated |
| 4. Code Updates | 2-3 days | Loaders, routing, builders updated |
| 5. Testing | 2-3 days | All tests pass, manual QA complete |
| 6. Documentation | 1 day | Docs updated, team informed |

**Total Estimated Duration**: 9-13 days

---

## Notes

- Start with a single locale migration to validate approach before migrating all locales
- Consider creating a feature branch for this work
- Schedule extra time for unexpected issues
- Plan migration during low-traffic period if possible
- Keep stakeholders informed of progress