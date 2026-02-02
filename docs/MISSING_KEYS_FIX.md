# Missing Translation Keys - Fixed

## Issue
The following translation keys were missing and showing as keys instead of translated text:
- `homepage.newsletter.title`
- `homepage.newsletter.subtitle`
- `articlesPage.search.placeholder`
- `articlesPage.hero.subtitle`
- `articlesPage.hero.title`

## Solution
Added all missing keys to the `ui_translations` table with proper English and Finnish translations.

## Added Keys

### Homepage Newsletter
| Key | English | Finnish |
|-----|---------|---------|
| `homepage.newsletter.title` | Subscribe to Our Newsletter | Tilaa uutiskirjeemme |
| `homepage.newsletter.subtitle` | Stay updated with the latest news and campaigns | Pysy ajan tasalla uusimmista uutisista ja kampanjoista |

### Articles Page
| Key | English | Finnish |
|-----|---------|---------|
| `articlesPage.hero.title` | Articles | Artikkelit |
| `articlesPage.hero.subtitle` | Latest News & Analysis | Uusimmat uutiset ja analyysit |
| `articlesPage.search.placeholder` | Search articles... | Hae artikkeleita... |

## Verification
✅ All 10 keys (5 keys × 2 languages) added successfully
✅ Translations loading correctly from database
✅ Cache cleared for immediate effect

## Status
**FIXED** - January 27, 2026

Restart your development server to see the changes take effect immediately.
