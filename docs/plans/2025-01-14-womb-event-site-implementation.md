# WOMB Event-Centric Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform WOMB into a bilingual event-centric website with protected audio streaming, gallery lightbox, and FrontMatter CMS integration.

**Architecture:** Astro SSG with Content Collections for type-safe content management, Preact components for client interactivity (audio player, gallery), path-based i18n routing, and FrontMatter CMS for content editing. Landing page preserved, new pages at `/[lang]/` routes.

**Tech Stack:** Astro 5.x, Preact, Radix UI, Content Collections, FrontMatter CMS, Vanilla CSS

---

## Phase 1: Dependencies & Configuration

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Preact integration**

Run: `npm install @astrojs/preact preact`
Expected: Dependencies added to package.json

**Step 2: Install Radix UI Dialog**

Run: `npm install @radix-ui/react-dialog`
Expected: Dependency added to package.json

**Step 3: Verify installation**

Run: `npm list @astrojs/preact preact @radix-ui/react-dialog`
Expected: All three packages listed with versions

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add preact and radix ui dependencies"
```

### Task 2: Configure Astro for Preact

**Files:**
- Modify: `astro.config.mjs`

**Step 1: Import Preact integration**

Update `astro.config.mjs`:

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
	integrations: [preact()],
	server: {
		port: 4340,
	},
	site: 'https://vanmarkic.github.io',
	base: '/womb',
	vite: {
		build: {
			assetsInlineLimit: 0 // Don't inline large media files
		}
	}
});
```

**Step 2: Test dev server**

Run: `npm run dev`
Expected: Server starts on port 4340, no errors

**Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "feat: configure preact integration and vite build settings"
```

---

## Phase 2: Content Collections Setup

### Task 3: Create Content Collections Schema

**Files:**
- Create: `src/content/config.ts`

**Step 1: Create content directory structure**

Run: `mkdir -p src/content/{events,artists,recordings,media}`
Expected: Four directories created

**Step 2: Create schema file**

Create `src/content/config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';

const artists = defineCollection({
	type: 'content',
	schema: z.object({
		name: z.string(),
		type: z.enum(['resident', 'guest']),
		photo: z.string().optional(),
		instagram: z.string().optional(),
		soundcloud: z.string().optional(),
	}),
});

const events = defineCollection({
	type: 'content',
	schema: z.object({
		number: z.number(),
		title: z.object({
			en: z.string(),
			fr: z.string(),
		}),
		dateFrom: z.coerce.date(),
		dateTo: z.coerce.date(),
		location: z.string(),
		coverImage: z.string().optional(),
		artists: z.array(z.string()),
	}),
});

const recordings = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		artist: z.string(),
		event: z.string(),
		duration: z.number(),
		audioFile: z.string(),
		date: z.coerce.date(),
	}),
});

const media = defineCollection({
	type: 'content',
	schema: z.object({
		type: z.enum(['photo', 'video']),
		file: z.string(),
		author: z.string().optional(),
		date: z.coerce.date(),
		event: z.string().optional(),
		artists: z.array(z.string()).optional(),
	}),
});

export const collections = { artists, events, recordings, media };
```

**Step 3: Test schema validation**

Run: `npm run dev`
Expected: No errors, Astro recognizes content collections

**Step 4: Commit**

```bash
git add src/content/config.ts
git commit -m "feat: add content collections schemas for artists, events, recordings, media"
```

### Task 4: Create Test Content (Episode 2)

**Files:**
- Create: `src/content/events/episode-2.md`
- Create: `src/content/artists/dragan-markovic.md`

**Step 1: Create test event**

Create `src/content/events/episode-2.md`:

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
---

## Description (EN)
The second edition of WOMB brought together ambient artists for an immersive night of sound and visuals.

## Description (FR)
La deuxième édition de WOMB a réuni des artistes ambient pour une nuit immersive de son et de visuels.
```

**Step 2: Create test artist**

Create `src/content/artists/dragan-markovic.md`:

```markdown
---
name: Dragan Markovic
type: resident
---

## Bio (EN)
Dragan Markovic is a Brussels-based ambient artist and curator, founder of WOMB.

## Bio (FR)
Dragan Markovic est un artiste ambient et curateur basé à Bruxelles, fondateur de WOMB.
```

**Step 3: Verify content loads**

Run: `npm run dev`
Expected: No validation errors

**Step 4: Commit**

