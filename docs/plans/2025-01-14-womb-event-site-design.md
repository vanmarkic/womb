# WOMB Event-Centric Website Design

**Date**: 2025-01-14
**Status**: Approved for Implementation

## Overview

Transform the WOMB landing page into a full bilingual (FR/EN) event-centric website showcasing ambient events, artists, recordings, and media galleries. The site will maintain the existing dark ambient aesthetic while providing structured access to WOMB's content archive.

## Architecture

### Project Structure

```
womb/
├── src/
│   ├── pages/
│   │   ├── index.astro                    # Landing page (preserved)
│   │   └── [lang]/
│   │       ├── events/
│   │       │   ├── index.astro           # Events archive
│   │       │   └── [slug].astro          # Event detail
│   │       ├── artists/
│   │       │   ├── index.astro           # Artists grid
│   │       │   └── [slug].astro          # Artist detail
│   │       ├── about.astro
│   │       └── contact.astro
│   ├── content/
│   │   ├── config.ts                      # Content Collections schemas
│   │   ├── events/                        # Event markdown files
│   │   ├── artists/                       # Artist markdown files
│   │   ├── recordings/                    # Recording metadata
│   │   └── media/                         # Media metadata
│   ├── components/
│   │   ├── AudioPlayer.tsx                # Protected audio player (Preact)
│   │   ├── Gallery.tsx                    # Gallery with lightbox (Preact)
│   │   ├── Header.astro                   # Navigation
│   │   └── LanguageToggle.astro           # Language switcher
│   ├── layouts/
│   │   └── BaseLayout.astro               # Shared layout
│   └── i18n/
│       ├── index.ts                       # Translation utilities
│       ├── en.json                        # English translations
│       └── fr.json                        # French translations
├── public/
│   └── WOMB/                              # All media files (existing)
└── docs/
    └── plans/
```

### Tech Stack

- **Framework**: Astro 5.x (Static Site Generation)
- **Content Management**: Astro Content Collections (markdown + frontmatter)
- **CMS**: FrontMatter (VS Code extension)
- **Client Interactivity**: Preact (lightweight React alternative)
- **UI Components**: Radix UI (headless, accessible components)
- **Styling**: Vanilla CSS (maintaining dark ambient aesthetic)
- **i18n**: Path-based routing (`/en/`, `/fr/`)
- **Hosting**: GitHub Pages (static)

## Routing & Navigation

### URL Structure

```
/                                    # Landing page (dark ambient, untouched)
/en/events                           # Events archive (English)
/en/events/episode-2                 # Event detail
/en/artists                          # Artists grid
/en/artists/dragan-markovic          # Artist detail
/en/about                            # About page
/en/contact                          # Contact page

/fr/events                           # Events archive (French)
/fr/events/episode-2                 # Event detail (same slug)
/fr/artists/dragan-markovic          # Artist detail (same slug)
...
```

**Key Principles**:
- Landing page at `/` remains unchanged with small language selector
- Language prefix (`/en/` or `/fr/`) separates translations
- Slugs remain untranslated for simplicity
- Language toggle preserves current page

### Navigation

**Landing Page**:
- No header/navigation
- Small language selector in bottom-right corner
- Click language → enter main site at `/[lang]/events`

**Main Site Pages**:
- Header with: Logo | Events | Artists | About | Contact | [EN/FR]
- Active state on current page
- Mobile-responsive (stacks vertically)

## Data Model

### Content Collections

All content managed via Astro Content Collections with Zod schema validation:

#### Artist

```typescript
{
  name: string;
  type: 'resident' | 'guest';
  photo?: string;                    // Path to photo in public/WOMB
  instagram?: string;
  soundcloud?: string;
  // Markdown body contains bio in both languages
}
```

**Example**: `src/content/artists/dragan-markovic.md`

```markdown
---
name: Dragan Markovic
type: resident
photo: /womb/WOMB/Artists/dragan.jpg
instagram: https://instagram.com/dragan
soundcloud: https://soundcloud.com/dragan
---

## Bio (EN)
Dragan is a Brussels-based ambient artist...

## Bio (FR)
Dragan est un artiste ambient basé à Bruxelles...
```

#### Event

```typescript
{
  number: number;                    // Episode number (0, 1, 2, etc.)
  title: { en: string; fr: string };
  dateFrom: Date;
  dateTo: Date;
  location: string;
  coverImage?: string;               // Path to cover image
  artists: string[];                 // Array of artist slugs
  // Markdown body contains description in both languages
}
```

**Example**: `src/content/events/episode-2.md`

#### Recording

```typescript
{
  title: string;
  artist: string;                    // Artist slug
  event: string;                     // Event slug
  duration: number;                  // Duration in seconds
  audioFile: string;                 // Path in public/WOMB/MUSIC
  date: Date;
}
```

#### Media

