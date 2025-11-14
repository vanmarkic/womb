#!/usr/bin/env node

/**
 * Script to generate multiple quality versions of audio files
 * Requires ffmpeg to be installed on the system
 *
 * Usage: npm run generate-audio-qualities
 *
 * This will create three versions of each audio file:
 * - High: Original WAV quality
 * - Medium: 320kbps MP3 (excellent quality)
 * - Low: 128kbps MP3 (good quality, lower bandwidth)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

const AUDIO_SOURCE_DIR = 'public/WOMB/MUSIC';
const AUDIO_OUTPUT_DIR = 'public/recordings';

// Ensure output directories exist
const ensureDirectoryExists = (dir: string) => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
};

// Get all audio files recursively
const getAudioFiles = (dir: string, fileList: string[] = []): string[] => {
	const files = fs.readdirSync(dir);

	files.forEach(file => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			getAudioFiles(filePath, fileList);
		} else if (file.match(/\.(wav|mp3|flac|m4a|aac)$/i)) {
			fileList.push(filePath);
		}
	});

	return fileList;
};

// Generate different quality versions
const generateQualities = async (inputFile: string) => {
	const fileName = path.basename(inputFile, path.extname(inputFile));
	const fileExt = path.extname(inputFile).toLowerCase();
	const relativePath = path.relative(AUDIO_SOURCE_DIR, path.dirname(inputFile));

	const outputDir = path.join(AUDIO_OUTPUT_DIR, relativePath);
	ensureDirectoryExists(outputDir);

	// For WAV files, we'll keep the original as high quality
	// and create compressed versions for medium and low
	const isWav = fileExt === '.wav';

	const outputHighPath = isWav ? inputFile : path.join(outputDir, `${fileName}.wav`);
	const outputMediumPath = path.join(outputDir, `${fileName}.320k.mp3`);
	const outputLowPath = path.join(outputDir, `${fileName}.128k.mp3`);

	console.log(`Processing: ${fileName}${fileExt}`);

	try {
		// High quality: Keep original WAV
		if (!isWav) {
			console.log('  → Converting to WAV for high quality...');
			await execAsync(
				`ffmpeg -i "${inputFile}" -acodec pcm_s16le -ar 48000 "${outputHighPath}" -y`
			);
		} else {
			console.log('  → Keeping original WAV as high quality...');
		}

		// Generate medium quality (320kbps) - excellent quality for streaming
		console.log('  → Generating medium quality (320kbps MP3)...');
		await execAsync(
			`ffmpeg -i "${inputFile}" -b:a 320k -ar 48000 "${outputMediumPath}" -y`
		);

		// Generate low quality (128kbps) - still good quality, lower bandwidth
		console.log('  → Generating low quality (128kbps MP3)...');
		await execAsync(
			`ffmpeg -i "${inputFile}" -b:a 128k -ar 44100 "${outputLowPath}" -y`
		);

		console.log(`  ✓ Successfully processed ${fileName}\n`);

		return {
			original: inputFile,
			high: outputHighPath,
			medium: outputMediumPath,
			low: outputLowPath,
			fileSize: {
				original: fs.statSync(inputFile).size,
				medium: fs.existsSync(outputMediumPath) ? fs.statSync(outputMediumPath).size : 0,
				low: fs.existsSync(outputLowPath) ? fs.statSync(outputLowPath).size : 0
			}
		};
	} catch (error) {
		console.error(`  ✗ Error processing ${fileName}:`, error);
		return null;
	}
};

// Update content files with quality URLs
const updateContentFile = (contentFile: string, qualityUrls: any) => {
	if (!fs.existsSync(contentFile)) return;

	let content = fs.readFileSync(contentFile, 'utf8');

	// Parse frontmatter
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) return;

	const frontmatter = frontmatterMatch[1];
	const body = content.slice(frontmatterMatch[0].length);

	// Add quality URLs to frontmatter
	const qualitySection = `
qualityLevels:
  high: "${qualityUrls.high}"
  medium: "${qualityUrls.medium}"
  low: "${qualityUrls.low}"`;

	// Insert before the closing ---
	const updatedFrontmatter = frontmatter + qualitySection;
	const updatedContent = `---\n${updatedFrontmatter}\n---${body}`;

	fs.writeFileSync(contentFile, updatedContent);
	console.log(`  → Updated content file: ${contentFile}`);
};

// Main function
const main = async () => {
	console.log('🎵 Audio Quality Generator\n');
	console.log('=====================================\n');

	// Check if ffmpeg is installed
	try {
		await execAsync('ffmpeg -version');
	} catch (error) {
		console.error('Error: ffmpeg is not installed or not in PATH');
		console.error('Please install ffmpeg: https://ffmpeg.org/download.html');
		process.exit(1);
	}

	// Get all audio files
	console.log(`Scanning ${AUDIO_SOURCE_DIR} for audio files...\n`);
	const audioFiles = getAudioFiles(AUDIO_SOURCE_DIR);

	if (audioFiles.length === 0) {
		console.log('No audio files found.');
		return;
	}

	console.log(`Found ${audioFiles.length} audio files.\n`);

	// Process each file
	const results = [];
	for (const file of audioFiles) {
		const result = await generateQualities(file);
		if (result) {
			results.push(result);
		}
	}

	// Calculate total size savings
	let totalOriginalSize = 0;
	let totalMediumSize = 0;
	let totalLowSize = 0;

	results.filter(r => r !== null).forEach(result => {
		if (result) {
			totalOriginalSize += result.fileSize.original;
			totalMediumSize += result.fileSize.medium;
			totalLowSize += result.fileSize.low;
		}
	});

	const formatSize = (bytes: number) => {
		const mb = bytes / (1024 * 1024);
		return mb > 1000 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(2)} MB`;
	};

	// Generate a JSON manifest of all quality versions
	const manifest = {
		generated: new Date().toISOString(),
		files: results.filter(r => r !== null),
		summary: {
			totalFiles: results.filter(r => r !== null).length,
			sizes: {
				original: formatSize(totalOriginalSize),
				medium: formatSize(totalMediumSize),
				low: formatSize(totalLowSize)
			},
			savings: {
				mediumVsOriginal: `${((1 - totalMediumSize / totalOriginalSize) * 100).toFixed(1)}%`,
				lowVsOriginal: `${((1 - totalLowSize / totalOriginalSize) * 100).toFixed(1)}%`
			}
		}
	};

	const manifestPath = path.join(AUDIO_OUTPUT_DIR, 'quality-manifest.json');
	fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

	console.log('\n=====================================');
	console.log(`✅ Processing complete!`);
	console.log(`   Processed ${results.filter(r => r !== null).length} files`);
	console.log(`\n📊 Size Summary:`);
	console.log(`   Original (WAV): ${formatSize(totalOriginalSize)}`);
	console.log(`   Medium (320k): ${formatSize(totalMediumSize)} (${manifest.summary.savings.mediumVsOriginal} smaller)`);
	console.log(`   Low (128k): ${formatSize(totalLowSize)} (${manifest.summary.savings.lowVsOriginal} smaller)`);
	console.log(`\n   Manifest saved to: ${manifestPath}`);
	console.log('\nNote: Update your recording content files to include the qualityLevels URLs.');
};

// Run the script
main().catch(error => {
	console.error('Fatal error:', error);
	process.exit(1);
});