```bash
git add src/content/events/episode-2.md src/content/artists/dragan-markovic.md
git commit -m "feat: add test content for episode 2 and dragan artist"
```

---

## Phase 3: i18n Setup

### Task 5: Create Translation Files

**Files:**
- Create: `src/i18n/en.json`
- Create: `src/i18n/fr.json`
- Create: `src/i18n/index.ts`

**Step 1: Create directory**

Run: `mkdir -p src/i18n`
Expected: Directory created

**Step 2: Create English translations**

Create `src/i18n/en.json`:

```json
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
    "recordings": "Recordings",
    "allArtists": "All Artists"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error"
  }
}
```

**Step 3: Create French translations**

Create `src/i18n/fr.json`:

```json
{
  "nav": {
    "events": "Événements",
    "artists": "Artistes",
    "about": "À propos",
    "contact": "Contact"
  },
  "events": {
    "title": "Événements",
    "archive": "Archives",
    "lineup": "Line-up",
    "recordings": "Enregistrements",
    "gallery": "Galerie"
  },
  "artists": {
    "resident": "Résident",
    "guest": "Invité",
    "events": "Événements",
    "recordings": "Enregistrements",
    "allArtists": "Tous les artistes"
  },
  "common": {
    "loading": "Chargement...",
    "error": "Erreur"
  }
}
```

**Step 4: Create helper utilities**

Create `src/i18n/index.ts`:

```typescript
import en from './en.json';
import fr from './fr.json';

export const translations = { en, fr };

export type Language = 'en' | 'fr';

export function getTranslation(lang: Language, path: string): string {
	const keys = path.split('.');
	let value: any = translations[lang];

	for (const key of keys) {
		value = value?.[key];
	}

	return value || path;
}
```

**Step 5: Commit**

```bash
git add src/i18n/
git commit -m "feat: add i18n translation files and utilities"
```

---

## Phase 4: Base Layout & Navigation

### Task 6: Create Base Layout

**Files:**
- Create: `src/layouts/BaseLayout.astro`

**Step 1: Create layouts directory**

Run: `mkdir -p src/layouts`
Expected: Directory created

**Step 2: Create base layout**

Create `src/layouts/BaseLayout.astro`:

```astro
---
import type { Language } from '../i18n';

interface Props {
	lang: Language;
	title: string;
}

const { lang, title } = Astro.props;
---
<!DOCTYPE html>
<html lang={lang}>
<head>
	<meta charset="utf-8" />
	<link rel="icon" type="image/svg+xml" href="/womb/favicon.svg" />
	<meta name="viewport" content="width=device-width" />
	<meta name="generator" content={Astro.generator} />
	<title>{title} | WOMB</title>
</head>
<body>
	<slot />
</body>
</html>

<style is:global>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	html, body {
		width: 100%;
		height: 100%;
	}

	body {
		background: #0a0a0a;
		color: #e0e0e0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
	}

	a {
		color: inherit;
		text-decoration: none;
	}
</style>
```

**Step 3: Test layout**

Run: `npm run dev`
Expected: No errors

**Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: add base layout with dark ambient styling"
```

### Task 7: Create Header Component

**Files:**
- Create: `src/components/Header.astro`

**Step 1: Create components directory**

Run: `mkdir -p src/components`
Expected: Directory created

**Step 2: Create header component**

Create `src/components/Header.astro`:

```astro
---
import { translations, type Language } from '../i18n';

interface Props {
	lang: Language;
}

const { lang } = Astro.props;
const t = translations[lang];
const currentPath = Astro.url.pathname;

// Helper to check if path is active
function isActive(path: string): boolean {
	return currentPath.includes(path);
}

// Helper to switch language
function switchLang(toLang: Language): string {
	return currentPath.replace(`/${lang}/`, `/${toLang}/`);
}
---

<header class="header">
	<a href={`/${lang}/events`} class="logo">WOMB</a>

	<nav class="nav">
		<a
			href={`/${lang}/events`}
			class:list={['nav-link', { active: isActive('/events') }]}
		>
			{t.nav.events}
		</a>
		<a
			href={`/${lang}/artists`}
			class:list={['nav-link', { active: isActive('/artists') }]}
		>
			{t.nav.artists}
		</a>
		<a
			href={`/${lang}/about`}
			class:list={['nav-link', { active: isActive('/about') }]}
		>
			{t.nav.about}
		</a>
		<a
			href={`/${lang}/contact`}
			class:list={['nav-link', { active: isActive('/contact') }]}
		>
			{t.nav.contact}
		</a>
	</nav>

	<div class="lang-toggle">
		<a
			href={switchLang('en')}
			class:list={{ active: lang === 'en' }}
		>
			EN
		</a>
		<span class="separator">/</span>
		<a
			href={switchLang('fr')}
			class:list={{ active: lang === 'fr' }}
		>
			FR
		</a>
	</div>
