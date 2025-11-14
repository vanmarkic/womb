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