# WOMB Event Site - Implementation Plan Phases 9-14

**Date**: 2025-01-14
**Status**: Ready for Implementation

## Phase 9: Gallery Component with Radix Dialog Lightbox

### Task 9.1: Install Radix UI Dialog

**File**: `package.json`

**Command**:
```bash
npm install @radix-ui/react-dialog@^1.0.5
npm install preact-compat
```

**Verify**:
```bash
npm list @radix-ui/react-dialog
```

**Commit**: `chore: add Radix UI Dialog for gallery lightbox`

### Task 9.2: Create Gallery Component Structure

**File**: `src/components/Gallery.tsx`

```tsx
import { h } from 'preact';
import { useState } from 'preact/hooks';
import * as Dialog from '@radix-ui/react-dialog';
import './Gallery.css';

interface MediaItem {
  type: 'photo' | 'video';
  file: string;
  author?: string;
  caption?: string;
}

interface GalleryProps {
  items: MediaItem[];
  lang: 'en' | 'fr';
}

export function Gallery({ items, lang }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <div class="gallery">
      <div class="gallery-grid">
        {items.map((item, index) => (
          <button
            key={index}
            class="gallery-item"
            onClick={() => openLightbox(index)}
            aria-label={`View ${item.type} ${index + 1}`}
          >
            {item.type === 'photo' ? (
              <img
                src={item.file}
                alt={item.caption || `Gallery item ${index + 1}`}
                loading="lazy"
              />
            ) : (
              <div class="video-thumbnail">
                <video src={item.file} />
                <span class="video-icon">▶</span>
              </div>
            )}
            {item.author && (
              <span class="gallery-author">© {item.author}</span>
            )}
          </button>
        ))}
      </div>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay class="dialog-overlay" onClick={closeLightbox} />
          <Dialog.Content class="dialog-content">
            {selectedItem && (
              <>
                <Dialog.Close class="dialog-close" aria-label="Close">
                  ×
                </Dialog.Close>

                <button
                  class="dialog-nav dialog-prev"
                  onClick={goToPrevious}
                  aria-label="Previous"
                >
                  ‹
                </button>

                <div class="dialog-media">
                  {selectedItem.type === 'photo' ? (
                    <img
                      src={selectedItem.file}
                      alt={selectedItem.caption || 'Gallery image'}
                    />
                  ) : (
                    <video
                      src={selectedItem.file}
                      controls
                      autoPlay
                    />
                  )}
                  {selectedItem.caption && (
                    <p class="dialog-caption">{selectedItem.caption}</p>
                  )}
                  {selectedItem.author && (
                    <p class="dialog-author">© {selectedItem.author}</p>
                  )}
                </div>

                <button
                  class="dialog-nav dialog-next"
                  onClick={goToNext}
                  aria-label="Next"
                >
                  ›
                </button>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
```

**Test**:
```bash
npm run dev
# Visit http://localhost:4340 and check component renders
```

**Commit**: `feat: add Gallery component with lightbox functionality`

### Task 9.3: Add Gallery Styles

**File**: `src/components/Gallery.css`

```css
/* Gallery Grid */
.gallery {
  width: 100%;
  margin: 2rem 0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 0;
}

@media (min-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

.gallery-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #1a1a1a;
  border: none;
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;
  padding: 0;
}

.gallery-item:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.gallery-item img,
.gallery-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.gallery-author {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.25rem 0.5rem;
  border-radius: 2px;
}

/* Lightbox Dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;
  z-index: 1000;
}

.dialog-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  height: 90vh;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: slideIn 0.3s ease;
  z-index: 1001;
}

.dialog-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 2rem;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1002;
}

.dialog-close:hover {
  background: rgba(0, 0, 0, 0.8);
}

.dialog-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 2rem;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-nav:hover {
  background: rgba(0, 0, 0, 0.8);
}

.dialog-prev {
  left: 1rem;
}

.dialog-next {
  right: 1rem;
}

.dialog-media {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
}

.dialog-media img,
.dialog-media video {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.dialog-caption {
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  text-align: center;
}

.dialog-author {
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  text-align: center;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translate(-50%, -48%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .dialog-nav {
    bottom: 2rem;
    top: auto;
    transform: none;
  }

  .dialog-prev {
    left: 20%;
  }

  .dialog-next {
    right: 20%;
  }
}
```

**Test**:
```bash
npm run dev
# Verify styling applied correctly
```

**Commit**: `style: add Gallery component styling with dark theme`

### Task 9.4: Add Keyboard and Touch Support

**File**: `src/components/Gallery.tsx` (update)

```tsx
import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import * as Dialog from '@radix-ui/react-dialog';
import './Gallery.css';

interface MediaItem {
  type: 'photo' | 'video';
  file: string;
  author?: string;
  caption?: string;
}

interface GalleryProps {
  items: MediaItem[];
  lang: 'en' | 'fr';
}

export function Gallery({ items, lang }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          closeLightbox();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex]);

  // Touch gestures
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartX.current = null;
  };

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <div class="gallery">
      <div class="gallery-grid">
        {items.map((item, index) => (
          <button
            key={index}
            class="gallery-item"
            onClick={() => openLightbox(index)}
            aria-label={`View ${item.type} ${index + 1}`}
          >
            {item.type === 'photo' ? (
              <img
                src={item.file}
                alt={item.caption || `Gallery item ${index + 1}`}
                loading="lazy"
              />
            ) : (
              <div class="video-thumbnail">
                <video src={item.file} muted />
                <span class="video-icon">▶</span>
              </div>
            )}
            {item.author && (
              <span class="gallery-author">© {item.author}</span>
            )}
          </button>
        ))}
      </div>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay class="dialog-overlay" onClick={closeLightbox} />
          <Dialog.Content
            class="dialog-content"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {selectedItem && (
              <>
                <Dialog.Close class="dialog-close" aria-label="Close">
                  ×
                </Dialog.Close>

                <button
                  class="dialog-nav dialog-prev"
                  onClick={goToPrevious}
                  aria-label="Previous"
                >
                  ‹
                </button>

                <div class="dialog-media">
                  {selectedItem.type === 'photo' ? (
                    <img
                      src={selectedItem.file}
                      alt={selectedItem.caption || 'Gallery image'}
                    />
                  ) : (
                    <video
                      src={selectedItem.file}
                      controls
                      autoPlay
                    />
                  )}
                  {selectedItem.caption && (
                    <p class="dialog-caption">{selectedItem.caption}</p>
                  )}
                  {selectedItem.author && (
                    <p class="dialog-author">© {selectedItem.author}</p>
                  )}
                </div>

                <button
                  class="dialog-nav dialog-next"
                  onClick={goToNext}
                  aria-label="Next"
                >
                  ›
                </button>

                <div class="dialog-counter">
                  {selectedIndex + 1} / {items.length}
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
```