</header>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2rem;
		border-bottom: 1px solid rgba(255,255,255,0.08);
		background: rgba(10, 10, 10, 0.95);
		backdrop-filter: blur(10px);
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 200;
		letter-spacing: 0.3em;
		color: #d0d0d0;
		transition: opacity 0.3s;
	}

	.logo:hover {
		opacity: 0.7;
	}

	.nav {
		display: flex;
		gap: 2rem;
	}

	.nav-link {
		color: #808080;
		font-size: 0.95rem;
		letter-spacing: 0.1em;
		transition: color 0.3s;
		text-transform: lowercase;
	}

	.nav-link:hover,
	.nav-link.active {
		color: #d0d0d0;
	}

	.lang-toggle {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.9rem;
		letter-spacing: 0.1em;
	}

	.lang-toggle a {
		color: #808080;
		transition: color 0.3s;
	}

	.lang-toggle a:hover,
	.lang-toggle a.active {
		color: #d0d0d0;
	}

	.separator {
		color: rgba(255,255,255,0.3);
	}

	@media (max-width: 768px) {
		.header {
			flex-direction: column;
			gap: 1.5rem;
			padding: 1rem;
		}

		.nav {
			gap: 1.5rem;
			font-size: 0.85rem;
			flex-wrap: wrap;
			justify-content: center;
		}
	}
</style>
```

**Step 3: Test header**

Run: `npm run dev`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: add header with navigation and language toggle"
```

---

## Phase 5: Events Archive Page

### Task 8: Create Events Archive Page

**Files:**
- Create: `src/pages/[lang]/events/index.astro`

**Step 1: Create page directory structure**

Run: `mkdir -p src/pages/\[lang\]/events`
Expected: Directory created

**Step 2: Create events archive page**

Create `src/pages/[lang]/events/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Header from '../../../components/Header.astro';
import { translations, type Language } from '../../../i18n';

export async function getStaticPaths() {
	const events = await getCollection('events');
	const languages: Language[] = ['en', 'fr'];

	return languages.map(lang => ({
		params: { lang },
		props: {
			events: events.sort((a, b) => b.data.number - a.data.number),
			lang
		}
	}));
}

const { events, lang } = Astro.props;
const t = translations[lang];
---

<BaseLayout lang={lang} title={t.events.archive}>
	<Header lang={lang} />

	<main class="events-archive">
		<h1>{t.events.archive}</h1>

		<div class="events-grid">
			{events.map(event => (
				<a href={`/${lang}/events/${event.id}`} class="event-card">
					{event.data.coverImage && (
						<img
							src={event.data.coverImage}
							alt={event.data.title[lang]}
							loading="lazy"
						/>
					)}
					<div class="event-card-content">
						<h2>{event.data.title[lang]}</h2>
						<p class="event-card-meta">
							{new Date(event.data.dateFrom).toLocaleDateString(lang, {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
							{event.data.dateFrom.getTime() !== event.data.dateTo.getTime() && (
								<>
									{' - '}
									{new Date(event.data.dateTo).toLocaleDateString(lang, {
										month: 'long',
										day: 'numeric'
									})}
								</>
							)}
							<span class="separator">•</span>
							{event.data.location}
						</p>
					</div>
				</a>
			))}
		</div>
	</main>
</BaseLayout>

<style>
	.events-archive {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	h1 {
		font-size: 2.5rem;
		font-weight: 200;
		letter-spacing: 0.2em;
		margin-bottom: 3rem;
		text-transform: lowercase;
	}

	.events-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 2rem;
	}

	.event-card {
		background: rgba(255, 255, 255, 0.03);
		border-radius: 8px;
		overflow: hidden;
		transition: transform 0.3s, background 0.3s;
		display: block;
	}

	.event-card:hover {
		transform: translateY(-4px);
		background: rgba(255, 255, 255, 0.06);
	}

	.event-card img {
		width: 100%;
		aspect-ratio: 16/9;
		object-fit: cover;
		filter: brightness(0.8);
	}

	.event-card-content {
		padding: 1.5rem;
	}

	.event-card h2 {
		font-size: 1.5rem;
		font-weight: 300;
		margin: 0 0 0.75rem 0;
		letter-spacing: 0.1em;
	}

	.event-card-meta {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.9rem;
		letter-spacing: 0.05em;
	}

	.separator {
		margin: 0 0.5rem;
	}

	@media (max-width: 768px) {
		.events-archive {
			padding: 2rem 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.events-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
```

