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