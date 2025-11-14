import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const publicDir = join(process.cwd(), 'public');
const contentDir = join(process.cwd(), 'src/content');

interface ImageRef {
  file: string;
  path: string;
  line: number;
}

const imageRefs: ImageRef[] = [];
const errors: string[] = [];
const warnings: string[] = [];

// Recursively find all markdown files
function findMdFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findMdFiles(fullPath, baseDir));
    } else if (entry.endsWith('.md')) {
      files.push(fullPath.replace(baseDir + '/', ''));
    }
  }
  
  return files;
}

// Find all markdown files in content directory
const mdFiles = findMdFiles(contentDir);

// Extract image references from each file
for (const file of mdFiles) {
  const filePath = join(contentDir, file);
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Match various image patterns
    const patterns = [
      /coverImage:\s*["']?([^"'\n]+\.(?:jpg|jpeg|png|webp|gif))["']?/i,
      /photo:\s*["']?([^"'\n]+\.(?:jpg|jpeg|png|webp|gif))["']?/i,
      /file:\s*["']?([^"'\n]+\.(?:jpg|jpeg|png|webp|gif))["']?/i,
      /src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))["']/i,
      /\s-\s+["']?([^"'\n]+\.(?:jpg|jpeg|png|webp|gif))["']?/i,
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        imageRefs.push({
          file: file,
          path: match[1],
          line: index + 1
        });
      }
    }
  });
}

// Check if each referenced image exists
console.log('Checking image references...\n');

for (const ref of imageRefs) {
  // Check for gitignored paths (will work locally but break in production)
  if (ref.path.includes('/WOMB/') || ref.path.includes('/womb/WOMB/')) {
    warnings.push(`⚠️  GITIGNORED: ${ref.path}\n   Referenced in: ${ref.file}:${ref.line}\n   This file exists locally but is gitignored and won't be deployed!`);
    console.log(`⚠️  ${ref.path} (GITIGNORED - will break in production!)`);
    continue;
  }
  
  // Remove /womb/ prefix and any leading slashes
  let imagePath = ref.path.replace(/^\/womb\//, '').replace(/^\//, '');
  const fullPath = join(publicDir, imagePath);
  
  if (!existsSync(fullPath)) {
    errors.push(`❌ MISSING: ${ref.path}\n   Referenced in: ${ref.file}:${ref.line}`);
  } else {
    console.log(`✓ ${ref.path}`);
  }
}

console.log(`\n\nSummary: ${imageRefs.length} images referenced, ${errors.length} missing, ${warnings.length} gitignored\n`);

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS (will work locally but break in production):\n');
  warnings.forEach(warning => console.log(warning + '\n'));
}

if (errors.length > 0) {
  console.log('\n❌ BROKEN LINKS:\n');
  errors.forEach(error => console.log(error + '\n'));
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('⚠️  Fix gitignored references before deploying!');
  process.exit(1);
} else {
  console.log('✅ All image links are valid and deployable!');
}

