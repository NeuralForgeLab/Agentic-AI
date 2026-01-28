#!/usr/bin/env node
/**
 * TTS Audio Generator
 *
 * Converts podcast scripts to audio using Text-to-Speech.
 * Supports OpenAI TTS and Coqui TTS (local).
 *
 * Usage:
 *   node scripts/generate-audio.js <script-path> [options]
 *
 * Options:
 *   --output, -o     Output directory (default: static/audio)
 *   --provider, -p   TTS provider: openai, coqui (default: openai)
 *   --voice, -v      Voice name (provider-specific)
 *   --format, -f     Output format: mp3, wav (default: mp3)
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Provider configurations
const PROVIDERS = {
  openai: {
    voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
    defaultVoice: 'nova',
    models: ['tts-1', 'tts-1-hd'],
    defaultModel: 'tts-1',
  },
  coqui: {
    voices: ['default'],
    defaultVoice: 'default',
  },
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    output: 'static/audio',
    provider: 'openai',
    voice: null,
    format: 'mp3',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--provider' || arg === '-p') {
      options.provider = args[++i];
    } else if (arg === '--voice' || arg === '-v') {
      options.voice = args[++i];
    } else if (arg === '--format' || arg === '-f') {
      options.format = args[++i];
    } else if (!arg.startsWith('-')) {
      options.input = arg;
    }
  }

  // Set default voice based on provider
  if (!options.voice && PROVIDERS[options.provider]) {
    options.voice = PROVIDERS[options.provider].defaultVoice;
  }

  return options;
}

/**
 * Extract readable text from script markdown
 */
function extractReadableText(scriptPath) {
  const content = fs.readFileSync(scriptPath, 'utf-8');
  const { content: body } = matter(content);

  // Remove markdown formatting for TTS
  let text = body;

  // Remove frontmatter title/header
  text = text.replace(/^#.*$/gm, '');

  // Convert section markers to pauses
  text = text.replace(/\*\*\[INTRO MUSIC\]\*\*/g, '... ');
  text = text.replace(/\*\*\[OUTRO MUSIC\]\*\*/g, '... ');
  text = text.replace(/\*\*\[SECTION \d+:([^\]]+)\]\*\*/g, '... Section: $1 ... ');
  text = text.replace(/\*\*\[OUTRO\]\*\*/g, '... ');

  // Remove remaining markdown
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/#{1,6}\s+/g, '');
  text = text.replace(/^[-*]\s+/gm, '');
  text = text.replace(/^>\s+/gm, '');
  text = text.replace(/---/g, '');

  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  // Split into chunks (TTS APIs have limits)
  const maxChunkLength = 4000;
  const chunks = [];
  let currentChunk = '';

  for (const paragraph of text.split('\n\n')) {
    if (currentChunk.length + paragraph.length > maxChunkLength) {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  return chunks;
}

/**
 * Generate audio using OpenAI TTS
 */
async function generateWithOpenAI(chunks, options) {
  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY environment variable not set');
    console.error('');
    console.error('To use OpenAI TTS:');
    console.error('  1. Get an API key from https://platform.openai.com/api-keys');
    console.error('  2. Set it: export OPENAI_API_KEY="your-key-here"');
    console.error('');
    console.error('Or use --provider coqui for local TTS');
    process.exit(1);
  }

  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey });

  const audioBuffers = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1}/${chunks.length}...`);

    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: options.voice,
      input: chunks[i],
      response_format: options.format,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    audioBuffers.push(buffer);
  }

  // Concatenate buffers (simple concatenation for MP3)
  return Buffer.concat(audioBuffers);
}

/**
 * Generate audio using Coqui TTS (local)
 */
async function generateWithCoqui(chunks, options) {
  console.log('Coqui TTS requires Python and coqui-tts package.');
  console.log('');
  console.log('Installation:');
  console.log('  pip install TTS');
  console.log('');
  console.log('This is a placeholder. Implement Coqui integration as needed.');

  // Create placeholder file
  const text = chunks.join('\n\n');
  return Buffer.from(`Placeholder audio for: ${text.substring(0, 100)}...`);
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  if (!options.input) {
    console.error('Usage: node generate-audio.js <script-path> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --output, -o     Output directory (default: static/audio)');
    console.error('  --provider, -p   TTS provider: openai, coqui (default: openai)');
    console.error('  --voice, -v      Voice name');
    console.error('  --format, -f     Output format: mp3, wav (default: mp3)');
    console.error('');
    console.error('OpenAI Voices: alloy, echo, fable, onyx, nova, shimmer');
    process.exit(1);
  }

  if (!fs.existsSync(options.input)) {
    console.error(`Error: File not found: ${options.input}`);
    process.exit(1);
  }

  if (!PROVIDERS[options.provider]) {
    console.error(`Error: Unknown provider: ${options.provider}`);
    console.error(`Available providers: ${Object.keys(PROVIDERS).join(', ')}`);
    process.exit(1);
  }

  console.log(`Generating audio from: ${options.input}`);
  console.log(`Provider: ${options.provider}`);
  console.log(`Voice: ${options.voice}`);
  console.log(`Format: ${options.format}`);
  console.log('');

  // Extract text
  const chunks = extractReadableText(options.input);
  console.log(`Extracted ${chunks.length} text chunks`);

  // Generate audio
  let audioBuffer;
  try {
    if (options.provider === 'openai') {
      audioBuffer = await generateWithOpenAI(chunks, options);
    } else if (options.provider === 'coqui') {
      audioBuffer = await generateWithCoqui(chunks, options);
    }
  } catch (error) {
    console.error(`Error generating audio: ${error.message}`);
    process.exit(1);
  }

  // Create output directory if needed
  if (!fs.existsSync(options.output)) {
    fs.mkdirSync(options.output, { recursive: true });
  }

  // Write output
  const basename = path.basename(options.input, path.extname(options.input));
  const outputPath = path.join(options.output, `${basename}.${options.format}`);
  fs.writeFileSync(outputPath, audioBuffer);

  console.log('');
  console.log(`Audio generated: ${outputPath}`);
  console.log(`Size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