**Step 3: Test page**

Run: `npm run dev`
Navigate to: `http://localhost:4340/womb/en/events`
Expected: Events archive page displays with Episode 2 card

**Step 4: Commit**

```bash
git add src/pages/\[lang\]/events/index.astro
git commit -m "feat: add events archive page with grid layout"
```

---

## Phase 6: Event Detail Page

### Task 9: Create Event Detail Page Template

**Files:**
- Create: `src/pages/[lang]/events/[slug].astro`

**Step 1: Create event detail page**

Create `src/pages/[lang]/events/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Header from '../../../components/Header.astro';
import { translations, type Language } from '../../../i18n';

export async function getStaticPaths() {
	const events = await getCollection('events');
	const artists = await getCollection('artists');
	const languages: Language[] = ['en', 'fr'];

	return languages.flatMap(lang =>
		events.map(event => {
			const eventArtists = artists.filter(a =>
				event.data.artists.includes(a.id)
			);

			return {
				params: { lang, slug: event.id },
				props: { event, eventArtists, lang }
			};
		})
	);
}

const { event, eventArtists, lang } = Astro.props;
const t = translations[lang];
const { Content } = await event.render();

// Sort artists: residents first
const residents = eventArtists.filter(a => a.data.type === 'resident');
const guests = eventArtists.filter(a => a.data.type === 'guest');
const sortedArtists = [...residents, ...guests];
---

<BaseLayout lang={lang} title={event.data.title[lang]}>
	<Header lang={lang} />

	<main class="event-detail">
		<!-- Hero Section -->
		<header class="event-hero">
			{event.data.coverImage && (
				<div class="hero-image-wrapper">
					<img src={event.data.coverImage} alt={event.data.title[lang]} />
				</div>
			)}
			<div class="event-hero-content">
				<h1>{event.data.title[lang]}</h1>
				<p class="event-meta">
					{new Date(event.data.dateFrom).toLocaleDateString(lang, {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
					{event.data.dateFrom.getTime() !== event.data.dateTo.getTime() && (
						<>
							{' - '}
							{new Date(event.data.dateTo).toLocaleDateString(lang, {
								month: 'long',
								day: 'numeric'
							})}
						</>
					)}
					<span class="separator">|</span>
					{event.data.location}
				</p>
			</div>
		</header>

		<!-- Description -->
		<section class="event-description">
			<Content />
		</section>

		<!-- Artists Lineup -->
		{sortedArtists.length > 0 && (
			<section class="event-section">
				<h2>{t.events.lineup}</h2>
				<div class="artist-grid">
					{sortedArtists.map(artist => (
						<a href={`/${lang}/artists/${artist.id}`} class="artist-card">
							{artist.data.photo && (
								<img src={artist.data.photo} alt={artist.data.name} />
							)}
							<div class="artist-card-content">
								<h3>{artist.data.name}</h3>
								<span class="artist-type">
									{artist.data.type === 'resident' ? t.artists.resident : t.artists.guest}
								</span>
							</div>
						</a>
					))}
				</div>
			</section>
		)}
	</main>
</BaseLayout>

<style>
	.event-detail {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem 4rem;
	}

	.event-hero {
		position: relative;
		margin-bottom: 3rem;
		border-radius: 12px;
		overflow: hidden;
	}

	.hero-image-wrapper {
		position: relative;
		width: 100%;
		height: 450px;
	}

	.event-hero img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: blur(1px) brightness(0.6);
	}

	.event-hero-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 3rem 2rem 2rem;
		background: linear-gradient(to top, rgba(10,10,10,0.95), transparent);
		color: white;
	}

	.event-hero h1 {
		font-size: 3.5rem;
		font-weight: 200;
		letter-spacing: 0.25em;
		margin: 0 0 0.5rem 0;
		text-transform: lowercase;
	}

	.event-meta {
		font-size: 1.1rem;
		opacity: 0.8;
		letter-spacing: 0.05em;
	}

	.separator {
		margin: 0 0.75rem;
	}

	.event-description {
		margin: 3rem 0;
		line-height: 1.8;
		font-size: 1.1rem;
		color: rgba(255,255,255,0.8);
	}

	.event-section {
		margin: 4rem 0;
	}

	.event-section h2 {
		font-size: 2rem;
		font-weight: 200;
		letter-spacing: 0.2em;
		margin-bottom: 2rem;
		text-transform: lowercase;
	}

	.artist-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 2rem;
	}

	.artist-card {
		display: block;
		transition: opacity 0.3s;
	}

	.artist-card:hover {
		opacity: 0.7;
	}

	.artist-card img {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		filter: grayscale(40%);
		margin-bottom: 1rem;
		border-radius: 4px;
	}

	.artist-card-content h3 {
		font-size: 1.1rem;
		font-weight: 300;
		margin-bottom: 0.25rem;
		letter-spacing: 0.05em;
	}

	.artist-type {
		font-size: 0.85rem;
		color: rgba(255,255,255,0.5);
		text-transform: lowercase;
		letter-spacing: 0.05em;
	}

	@media (max-width: 768px) {
		.event-detail {
			padding: 0 1rem 3rem;
		}

		.hero-image-wrapper {
			height: 300px;
		}

		.event-hero h1 {
			font-size: 2rem;
		}

		.event-hero-content {
			padding: 2rem 1rem 1rem;
		}

		.artist-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem;
		}
	}
</style>
```