**Test**:
```bash
npm run dev
# Test keyboard navigation (arrow keys, ESC)
# Test touch gestures on mobile device/emulator
```

**Commit**: `feat: add keyboard navigation and touch gestures to Gallery`

## Phase 10: Artist Pages (Detail + Grid)

### Task 10.1: Create Artist Collection Schema

**File**: `src/content/config.ts` (update)

```typescript
import { defineCollection, z } from 'astro:content';

// Existing collections...

const artistsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    type: z.enum(['resident', 'guest']),
    photo: z.string().optional(),
    instagram: z.string().url().optional(),
    soundcloud: z.string().url().optional(),
    website: z.string().url().optional(),
    order: z.number().default(999), // For sorting residents vs guests
  }),
});

export const collections = {
  events: eventsCollection,
  artists: artistsCollection,
  recordings: recordingsCollection,
  media: mediaCollection,
};
```

**Test**:
```bash
npm run build
# Verify schema validation works
```

**Commit**: `feat: add artist collection schema`

### Task 10.2: Create Artist Detail Page

**File**: `src/pages/[lang]/artists/[slug].astro`

```astro
---
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { t } from '../../../i18n';
import AudioPlayer from '../../../components/AudioPlayer.tsx';

export async function getStaticPaths() {
  const artists = await getCollection('artists');
  const languages = ['en', 'fr'] as const;

  return languages.flatMap((lang) =>
    artists.map((artist) => ({
      params: { lang, slug: artist.slug },
      props: { artist, lang },
    }))
  );
}

const { artist, lang } = Astro.props;
const { Content } = await artist.render();

// Get related events and recordings
const events = await getCollection('events', (event) =>
  event.data.artists.includes(artist.slug)
);
const recordings = await getCollection('recordings', (recording) =>
  recording.data.artist === artist.slug
);

// Sort events by date (newest first)
events.sort((a, b) => b.data.dateFrom.getTime() - a.data.dateFrom.getTime());

// Parse bio sections from markdown content
const bioSections = artist.body.split(/## Bio \((EN|FR)\)/);
const bioEN = bioSections.find((_, i) => bioSections[i - 1]?.includes('EN'));
const bioFR = bioSections.find((_, i) => bioSections[i - 1]?.includes('FR'));
const currentBio = lang === 'en' ? bioEN : bioFR;
---

<BaseLayout title={artist.data.name} lang={lang}>
  <article class="artist-detail">
    <header class="artist-header">
      {artist.data.photo && (
        <div class="artist-photo">
          <img src={artist.data.photo} alt={artist.data.name} />
        </div>
      )}
      <div class="artist-info">
        <h1>{artist.data.name}</h1>
        <span class="artist-type">
          {t(lang, `artists.${artist.data.type}`)}
        </span>
        <nav class="artist-social">
          {artist.data.instagram && (
            <a href={artist.data.instagram} target="_blank" rel="noopener">
              Instagram
            </a>
          )}
          {artist.data.soundcloud && (
            <a href={artist.data.soundcloud} target="_blank" rel="noopener">
              SoundCloud
            </a>
          )}
          {artist.data.website && (
            <a href={artist.data.website} target="_blank" rel="noopener">
              Website
            </a>
          )}
        </nav>
      </div>
    </header>

    {currentBio && (
      <section class="artist-bio">
        <h2>{t(lang, 'artists.bio')}</h2>
        <div class="prose" set:html={currentBio} />
      </section>
    )}

    {events.length > 0 && (
      <section class="artist-events">
        <h2>{t(lang, 'artists.events')}</h2>
        <div class="events-list">
          {events.map((event) => (
            <a
              href={`/${lang}/events/${event.slug}`}
              class="event-card"
            >
              {event.data.coverImage && (
                <img src={event.data.coverImage} alt={event.data.title[lang]} />
              )}
              <div class="event-card-content">
                <h3>{event.data.title[lang]}</h3>
                <time>{event.data.dateFrom.toLocaleDateString()}</time>
              </div>
            </a>
          ))}
        </div>
      </section>
    )}

    {recordings.length > 0 && (
      <section class="artist-recordings">
        <h2>{t(lang, 'artists.recordings')}</h2>
        <div class="recordings-list">
          {recordings.map((recording) => (
            <div class="recording-item">
              <h3>{recording.data.title}</h3>
              <AudioPlayer
                src={recording.data.audioFile}
                title={recording.data.title}
                artist={artist.data.name}
              />
            </div>
          ))}
        </div>
      </section>
    )}
  </article>
</BaseLayout>

<style>
  .artist-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .artist-header {
    display: flex;
    gap: 2rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }

  .artist-photo {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    overflow: hidden;
  }

  .artist-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .artist-info {
    flex: 1;
    min-width: 250px;
  }

  .artist-info h1 {
    font-size: 2.5rem;
    font-weight: 200;
    letter-spacing: 0.05em;
    margin: 0 0 0.5rem 0;
  }

  .artist-type {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .artist-social {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .artist-social a {
    color: #808080;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .artist-social a:hover {
    color: #d0d0d0;
  }

  .artist-bio {
    margin-bottom: 3rem;
  }

  .artist-bio h2 {
    font-size: 1.5rem;
    font-weight: 300;
    margin-bottom: 1rem;
  }

  .prose {
    line-height: 1.7;
    color: #d0d0d0;
  }

  .events-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .event-card {
    display: block;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    overflow: hidden;
    text-decoration: none;
    transition: transform 0.2s ease, background 0.2s ease;
  }

  .event-card:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.08);
  }

  .event-card img {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
  }

  .event-card-content {
    padding: 1rem;
  }

  .event-card h3 {
    font-size: 1.125rem;
    font-weight: 300;
    margin: 0 0 0.5rem 0;
    color: #fff;
  }

  .event-card time {
    color: #808080;
    font-size: 0.875rem;
  }

  .recordings-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .recording-item h3 {
    font-size: 1.125rem;
    font-weight: 300;
    margin-bottom: 0.75rem;
  }

  @media (max-width: 768px) {
    .artist-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }
</style>
```

