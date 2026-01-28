#!/usr/bin/env node
/**
 * Batch Script Generator
 *
 * Generates podcast scripts for all chapters at once.
 *
 * Usage:
 *   node scripts/batch-generate.js [options]
 *
 * Options:
 *   --chapters, -c   Chapter directory (default: docs)
 *   --output, -o     Output directory (default: podcast/scripts)
 *   --audio, -a      Also generate audio (requires TTS setup)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Chapter mapping (order and episode numbers)
const CHAPTER_MAP = [
  { path: 'docs/intro/index.md', episode: 1, duration: 15, name: 'ep01-physical-ai' },
  { path: 'docs/ros2/index.md', episode: 2, duration: 18, name: 'ep02-ros2' },
  { path: 'docs/simulation/index.md', episode: 3, duration: 16, name: 'ep03-simulation' },
  { path: 'docs/isaac-sim/index.md', episode: 4, duration: 17, name: 'ep04-isaac-sim' },
  { path: 'docs/vla-models/index.md', episode: 5, duration: 19, name: 'ep05-vla-models' },
  { path: 'docs/humanoid/index.md', episode: 6, duration: 20, name: 'ep06-humanoid' },
];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    chapters: 'docs',
    output: 'podcast/scripts',
    generateAudio: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--chapters' || arg === '-c') {
      options.chapters = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--audio' || arg === '-a') {
      options.generateAudio = true;
    }
  }

  return options;
}

/**
 * Main execution
 */
function main() {
  const options = parseArgs();
  const scriptPath = path.join(__dirname, 'generate-script.js');
  const audioScriptPath = path.join(__dirname, 'generate-audio.js');

  console.log('='.repeat(60));
  console.log('Physical AI Podcast - Batch Script Generator');
  console.log('='.repeat(60));
  console.log('');

  // Create output directory
  if (!fs.existsSync(options.output)) {
    fs.mkdirSync(options.output, { recursive: true });
  }

  const results = [];

  for (const chapter of CHAPTER_MAP) {
    const chapterPath = path.resolve(chapter.path);

    if (!fs.existsSync(chapterPath)) {
      console.log(`[SKIP] ${chapter.path} - File not found`);
      results.push({ ...chapter, status: 'skipped', reason: 'not found' });
      continue;
    }

    console.log(`[${chapter.episode}/${CHAPTER_MAP.length}] Processing: ${chapter.path}`);

    try {
      // Generate script to temp location first
      const cmd = `node "${scriptPath}" "${chapterPath}" -o "${options.output}" -e ${chapter.episode} -d ${chapter.duration}`;
      execSync(cmd, { stdio: 'pipe' });

      // Rename the output file to match episode naming
      const generatedFile = path.join(options.output, 'index-script.md');
      const targetFile = path.join(options.output, `${chapter.name}-script.md`);
      if (fs.existsSync(generatedFile)) {
        fs.renameSync(generatedFile, targetFile);
      }

      console.log(`    Script generated: ${chapter.name}-script.md`);
      results.push({ ...chapter, status: 'success' });

      // Generate audio if requested
      if (options.generateAudio) {
        const scriptFile = path.join(options.output, `index-script.md`);
        if (fs.existsSync(scriptFile)) {
          console.log(`    Generating audio...`);
          try {
            const audioCmd = `node "${audioScriptPath}" "${scriptFile}" -o static/audio`;
            execSync(audioCmd, { stdio: 'pipe' });
            console.log(`    Audio generated successfully`);
          } catch (audioError) {
            console.log(`    Audio generation failed: ${audioError.message}`);
          }
        }
      }

    } catch (error) {
      console.log(`    [ERROR] ${error.message}`);
      results.push({ ...chapter, status: 'error', reason: error.message });
    }

    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.status === 'success').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log(`Total chapters: ${CHAPTER_MAP.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log('');
  console.log(`Scripts saved to: ${path.resolve(options.output)}`);

  if (errors > 0) {
    console.log('');
    console.log('Errors:');
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`  - ${r.path}: ${r.reason}`);
    });
  }
}

main();