```typescript
{
  type: 'photo' | 'video';
  file: string;                      // Path in public/WOMB/Visus
  author?: string;                   // Photographer/videographer
  date: Date;
  event?: string;                    // Event slug
  artists?: string[];                // Tagged artist slugs
}
```

### Relationships

- **Artist** → has many Events, has many Recordings
- **Event** → has many Artists, has many Recordings, has many Media
- **Recording** → belongs to Artist, belongs to Event
- **Media** → can belong to Event, can tag multiple Artists

## Key Features

### 1. Protected Audio Player

**Component**: `src/components/AudioPlayer.tsx` (Preact)

**Protection Strategy** (Basic - Level A):
- Custom player with no download button
- Right-click context menu disabled
- Audio loaded via blob URLs (obscures direct path)
- `controlsList="nodownload"` attribute
- ~80% effective against casual users

**Features**:
- Play/pause toggle
- Progress bar with seek
- Time display (current / total)
- Dark aesthetic styling
- Mobile-friendly controls

**Migration Path**: Can upgrade to moderate/aggressive protection later if needed (requires backend service).

### 2. Gallery with Lightbox

**Component**: `src/components/Gallery.tsx` (Preact + Radix Dialog)

**Features**:
- Lazy-loaded image grid
- Click to open full-size lightbox
- Prev/Next navigation (buttons + keyboard arrows)
- Author credits on thumbnails
- Works with photos and videos
- Mobile swipe gestures (left/right to navigate)
- ESC to close, click outside to close
- Responsive grid (2-3 cols mobile, 4+ desktop)

**Accessibility**:
- Keyboard navigation (Radix handles this)
- Focus management
- Screen reader support
- Touch-friendly targets (44px minimum)

### 3. Event Detail Page

**URL**: `/[lang]/events/[slug]`

**Sections**:
1. **Hero**: Cover image with overlay text (title, date, location)
2. **Description**: Rich text from markdown
3. **Lineup**: Artist grid (residents first, then guests) with photos
4. **Recordings**: Protected audio players for each set
5. **Gallery**: Photo/video gallery with lightbox

**Data Loading**:
- Static paths generated for all events × languages
- Related artists, recordings, and media fetched via Content Collections
- Chronologically sorted

### 4. Artist Detail Page

**URL**: `/[lang]/artists/[slug]`

**Sections**:
1. **Header**: Photo, name, resident/guest badge, social links
2. **Bio**: Rich text from markdown (language-specific)
3. **Events**: List of events played (newest first)
4. **Recordings**: All recordings by this artist

### 5. Events Archive

**URL**: `/[lang]/events`

**Features**:
- Grid of event cards
- Sorted chronologically (newest first)
- Each card shows: cover image, title, date, location
- Hover effects (lift + brightness)
- Mobile-responsive grid

### 6. FrontMatter CMS Integration

**Setup**: `.vscode/settings.json` or `frontmatter.json`

**Content Types Configured**:
- Event
- Artist
- Recording
- Media

**Benefits**:
- Visual content editor in VS Code sidebar
- Form-based editing (dropdowns, date pickers, file selectors)
- Create new content via UI
- Preview markdown
- Git-based (commits with code)
- No separate hosting needed

## Internationalization (i18n)

### Strategy

Path-based routing with language prefix:
- `/en/events/episode-2`
- `/fr/events/episode-2`

### Translation Files

```typescript
// src/i18n/en.json
{
  "nav": {
    "events": "Events",
    "artists": "Artists",
    "about": "About",
    "contact": "Contact"
  },
  "events": {
    "title": "Events",
    "archive": "Archive",
    "lineup": "Lineup",
    "recordings": "Recordings",
    "gallery": "Gallery"
  },
  "artists": {
    "resident": "Resident",
    "guest": "Guest",
    "events": "Events",
    "recordings": "Recordings"
  }
}
```

```typescript
// src/i18n/fr.json
{
  "nav": {
    "events": "Événements",
    "artists": "Artistes",
    "about": "À propos",
    "contact": "Contact"
  },
  // ... French translations
}
```

### Helper Utility

```typescript
// src/i18n/index.ts
export const translations = { en, fr };

export function t(lang: 'en' | 'fr', key: string) {
  return translations[lang][key];
}
```

### Content Translation

Content with bilingual fields:
- **Frontmatter**: Nested objects for `title: { en: ..., fr: ... }`
- **Markdown body**: Sections with `## Bio (EN)` and `## Bio (FR)` headings

## Styling & Design

### Aesthetic Principles

- **Dark ambient**: Maintain existing `#0a0a0a` background
- **Minimal contrast**: Subtle grays (`#808080`, `#d0d0d0`)
- **Blur effects**: Like landing page figures
- **Furtive touches**: Small impressionist details
- **Typography**: Thin weights (200-300), wide letter-spacing
- **Animations**: Slow, smooth transitions

### Mobile Responsiveness