**Test**:
```bash
npm run dev
# Navigate to /en/artists/[artist-slug]
```

**Commit**: `feat: add artist detail page with events and recordings`

### Task 10.3: Create Artists Grid Page

**File**: `src/pages/[lang]/artists/index.astro`

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { t } from '../../../i18n';

export async function getStaticPaths() {
  const languages = ['en', 'fr'] as const;
  return languages.map((lang) => ({
    params: { lang },
    props: { lang },
  }));
}

const { lang } = Astro.props;
const artists = await getCollection('artists');

// Sort artists: residents first (by order), then guests (alphabetically)
artists.sort((a, b) => {
  if (a.data.type === 'resident' && b.data.type === 'guest') return -1;
  if (a.data.type === 'guest' && b.data.type === 'resident') return 1;
  if (a.data.type === 'resident') {
    return a.data.order - b.data.order;
  }
  return a.data.name.localeCompare(b.data.name);
});

const residents = artists.filter(a => a.data.type === 'resident');
const guests = artists.filter(a => a.data.type === 'guest');
---

<BaseLayout title={t(lang, 'nav.artists')} lang={lang}>
  <div class="artists-page">
    <header class="page-header">
      <h1>{t(lang, 'nav.artists')}</h1>
    </header>

    {residents.length > 0 && (
      <section class="artists-section">
        <h2>{t(lang, 'artists.residents')}</h2>
        <div class="artists-grid">
          {residents.map((artist) => (
            <a
              href={`/${lang}/artists/${artist.slug}`}
              class="artist-card"
            >
              <div class="artist-image">
                {artist.data.photo ? (
                  <img src={artist.data.photo} alt={artist.data.name} />
                ) : (
                  <div class="artist-placeholder">
                    <span>{artist.data.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <h3>{artist.data.name}</h3>
            </a>
          ))}
        </div>
      </section>
    )}

    {guests.length > 0 && (
      <section class="artists-section">
        <h2>{t(lang, 'artists.guests')}</h2>
        <div class="artists-grid">
          {guests.map((artist) => (
            <a
              href={`/${lang}/artists/${artist.slug}`}
              class="artist-card"
            >
              <div class="artist-image">
                {artist.data.photo ? (
                  <img src={artist.data.photo} alt={artist.data.name} />
                ) : (
                  <div class="artist-placeholder">
                    <span>{artist.data.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <h3>{artist.data.name}</h3>
            </a>
          ))}
        </div>
      </section>
    )}
  </div>
</BaseLayout>

<style>
  .artists-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .page-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .page-header h1 {
    font-size: 3rem;
    font-weight: 200;
    letter-spacing: 0.1em;
  }

  .artists-section {
    margin-bottom: 4rem;
  }

  .artists-section h2 {
    font-size: 1.75rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    margin-bottom: 2rem;
    text-align: center;
    color: #808080;
  }

  .artists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
  }

  .artist-card {
    display: block;
    text-decoration: none;
    text-align: center;
    transition: transform 0.2s ease;
  }

  .artist-card:hover {
    transform: translateY(-5px);
  }

  .artist-image {
    width: 100%;
    aspect-ratio: 1;
    margin-bottom: 1rem;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.05);
  }

  .artist-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: filter 0.2s ease;
  }

  .artist-card:hover .artist-image img {
    filter: brightness(1.1);
  }

  .artist-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
  }

  .artist-placeholder span {
    font-size: 3rem;
    font-weight: 200;
    color: #808080;
  }

  .artist-card h3 {
    font-size: 1.125rem;
    font-weight: 300;
    color: #d0d0d0;
    letter-spacing: 0.02em;
  }

  @media (max-width: 768px) {
    .artists-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1.5rem;
    }
  }
</style>
```

**Test**:
```bash
npm run dev
# Navigate to /en/artists
```

**Commit**: `feat: add artists grid page with residents and guests sections`

## Phase 11: Static Pages (About, Contact)

### Task 11.1: Create About Page

**File**: `src/pages/[lang]/about.astro`

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { t } from '../../i18n';

export async function getStaticPaths() {
  const languages = ['en', 'fr'] as const;
  return languages.map((lang) => ({
    params: { lang },
    props: { lang },
  }));
}

const { lang } = Astro.props;

const content = {
  en: {
    title: 'About WOMB',
    intro: 'WOMB is a Brussels-based ambient music collective dedicated to creating immersive sonic experiences.',
    mission: {
      title: 'Our Mission',
      text: 'We curate and present ambient music events that explore the boundaries between sound, space, and consciousness. Our events feature both resident artists and international guests, creating a unique fusion of local and global perspectives on ambient music.'
    },
    philosophy: {
      title: 'Philosophy',
      text: 'WOMB believes in the transformative power of ambient music. We create spaces where listeners can disconnect from the everyday and immerse themselves in carefully curated sonic landscapes. Each event is designed as a journey, with artists selected for their ability to create coherent, evolving soundscapes that resonate with our dark, impressionist aesthetic.'
    },
    community: {
      title: 'Community',
      text: 'At the heart of WOMB is our community of artists, listeners, and collaborators. We foster connections between ambient music enthusiasts, providing a platform for both established and emerging artists to share their vision.'
    }
  },
  fr: {
    title: 'À propos de WOMB',
    intro: 'WOMB est un collectif de musique ambient basé à Bruxelles, dédié à la création d\'expériences sonores immersives.',
    mission: {
      title: 'Notre Mission',
      text: 'Nous organisons et présentons des événements de musique ambient qui explorent les frontières entre le son, l\'espace et la conscience. Nos événements mettent en vedette des artistes résidents et des invités internationaux, créant une fusion unique de perspectives locales et globales sur la musique ambient.'
    },
    philosophy: {
      title: 'Philosophie',
      text: 'WOMB croit au pouvoir transformateur de la musique ambient. Nous créons des espaces où les auditeurs peuvent se déconnecter du quotidien et s\'immerger dans des paysages sonores soigneusement sélectionnés. Chaque événement est conçu comme un voyage, avec des artistes sélectionnés pour leur capacité à créer des paysages sonores cohérents et évolutifs qui résonnent avec notre esthétique sombre et impressionniste.'
    },
    community: {
      title: 'Communauté',
      text: 'Au cœur de WOMB se trouve notre communauté d\'artistes, d\'auditeurs et de collaborateurs. Nous favorisons les connexions entre les passionnés de musique ambient, offrant une plateforme aux artistes établis et émergents pour partager leur vision.'
    }
  }
};

const currentContent = content[lang];
---

<BaseLayout title={currentContent.title} lang={lang}>
  <div class="about-page">
    <header class="page-header">
      <h1>{currentContent.title}</h1>
      <p class="intro">{currentContent.intro}</p>
    </header>

    <div class="content-sections">
      <section class="content-section">
        <h2>{currentContent.mission.title}</h2>
        <p>{currentContent.mission.text}</p>
      </section>

      <section class="content-section">
        <h2>{currentContent.philosophy.title}</h2>
        <p>{currentContent.philosophy.text}</p>
      </section>

      <section class="content-section">
        <h2>{currentContent.community.title}</h2>
        <p>{currentContent.community.text}</p>
      </section>
    </div>
  </div>
</BaseLayout>

<style>
  .about-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .page-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .page-header h1 {
    font-size: 3rem;
    font-weight: 200;
    letter-spacing: 0.1em;
    margin-bottom: 1.5rem;
  }

  .intro {
    font-size: 1.25rem;
    line-height: 1.6;
    color: #808080;
    font-weight: 300;
  }

  .content-sections {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .content-section h2 {
    font-size: 1.75rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
    color: #d0d0d0;
  }

  .content-section p {
    line-height: 1.8;
    color: #808080;
    font-weight: 300;
  }

  @media (max-width: 768px) {
    .page-header h1 {
      font-size: 2rem;
    }

    .intro {
      font-size: 1.125rem;
    }
  }
</style>
```

**Test**:
```bash
npm run dev
# Navigate to /en/about and /fr/about
```

**Commit**: `feat: add bilingual about page`

### Task 11.2: Create Contact Page

**File**: `src/pages/[lang]/contact.astro`

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { t } from '../../i18n';

export async function getStaticPaths() {
  const languages = ['en', 'fr'] as const;
  return languages.map((lang) => ({
    params: { lang },
    props: { lang },
  }));
}

const { lang } = Astro.props;

const content = {
  en: {
    title: 'Contact',
    intro: 'Get in touch with WOMB for bookings, collaborations, or general inquiries.',
    sections: {
      bookings: {
        title: 'Artist Bookings',
        email: 'bookings@womb-ambient.com',
        description: 'For artist bookings and event inquiries'
      },
      press: {
        title: 'Press & Media',
        email: 'press@womb-ambient.com',
        description: 'For press releases, interviews, and media requests'
      },
      general: {
        title: 'General Inquiries',
        email: 'info@womb-ambient.com',
        description: 'For general questions and information'
      }
    },
    social: {
      title: 'Follow Us',
      instagram: 'Instagram',
      soundcloud: 'SoundCloud'
    }
  },
  fr: {
    title: 'Contact',
    intro: 'Contactez WOMB pour des réservations, collaborations, ou questions générales.',
    sections: {
      bookings: {
        title: 'Réservations d\'Artistes',
        email: 'bookings@womb-ambient.com',
        description: 'Pour les réservations d\'artistes et demandes d\'événements'
      },
      press: {
        title: 'Presse & Médias',
        email: 'press@womb-ambient.com',
        description: 'Pour les communiqués de presse, interviews, et demandes médias'
      },
      general: {
        title: 'Demandes Générales',
        email: 'info@womb-ambient.com',
        description: 'Pour les questions et informations générales'
      }
    },
    social: {
      title: 'Suivez-nous',
      instagram: 'Instagram',
      soundcloud: 'SoundCloud'
    }
  }
};

const currentContent = content[lang];
---

<BaseLayout title={currentContent.title} lang={lang}>
  <div class="contact-page">
    <header class="page-header">
      <h1>{currentContent.title}</h1>
      <p class="intro">{currentContent.intro}</p>
    </header>

    <div class="contact-sections">
      <section class="contact-section">
        <h2>{currentContent.sections.bookings.title}</h2>
        <p class="description">{currentContent.sections.bookings.description}</p>
        <a href={`mailto:${currentContent.sections.bookings.email}`} class="email-link">
          {currentContent.sections.bookings.email}
        </a>
      </section>

      <section class="contact-section">
        <h2>{currentContent.sections.press.title}</h2>
        <p class="description">{currentContent.sections.press.description}</p>
        <a href={`mailto:${currentContent.sections.press.email}`} class="email-link">
          {currentContent.sections.press.email}
        </a>
      </section>

      <section class="contact-section">
        <h2>{currentContent.sections.general.title}</h2>
        <p class="description">{currentContent.sections.general.description}</p>
        <a href={`mailto:${currentContent.sections.general.email}`} class="email-link">
          {currentContent.sections.general.email}
        </a>
      </section>
    </div>

    <div class="social-section">
      <h2>{currentContent.social.title}</h2>
      <div class="social-links">
        <a
          href="https://instagram.com/womb_ambient"
          target="_blank"
          rel="noopener"
          class="social-link"
        >
          {currentContent.social.instagram}
        </a>
        <a
          href="https://soundcloud.com/womb-ambient"
          target="_blank"
          rel="noopener"
          class="social-link"
        >
          {currentContent.social.soundcloud}
        </a>
      </div>
    </div>
  </div>
</BaseLayout>

<style>
  .contact-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .page-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .page-header h1 {
    font-size: 3rem;
    font-weight: 200;
    letter-spacing: 0.1em;
    margin-bottom: 1.5rem;
  }

  .intro {
    font-size: 1.25rem;
    line-height: 1.6;
    color: #808080;
    font-weight: 300;
  }

  .contact-sections {
    display: grid;
    gap: 3rem;
    margin-bottom: 4rem;
  }

  .contact-section h2 {
    font-size: 1.5rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
    color: #d0d0d0;
  }

  .description {
    color: #808080;
    margin-bottom: 1rem;
    font-weight: 300;
  }

  .email-link {
    display: inline-block;
    color: #d0d0d0;
    text-decoration: none;
    font-size: 1.125rem;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .email-link:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
  }

  .social-section {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .social-section h2 {
    font-size: 1.5rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    margin-bottom: 1.5rem;
    color: #d0d0d0;
  }

  .social-links {
    display: flex;
    gap: 2rem;
    justify-content: center;
  }

  .social-link {
    color: #808080;
    text-decoration: none;
    font-size: 1.125rem;
    transition: color 0.2s ease;
  }

  .social-link:hover {
    color: #d0d0d0;
  }

  @media (max-width: 768px) {
    .page-header h1 {
      font-size: 2rem;
    }

    .intro {
      font-size: 1.125rem;
    }

    .contact-sections {
      gap: 2rem;
    }
  }
</style>
```

**Test**:
```bash
npm run dev
# Navigate to /en/contact and /fr/contact
```

**Commit**: `feat: add bilingual contact page with sections`

## Phase 12: FrontMatter CMS Configuration

### Task 12.1: Install FrontMatter Extension

**Instructions**:
1. Open VS Code
2. Go to Extensions (Cmd+Shift+X)
3. Search for "Front Matter CMS"
4. Install the extension by Elio Struyf
5. Reload VS Code

**Verify**:
```bash
# After installation, you should see the FrontMatter icon in the sidebar
```

**Commit**: `docs: add FrontMatter CMS installation instructions`

### Task 12.2: Initialize FrontMatter Configuration

**File**: `frontmatter.json`

```json
{
  "$schema": "https://frontmatter.codes/frontmatter.schema.json",
  "frontMatter.framework.id": "astro",
  "frontMatter.content.publicFolder": "public",
  "frontMatter.preview.host": "http://localhost:4340",
  "frontMatter.dashboard.openOnStart": false,
  "frontMatter.git.enabled": true,
  "frontMatter.taxonomy.contentTypes": [
    {
      "name": "event",
      "pageBundle": false,
      "previewPath": null,
      "fields": [
        {
          "title": "Number",
          "name": "number",
          "type": "number",
          "required": true
        },
        {
          "title": "Title (EN)",
          "name": "title.en",
          "type": "string",
          "required": true
        },
        {
          "title": "Title (FR)",
          "name": "title.fr",
          "type": "string",
          "required": true
        },
        {
          "title": "Date From",
          "name": "dateFrom",
          "type": "datetime",
          "required": true,
          "dateFormat": "yyyy-MM-dd"
        },
        {
          "title": "Date To",
          "name": "dateTo",
          "type": "datetime",
          "required": true,
          "dateFormat": "yyyy-MM-dd"
        },
        {
          "title": "Location",
          "name": "location",
          "type": "string",
          "required": true
        },
        {
          "title": "Cover Image",
          "name": "coverImage",
          "type": "image",
          "isPreviewImage": true
        },
        {
          "title": "Artists",
          "name": "artists",
          "type": "tags",
          "taxonomyLimit": 20
        }
      ]
    },
    {
      "name": "artist",
      "pageBundle": false,
      "previewPath": null,
      "fields": [
        {
          "title": "Name",
          "name": "name",
          "type": "string",
          "required": true
        },
        {
          "title": "Type",
          "name": "type",
          "type": "choice",
          "choices": ["resident", "guest"],
          "required": true
        },
        {
          "title": "Photo",
          "name": "photo",
          "type": "image"
        },
        {
          "title": "Instagram",
          "name": "instagram",
          "type": "string"
        },
        {
          "title": "SoundCloud",
          "name": "soundcloud",
          "type": "string"
        },
        {
          "title": "Website",
          "name": "website",
          "type": "string"
        },
        {
          "title": "Order",
          "name": "order",
          "type": "number",
          "default": 999
        }
      ]
    },
    {
      "name": "recording",
      "pageBundle": false,
      "previewPath": null,
      "fields": [
        {
          "title": "Title",
          "name": "title",
          "type": "string",
          "required": true
        },
        {
          "title": "Artist",
          "name": "artist",
          "type": "string",
          "required": true
        },
        {
          "title": "Event",
          "name": "event",
          "type": "string",
          "required": true
        },
        {
          "title": "Duration (seconds)",
          "name": "duration",
          "type": "number",
          "required": true
        },
        {
          "title": "Audio File",
          "name": "audioFile",
          "type": "file",
          "fileExtensions": ["wav", "mp3", "m4a"]
        },
        {
          "title": "Date",
          "name": "date",
          "type": "datetime",
          "required": true
        }
      ]
    },
    {
      "name": "media",
      "pageBundle": false,
      "previewPath": null,
      "fields": [
        {
          "title": "Type",
          "name": "type",
          "type": "choice",
          "choices": ["photo", "video"],
          "required": true
        },
        {
          "title": "File",
          "name": "file",
          "type": "file",
          "required": true
        },
        {
          "title": "Author",
          "name": "author",
          "type": "string"
        },
        {
          "title": "Date",
          "name": "date",
          "type": "datetime",
          "required": true
        },
        {
          "title": "Event",
          "name": "event",
          "type": "string"
        },
        {
          "title": "Artists",
          "name": "artists",
          "type": "tags"
        }
      ]
    }
  ],
  "frontMatter.content.pageFolders": [
    {
      "title": "Events",
      "path": "[[workspace]]/src/content/events"
    },
    {
      "title": "Artists",
      "path": "[[workspace]]/src/content/artists"
    },
    {
      "title": "Recordings",
      "path": "[[workspace]]/src/content/recordings"
    },
    {
      "title": "Media",
      "path": "[[workspace]]/src/content/media"
    }
  ],
  "frontMatter.data.files": [
    {
      "id": "artistsList",
      "title": "Artists List",
      "file": "[[workspace]]/src/data/artists.json",
      "fileType": "json",
      "labelField": "name",
      "schema": {
        "title": "Artist",
        "type": "object",
        "properties": {
          "slug": { "type": "string" },
          "name": { "type": "string" }
        }
      }
    }
  ]
}
```

**Test**:
1. Reload VS Code
2. Click FrontMatter icon in sidebar
3. Navigate to content folders
4. Try creating new content via UI

**Commit**: `feat: add FrontMatter CMS configuration`

### Task 12.3: Add FrontMatter Templates

**File**: `.frontmatter/templates/event.md`

```markdown
---
number:
title:
  en: ""
  fr: ""
dateFrom:
dateTo:
location: ""
coverImage: ""
artists: []
---

## Description (EN)

[English description here]

## Description (FR)

[French description here]
```

**File**: `.frontmatter/templates/artist.md`

```markdown
---
name: ""
type: "guest"
photo: ""
instagram: ""
soundcloud: ""
website: ""
order: 999
---

## Bio (EN)

[English biography here]

## Bio (FR)

[French biography here]
```

**File**: `.frontmatter/templates/recording.md`

```markdown
---
title: ""
artist: ""
event: ""
duration: 0
audioFile: ""
date:
---
```

**File**: `.frontmatter/templates/media.md`

```markdown
---
type: "photo"
file: ""
author: ""
date:
event: ""
artists: []
---
```

**Test**:
1. Open FrontMatter panel
2. Click "Create new" button
3. Select template
4. Verify fields pre-populate

**Commit**: `feat: add FrontMatter content templates`

## Phase 13: Content Migration Scripts

### Task 13.1: Create Migration Script for Events

**File**: `scripts/migrate-events.ts`

```typescript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

interface EventData {
  number: number;
  slug: string;
  title: { en: string; fr: string };
  dateFrom: string;
  dateTo: string;
  location: string;
  coverImage?: string;
  artists: string[];
  descriptionEN: string;
  descriptionFR: string;
}

// Example events data - replace with actual data
const events: EventData[] = [
  {
    number: 0,
    slug: 'episode-0',
    title: { en: 'Episode Zero', fr: 'Épisode Zéro' },
    dateFrom: '2023-06-15',
    dateTo: '2023-06-16',
    location: 'Brussels',
    coverImage: '/womb/WOMB/Events/Episode 0/promo.jpg',
    artists: ['dragan-markovic', 'emsy'],
    descriptionEN: 'The inaugural WOMB event...',
    descriptionFR: 'Le premier événement WOMB...'
  },
  {
    number: 2,
    slug: 'episode-2',
    title: { en: 'Episode Two', fr: 'Épisode Deux' },
    dateFrom: '2023-12-15',
    dateTo: '2023-12-16',
    location: 'Brussels',
    coverImage: '/womb/WOMB/Events/Episode Deux/WombEpisode2_FB.png',
    artists: ['dragan-markovic', 'emsy', 'keyframe', 'rafa', 'rotor', 'sebcat'],
    descriptionEN: 'The second edition of WOMB brings together...',
    descriptionFR: 'La deuxième édition de WOMB rassemble...'
  },
  // Add more events...
];

function createEventMarkdown(event: EventData): string {
  return `---
number: ${event.number}
title:
  en: "${event.title.en}"
  fr: "${event.title.fr}"
dateFrom: ${event.dateFrom}
dateTo: ${event.dateTo}
location: "${event.location}"
coverImage: "${event.coverImage || ''}"
artists:
${event.artists.map(a => `  - ${a}`).join('\n')}
---

## Description (EN)

${event.descriptionEN}

## Description (FR)

${event.descriptionFR}
`;
}

async function migrateEvents() {
  const eventsDir = path.join(projectRoot, 'src/content/events');

  // Create directory if it doesn't exist
  if (!fs.existsSync(eventsDir)) {
    fs.mkdirSync(eventsDir, { recursive: true });
  }

  // Create markdown files for each event
  for (const event of events) {
    const filePath = path.join(eventsDir, `${event.slug}.md`);
    const content = createEventMarkdown(event);

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Created: ${event.slug}.md`);
  }

  console.log(`\n✨ Migrated ${events.length} events successfully!`);
}

// Run migration
migrateEvents().catch(console.error);
```

**Run**:
```bash
npx tsx scripts/migrate-events.ts
```

**Commit**: `feat: add event migration script`

### Task 13.2: Create Migration Script for Artists

**File**: `scripts/migrate-artists.ts`

```typescript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

interface ArtistData {
  slug: string;
  name: string;
  type: 'resident' | 'guest';
  photo?: string;
  instagram?: string;
  soundcloud?: string;
  website?: string;
  order?: number;
  bioEN: string;
  bioFR: string;
}

// Example artists data - replace with actual data
const artists: ArtistData[] = [
  {
    slug: 'dragan-markovic',
    name: 'Dragan Markovic',
    type: 'resident',
    photo: '/womb/WOMB/Artists/dragan.jpg',
    instagram: 'https://instagram.com/dragan_markovic',
    soundcloud: 'https://soundcloud.com/dragan-markovic',
    order: 1,
    bioEN: 'Dragan is a Brussels-based ambient artist and founder of WOMB...',
    bioFR: 'Dragan est un artiste ambient basé à Bruxelles et fondateur de WOMB...'
  },
  {
    slug: 'emsy',
    name: 'Emsy',
    type: 'resident',
    photo: '/womb/WOMB/Artists/emsy.jpg',
    soundcloud: 'https://soundcloud.com/emsy-music',
    order: 2,
    bioEN: 'Emsy creates deep, immersive soundscapes...',
    bioFR: 'Emsy crée des paysages sonores profonds et immersifs...'
  },
  {
    slug: 'keyframe',
    name: 'Keyframe',
    type: 'guest',
    soundcloud: 'https://soundcloud.com/keyframe',
    bioEN: 'Keyframe is known for cinematic ambient compositions...',
    bioFR: 'Keyframe est connu pour ses compositions ambient cinématiques...'
  },
  // Add more artists...
];

function createArtistMarkdown(artist: ArtistData): string {
  return `---
name: "${artist.name}"
type: "${artist.type}"
${artist.photo ? `photo: "${artist.photo}"` : ''}
${artist.instagram ? `instagram: "${artist.instagram}"` : ''}
${artist.soundcloud ? `soundcloud: "${artist.soundcloud}"` : ''}
${artist.website ? `website: "${artist.website}"` : ''}
${artist.order ? `order: ${artist.order}` : ''}
---

## Bio (EN)

${artist.bioEN}

## Bio (FR)

${artist.bioFR}
`;
}

async function migrateArtists() {
  const artistsDir = path.join(projectRoot, 'src/content/artists');

  // Create directory if it doesn't exist
  if (!fs.existsSync(artistsDir)) {
    fs.mkdirSync(artistsDir, { recursive: true });
  }

  // Create markdown files for each artist
  for (const artist of artists) {
    const filePath = path.join(artistsDir, `${artist.slug}.md`);
    const content = createArtistMarkdown(artist);

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Created: ${artist.slug}.md`);
  }

  // Create artists data file for reference
  const artistsData = artists.map(a => ({
    slug: a.slug,
    name: a.name
  }));

  const dataDir = path.join(projectRoot, 'src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(dataDir, 'artists.json'),
    JSON.stringify(artistsData, null, 2),
    'utf-8'
  );

  console.log(`\n✨ Migrated ${artists.length} artists successfully!`);
}

// Run migration
migrateArtists().catch(console.error);
```

**Run**:
```bash
npx tsx scripts/migrate-artists.ts
```

**Commit**: `feat: add artist migration script`

### Task 13.3: Create Media Catalog Script

**File**: `scripts/catalog-media.ts`

```typescript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

interface MediaFile {
  type: 'photo' | 'video';
  file: string;
  author?: string;
  date: string;
  event?: string;
  artists?: string[];
}

const mediaExtensions = {
  photo: ['.jpg', '.jpeg', '.png', '.heic', '.webp'],
  video: ['.mp4', '.mov', '.webm']
};

function getMediaType(filePath: string): 'photo' | 'video' | null {
  const ext = path.extname(filePath).toLowerCase();
  if (mediaExtensions.photo.includes(ext)) return 'photo';
  if (mediaExtensions.video.includes(ext)) return 'video';
  return null;
}

function extractEventFromPath(filePath: string): string | undefined {
  const match = filePath.match(/Episode\s*(\w+)/i);
  if (match) {
    const episodeNum = match[1].toLowerCase();
    return `episode-${episodeNum}`;
  }
  return undefined;
}

function extractAuthorFromPath(filePath: string): string | undefined {
  // Try to extract photographer/videographer name from path
  const parts = filePath.split('/');
  const authorPatterns = ['Photos by', 'Videos by', 'by'];

  for (const part of parts) {
    for (const pattern of authorPatterns) {
      if (part.includes(pattern)) {
        return part.replace(pattern, '').trim();
      }
    }
  }

  return undefined;
}

async function catalogMedia() {
  const mediaRootDir = path.join(projectRoot, 'public/WOMB/Visus');
  const contentDir = path.join(projectRoot, 'src/content/media');

  // Create content directory if it doesn't exist
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  const mediaFiles: MediaFile[] = [];

  // Recursively scan media directory
  function scanDirectory(dirPath: string) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile()) {
        const mediaType = getMediaType(entry.name);
        if (mediaType) {
          const relativePath = path.relative(
            path.join(projectRoot, 'public'),
            fullPath
          );

          mediaFiles.push({
            type: mediaType,
            file: `/${relativePath}`,
            author: extractAuthorFromPath(fullPath),
            date: '2023-12-15', // Default date, update as needed
            event: extractEventFromPath(fullPath),
            artists: []
          });
        }
      }
    }
  }

  if (fs.existsSync(mediaRootDir)) {
    scanDirectory(mediaRootDir);
  }

  // Create markdown files for each media item
  mediaFiles.forEach((media, index) => {
    const filename = `media-${String(index + 1).padStart(4, '0')}.md`;
    const filePath = path.join(contentDir, filename);

    const content = `---
type: "${media.type}"
file: "${media.file}"
${media.author ? `author: "${media.author}"` : ''}
date: ${media.date}
${media.event ? `event: "${media.event}"` : ''}
artists: []
---
`;

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Cataloged: ${filename}`);
  });

  console.log(`\n✨ Cataloged ${mediaFiles.length} media files successfully!`);
}

// Run catalog
catalogMedia().catch(console.error);
```

**Run**:
```bash
npx tsx scripts/catalog-media.ts
```

**Commit**: `feat: add media cataloging script`

## Phase 14: Testing & Deployment

### Task 14.1: Create Testing Checklist

**File**: `docs/testing-checklist.md`

```markdown
# WOMB Site Testing Checklist

## Desktop Browser Testing

### Chrome
- [ ] Landing page loads correctly
- [ ] Language toggle works
- [ ] Navigation between all pages
- [ ] Event pages display correctly
- [ ] Artist pages display correctly
- [ ] Audio player works (play/pause/seek)
- [ ] Gallery lightbox opens/closes
- [ ] Gallery navigation (prev/next)
- [ ] Keyboard navigation in gallery (arrows, ESC)
- [ ] All external links work

### Firefox
- [ ] All items from Chrome checklist
- [ ] Audio player compatibility
- [ ] CSS rendering correct

### Safari
- [ ] All items from Chrome checklist
- [ ] Audio player compatibility
- [ ] Touch gestures on trackpad

### Edge
- [ ] All items from Chrome checklist

## Mobile Testing

### iOS Safari
- [ ] Responsive layout
- [ ] Touch targets minimum 44px
- [ ] Gallery swipe gestures work
- [ ] Audio player controls accessible
- [ ] Navigation menu works
- [ ] Pinch to zoom disabled where appropriate

### Android Chrome
- [ ] All items from iOS Safari checklist
- [ ] Hardware back button behavior

## Performance Testing

- [ ] Lighthouse score > 90 for Performance
- [ ] Images lazy load correctly
- [ ] No layout shift (CLS < 0.1)
- [ ] First Contentful Paint < 2s
- [ ] Total bundle size < 500KB

## Accessibility Testing

- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatible
- [ ] Color contrast WCAG AA compliant
- [ ] Focus indicators visible
- [ ] Alt text for all images
- [ ] ARIA labels where needed

## Content Testing

- [ ] All events display correctly
- [ ] All artists have profiles
- [ ] Audio files play correctly
- [ ] Images load correctly
- [ ] French translations accurate
- [ ] English translations accurate
- [ ] No broken links

## Audio Protection Testing

- [ ] Right-click disabled on audio player
- [ ] No download button visible
- [ ] Browser dev tools don't easily reveal direct URLs
- [ ] Audio loads via blob URLs

## SEO Testing

- [ ] Meta tags present on all pages
- [ ] Open Graph tags for social sharing
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Canonical URLs set

## Deployment Testing

- [ ] Build completes without errors
- [ ] All assets load on production
- [ ] GitHub Pages deployment successful
- [ ] Custom domain works (if configured)
- [ ] HTTPS enabled
```

**Test**: Review checklist and run through each item

**Commit**: `docs: add comprehensive testing checklist`

### Task 14.2: Performance Optimization

**File**: `astro.config.mjs` (update)

```javascript
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import compress from 'astro-compress';

export default defineConfig({
  integrations: [
    preact(),
    compress({
      css: true,
      html: true,
      js: true,
      img: false, // Don't compress images, they're already optimized
      svg: true,
    })
  ],
  server: { port: 4340 },
  site: 'https://vanmarkic.github.io',
  base: '/womb',
  vite: {
    build: {
      assetsInlineLimit: 4096, // Inline small assets
      rollupOptions: {
        output: {
          manualChunks: {
            'radix': ['@radix-ui/react-dialog'],
          }
        }
      }
    },
    ssr: {
      noExternal: ['@radix-ui/*'] // Bundle Radix UI
    }
  },
  image: {
    domains: ['vanmarkic.github.io'],
  },
  build: {
    inlineStylesheets: 'auto' // Inline critical CSS
  }
});
```

**Install**:
```bash
npm install astro-compress
```

**Test**:
```bash
npm run build
# Check dist/ folder size
```

**Commit**: `perf: add build optimizations and compression`

### Task 14.3: Add Meta Tags and SEO

**File**: `src/layouts/BaseLayout.astro` (update)

```astro
---
export interface Props {
  title: string;
  description?: string;
  image?: string;
  lang: 'en' | 'fr';
}

const {
  title,
  description = 'WOMB - Brussels-based ambient music collective',
  image = '/womb/og-image.jpg',
  lang
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!DOCTYPE html>
<html lang={lang}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="generator" content={Astro.generator} />

  <!-- Primary Meta Tags -->
  <title>{title} | WOMB</title>
  <meta name="title" content={`${title} | WOMB`} />
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalURL} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonicalURL} />
  <meta property="og:title" content={`${title} | WOMB`} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={canonicalURL} />
  <meta property="twitter:title" content={`${title} | WOMB`} />
  <meta property="twitter:description" content={description} />
  <meta property="twitter:image" content={image} />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/womb/favicon.svg" />
  <link rel="alternate" type="image/png" href="/womb/favicon.png" />

  <!-- Language alternates -->
  {lang === 'en' ? (
    <link rel="alternate" hreflang="fr" href={Astro.url.pathname.replace('/en/', '/fr/')} />
  ) : (
    <link rel="alternate" hreflang="en" href={Astro.url.pathname.replace('/fr/', '/en/')} />
  )}

  <!-- Global Styles -->
  <style>
    /* Base styles... */
  </style>
</head>
<body>
  <Header lang={lang} />
  <main>
    <slot />
  </main>
</body>
</html>
```

**Test**:
```bash
npm run build
npm run preview
# Check meta tags with browser dev tools
```

**Commit**: `feat: add comprehensive SEO meta tags`

### Task 14.4: Final Build and Deploy

**Commands**:
```bash
# Run full test suite
npm run build

# Preview production build locally
npm run preview

# If everything looks good, commit and push
git add .
git commit -m "feat: complete womb event site implementation"
git push origin main

# GitHub Actions will automatically deploy to GitHub Pages
```

**Verify Deployment**:
1. Go to https://vanmarkic.github.io/womb
2. Test all functionality
3. Check all pages load correctly
4. Verify media files work

**Commit**: `deploy: final build for production deployment`

## Summary

This implementation plan for phases 9-14 provides:

### Phase 9: Gallery Component
- Full lightbox functionality with Radix Dialog
- Keyboard navigation and touch gestures
- Responsive grid layout
- Photo and video support

### Phase 10: Artist Pages
- Artist detail pages with bio, events, and recordings
- Artists grid with residents/guests sections
- Proper content relationships

### Phase 11: Static Pages
- Bilingual About page
- Bilingual Contact page with sections
- Consistent dark aesthetic

### Phase 12: FrontMatter CMS
- Complete configuration for all content types
- Templates for easy content creation
- Visual editing interface in VS Code

### Phase 13: Content Migration
- Scripts to migrate existing content
- Media cataloging automation
- Data structure preservation

### Phase 14: Testing & Deployment
- Comprehensive testing checklist
- Performance optimizations
- SEO implementation
- Production deployment process

Each task includes:
- Exact file paths
- Complete working code
- Test commands
- Git commit messages

The implementation follows the dark ambient aesthetic specified in the design document, with proper internationalization, accessibility, and performance optimizations throughout.