**Step 2: Test event detail page**

Run: `npm run dev`
Navigate to: `http://localhost:4340/womb/en/events/episode-2`
Expected: Event detail page displays with hero, description, and lineup

**Step 3: Commit**

```bash
git add src/pages/\[lang\]/events/\[slug\].astro
git commit -m "feat: add event detail page with hero, description, and artist lineup"
```

---

## Phase 7: Add Language Toggle to Landing Page

### Task 10: Update Landing Page with Language Selector

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Add language selector to landing page**

At the end of the `<body>` tag in `src/pages/index.astro`, before the closing `</body>`, add:

```astro
<!-- Language selector overlay -->
<div class="lang-enter">
	<a href="/womb/en/events" class="lang-option">EN</a>
	<span class="lang-separator">/</span>
	<a href="/womb/fr/events" class="lang-option">FR</a>
</div>
```

At the end of the `<style>` tag, add:

```css
/* Language selector */
.lang-enter {
	position: fixed;
	bottom: 2rem;
	right: 2rem;
	z-index: 100;
	font-size: 1.2rem;
	letter-spacing: 0.2em;
}

.lang-option {
	color: rgba(255, 255, 255, 0.4);
	text-decoration: none;
	transition: color 0.3s;
}

.lang-option:hover {
	color: rgba(255, 255, 255, 0.9);
}

.lang-separator {
	color: rgba(255, 255, 255, 0.2);
	margin: 0 0.5rem;
}

@media (max-width: 768px) {
	.lang-enter {
		bottom: 1rem;
		right: 1rem;
		font-size: 1rem;
	}
}
```

**Step 2: Test landing page**

Run: `npm run dev`
Navigate to: `http://localhost:4340/womb/`
Expected: Language selector appears in bottom-right, clicking navigates to events page

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add language selector to landing page"
```

---

## Phase 8: Protected Audio Player Component

### Task 11: Create Audio Player Component

**Files:**
- Create: `src/components/AudioPlayer.tsx`

**Step 1: Create audio player component**

Create `src/components/AudioPlayer.tsx`:

```tsx
import { useEffect, useRef, useState } from 'preact/hooks';

interface Props {
	audioUrl: string;
	title: string;
}