- Mobile-first CSS
- Touch-friendly targets (44px minimum)
- Stacked navigation on mobile
- Responsive grids (2-3 cols → 4+ cols)
- Swipe gestures in gallery
- Prevent background scroll when modals open

## Build & Deployment

### Dependencies

```json
{
  "dependencies": {
    "astro": "^5.15.6",
    "@astrojs/preact": "^3.0.0",
    "preact": "^10.19.0",
    "@radix-ui/react-dialog": "^1.0.5"
  }
}
```

### Astro Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  integrations: [preact()],
  server: { port: 4340 },
  site: 'https://vanmarkic.github.io',
  base: '/womb',
  vite: {
    build: {
      assetsInlineLimit: 0 // Don't inline large media files
    }
  }
});
```

### Build Process

1. Content Collections validated at build time (Zod schemas)
2. Static paths generated for all pages × languages
3. Markdown rendered to HTML
4. Preact components hydrated for interactivity
5. Media files in `public/WOMB` copied to `dist/womb/WOMB`
6. Deploy `dist/` to GitHub Pages via GitHub Actions

### GitHub Pages Deployment

- Already configured in `.github/workflows/deploy.yml`
- Triggered on push to main
- No changes needed

## Implementation Phases

1. **Setup** (Dependencies + Config)
   - Install Preact + Radix UI
   - Configure Astro for Preact
   - Set up Content Collections schemas
   - Configure FrontMatter CMS

2. **Base Infrastructure** (Layout + i18n)
   - Create BaseLayout
   - Build Header with navigation
   - Set up i18n utilities
   - Add language toggle to landing page

3. **Event Pages** (Core Feature)
   - Create event detail page template
   - Create events archive page
   - Test with one event

4. **Artist Pages**
   - Create artist detail page template
   - Create artists grid page

5. **Components** (Interactive Features)
   - Build AudioPlayer component
   - Build Gallery component
   - Test on mobile

6. **Static Pages**
   - Create About page
   - Create Contact page

7. **Content Migration**
   - Create markdown files for existing episodes
   - Create artist profiles
   - Link recordings
   - Tag media files

8. **Testing & Polish**
   - Cross-browser testing
   - Mobile testing (swipe gestures)
   - Audio player protection testing
   - Performance optimization

9. **Deploy**
   - Build and preview
   - Deploy to GitHub Pages
   - Test production deployment

## Migration Strategy

### Existing Content in `public/WOMB/`

**Events**: Episodes 0-5 with:
- Excel files (organization/budget)
- Promotional images (FB, IG, Story formats)
- Artist visuals (photos, videos)

**Music**: Episodes 2-4 with:
- WAV recordings (live sets)

**Visus - Photos - Videos**: Episodes 0-4 with:
- Photos (JPG, HEIC)
- Videos (MP4, MOV)
- Organized by episode and photographer

**Strategy**:
1. Keep all files in `public/WOMB/` (served as-is)
2. Create markdown content files that reference these files by path
3. Start with Episode 2 (most complete data)
4. Script batch creation of remaining episodes if needed

### Example Migration

**From**: Existing folder `public/WOMB/Events/Episode Deux/`

**To**: Content file `src/content/events/episode-2.md`:

```markdown
---
number: 2
title:
  en: Episode Two
  fr: Épisode Deux
dateFrom: 2023-12-15
dateTo: 2023-12-16
location: Brussels
coverImage: /womb/WOMB/Events/Episode Deux/WombEpisode2_FB.png
artists:
  - dragan-markovic
  - emsy
  - keyframe
  - rafa
  - rotor
  - sebcat
---

## Description (EN)
The second edition of WOMB...

## Description (FR)
La deuxième édition de WOMB...
```

## Future Enhancements

### Potential Phase 2 Features

- **Enhanced audio protection**: Upgrade to moderate protection with edge functions
- **Search**: Full-text search across events and artists
- **Filters**: Filter events by artist, date range, location
- **Newsletter signup**: Integrate mailing list
- **RSS feed**: For events/recordings
- **Social sharing**: Open Graph tags for better sharing
- **Analytics**: Track page views and popular events

### Migration to Headless CMS

If content editing needs grow beyond FrontMatter:
- Export content via script
- Import to Sanity/Strapi/etc.
- Update data fetching layer
- Component structure stays the same

## Success Criteria

✅ Landing page preserved with ambient aesthetic
✅ Event-centric navigation structure
✅ Bilingual FR/EN support
✅ Protected audio streaming (no easy downloads)
✅ Mobile-optimized gallery with swipe
✅ Content editable via FrontMatter CMS
✅ Type-safe data model
✅ Git-based workflow
✅ Static deployment (GitHub Pages)
✅ Zero backend infrastructure needed

## References

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [FrontMatter CMS](https://frontmatter.codes/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Preact](https://preactjs.com/)

---

**Approved by**: Dragan
**Next Step**: Implementation Plan
