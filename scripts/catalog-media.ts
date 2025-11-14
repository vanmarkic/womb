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