export default function AudioPlayer({ audioUrl, title }: Props) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	// Prevent right-click on player
	const handleContextMenu = (e: Event) => {
		e.preventDefault();
		return false;
	};

	// Load audio via blob URL for protection
	useEffect(() => {
		setIsLoading(true);
		fetch(audioUrl)
			.then(res => res.blob())
			.then(blob => {
				const url = URL.createObjectURL(blob);
				if (audioRef.current) {
					audioRef.current.src = url;
					setIsLoading(false);
				}
			})
			.catch(err => {
				console.error('Failed to load audio:', err);
				setIsLoading(false);
			});

		return () => {
			if (audioRef.current?.src) {
				URL.revokeObjectURL(audioRef.current.src);
			}
		};
	}, [audioUrl]);

	const togglePlay = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	const handleSeek = (e: Event) => {
		const target = e.currentTarget as HTMLInputElement;
		const time = parseFloat(target.value);
		if (audioRef.current) {
			audioRef.current.currentTime = time;
			setCurrentTime(time);
		}
	};

	const formatTime = (seconds: number): string => {
		if (!isFinite(seconds)) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<div class="audio-player" onContextMenu={handleContextMenu}>
			<audio
				ref={audioRef}
				onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
				onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
				onEnded={() => setIsPlaying(false)}
				controlsList="nodownload"
			/>

			<div class="player-content">
				<button
					class="play-button"
					onClick={togglePlay}
					disabled={isLoading}
					aria-label={isPlaying ? 'Pause' : 'Play'}
				>
					{isLoading ? '⏳' : isPlaying ? '⏸' : '▶'}
				</button>

				<div class="player-info">
					<span class="title">{title}</span>
					<div class="progress-container">
						<span class="time">{formatTime(currentTime)}</span>
						<input
							type="range"
							class="progress-bar"
							min="0"
							max={duration || 0}
							value={currentTime}
							onInput={handleSeek}
							disabled={isLoading}
						/>
						<span class="time">{formatTime(duration)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
```

**Step 2: Add styles**

Add to the end of `src/components/AudioPlayer.tsx`:

```tsx
// Add this style tag at the end of the component (outside the return)
const styles = `
.audio-player {
	background: rgba(255, 255, 255, 0.03);
	border-radius: 8px;
	padding: 1.5rem;
	margin: 1rem 0;
	user-select: none;
}

.player-content {
	display: flex;
	gap: 1.5rem;
	align-items: center;
}

.play-button {
	width: 48px;
	height: 48px;
	border-radius: 50%;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.05);
	color: #e0e0e0;
	font-size: 1.2rem;
	cursor: pointer;
	transition: all 0.3s;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.play-button:hover:not(:disabled) {
	background: rgba(255, 255, 255, 0.1);
	border-color: rgba(255, 255, 255, 0.3);
}

.play-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.player-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.title {
	font-size: 1rem;
	letter-spacing: 0.05em;
	color: #d0d0d0;
}

.progress-container {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.time {
	font-size: 0.85rem;
	color: rgba(255, 255, 255, 0.5);
	font-variant-numeric: tabular-nums;
	min-width: 3rem;
}

.progress-bar {
	flex: 1;
	height: 4px;
	-webkit-appearance: none;
	appearance: none;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 2px;
	outline: none;
	cursor: pointer;
}

.progress-bar::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background: #e0e0e0;
	cursor: pointer;
	transition: background 0.3s;
}

.progress-bar::-moz-range-thumb {
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background: #e0e0e0;
	cursor: pointer;
	border: none;
	transition: background 0.3s;
}

.progress-bar:hover::-webkit-slider-thumb {
	background: #fff;
}

.progress-bar:hover::-moz-range-thumb {
	background: #fff;
}

.progress-bar:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

@media (max-width: 768px) {
	.player-content {
		gap: 1rem;
	}

	.play-button {
		width: 44px;
		height: 44px;
	}

	.title {
		font-size: 0.9rem;
	}
}
`;

// Inject styles into document
if (typeof document !== 'undefined' && !document.getElementById('audio-player-styles')) {
	const styleTag = document.createElement('style');
	styleTag.id = 'audio-player-styles';
	styleTag.textContent = styles;
	document.head.appendChild(styleTag);
}
```

**Step 3: Test audio player (add to event detail)**

Temporarily add to event detail page for testing - modify `src/pages/[lang]/events/[slug].astro`, import at top:

```astro
---
import AudioPlayer from '../../../components/AudioPlayer';
// ... rest of imports
---
```

Add after lineup section:

```astro
<!-- Test Audio Player -->
<section class="event-section">
	<h2>Test Recording</h2>
	<AudioPlayer
		client:load
		audioUrl="/womb/WOMB/MUSIC/Episode Deux/Womb Ep2 - Dragan Markovic Live - edited.mp3"
		title="Dragan Markovic - Live Set"
	/>
</section>
```

**Step 4: Test component**

Run: `npm run dev`
Navigate to: `http://localhost:4340/womb/en/events/episode-2`
Expected: Audio player displays, can play/pause, seek, shows time

**Step 5: Commit**

```bash
git add src/components/AudioPlayer.tsx src/pages/\[lang\]/events/\[slug\].astro
git commit -m "feat: add protected audio player component with blob URL loading"
```

---

*Continued in next message due to length...*
