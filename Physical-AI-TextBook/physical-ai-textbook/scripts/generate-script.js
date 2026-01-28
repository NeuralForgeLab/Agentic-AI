#!/usr/bin/env node
/**
 * Podcast Script Generator
 *
 * Converts chapter markdown files into podcast-ready scripts.
 *
 * Usage:
 *   node scripts/generate-script.js <chapter-path> [options]
 *
 * Options:
 *   --output, -o    Output directory (default: podcast/scripts)
 *   --episode, -e   Episode number (auto-detected from filename)
 *   --duration, -d  Target duration in minutes (default: 15)
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Script template sections
const SCRIPT_TEMPLATE = {
  intro: `**[INTRO MUSIC]**

Welcome to the Physical AI Podcast! I'm your host, and today we're diving into {{TOPIC}}.

`,
  section: `**[SECTION {{NUM}}: {{TITLE}}]**

{{CONTENT}}

`,
  outro: `**[OUTRO]**

That's all for today's episode on {{TOPIC}}. If you enjoyed this, check out the corresponding chapter in the textbook for code examples and deeper technical details.

{{NEXT_EPISODE}}

Until then, keep building, keep learning, and remember - the future of AI isn't just in the cloud, it's all around us.

**[OUTRO MUSIC]**
`
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    output: 'podcast/scripts',
    episode: null,
    duration: 15,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--episode' || arg === '-e') {
      options.episode = parseInt(args[++i], 10);
    } else if (arg === '--duration' || arg === '-d') {
      options.duration = parseInt(args[++i], 10);
    } else if (!arg.startsWith('-')) {
      options.input = arg;
    }
  }

  return options;
}

/**
 * Extract key concepts from markdown content
 */
function extractConcepts(content) {
  const concepts = [];

  // Extract headings
  const headingRegex = /^#{2,3}\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    concepts.push({
      type: 'heading',
      text: match[1].trim(),
    });
  }

  // Extract bold terms (key definitions)
  const boldRegex = /\*\*([^*]+)\*\*/g;
  while ((match = boldRegex.exec(content)) !== null) {
    if (match[1].length < 50) { // Skip long bold passages
      concepts.push({
        type: 'term',
        text: match[1].trim(),
      });
    }
  }

  // Extract code examples (summarize, don't include)
  const codeBlockCount = (content.match(/```/g) || []).length / 2;
  if (codeBlockCount > 0) {
    concepts.push({
      type: 'code',
      count: codeBlockCount,
    });
  }

  return concepts;
}

/**
 * Extract sections from markdown
 */
function extractSections(content) {
  const sections = [];
  const lines = content.split('\n');
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      if (currentSection) {
        sections.push({
          title: currentSection,
          content: currentContent.join('\n').trim(),
        });
      }
      currentSection = h2Match[1].trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Add last section
  if (currentSection) {
    sections.push({
      title: currentSection,
      content: currentContent.join('\n').trim(),
    });
  }

  return sections;
}

/**
 * Convert technical content to conversational script
 */
function convertToConversational(section) {
  let content = section.content;

  // Remove markdown formatting
  content = content.replace(/```[\s\S]*?```/g, '[Code example discussed in chapter]');
  content = content.replace(/\|[\s\S]*?\|/g, ''); // Remove tables
  content = content.replace(/!\[.*?\]\(.*?\)/g, ''); // Remove images
  content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Convert links to text
  content = content.replace(/#{1,6}\s+/g, ''); // Remove heading markers
  content = content.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold
  content = content.replace(/\*([^*]+)\*/g, '$1'); // Remove italic
  content = content.replace(/`([^`]+)`/g, '$1'); // Remove inline code
  content = content.replace(/<[^>]+>/g, ''); // Remove HTML

  // Clean up whitespace
  content = content.replace(/\n{3,}/g, '\n\n');
  content = content.trim();

  // Split into paragraphs and limit length
  const paragraphs = content.split('\n\n').filter(p => p.length > 20);

  // Take first few paragraphs (aim for ~200 words per section)
  const maxWords = 250;
  let wordCount = 0;
  const selectedParagraphs = [];

  for (const para of paragraphs) {
    const words = para.split(/\s+/).length;
    if (wordCount + words <= maxWords) {
      selectedParagraphs.push(para);
      wordCount += words;
    } else if (selectedParagraphs.length === 0) {
      // At least include first paragraph
      selectedParagraphs.push(para);
      break;
    } else {
      break;
    }
  }

  return selectedParagraphs.join('\n\n');
}

/**
 * Generate podcast script from chapter content
 */
function generateScript(chapterPath, options) {
  // Read chapter file
  const chapterContent = fs.readFileSync(chapterPath, 'utf-8');
  const { data: frontmatter, content } = matter(chapterContent);

  // Extract info
  const title = frontmatter.title || 'Untitled Chapter';
  const description = frontmatter.description || '';

  // Detect episode number from path or option
  let episodeNum = options.episode;
  if (!episodeNum) {
    const match = chapterPath.match(/(\d+)/);
    episodeNum = match ? parseInt(match[1], 10) : 1;
  }

  // Extract and process sections
  const sections = extractSections(content);
  const concepts = extractConcepts(content);

  // Build script
  let script = '';

  // Frontmatter
  script += `---
title: "Episode ${episodeNum}: ${title}"
description: ${description}
duration: "${options.duration} min"
source_chapter: ${path.basename(chapterPath)}
generated: ${new Date().toISOString()}
---

# Episode ${episodeNum}: ${title}

`;

  // Intro
  script += SCRIPT_TEMPLATE.intro.replace('{{TOPIC}}', title.toLowerCase());

  // Main sections (skip Learning Objectives, Summary, etc.)
  const skipSections = ['Learning Objectives', 'Summary', 'Next Steps', 'Related Content'];
  let sectionNum = 1;

  for (const section of sections) {
    if (skipSections.some(skip => section.title.includes(skip))) {
      continue;
    }

    const conversational = convertToConversational(section);
    if (conversational.length > 50) {
      script += SCRIPT_TEMPLATE.section
        .replace('{{NUM}}', sectionNum)
        .replace('{{TITLE}}', section.title)
        .replace('{{CONTENT}}', conversational);

      sectionNum++;
    }

    // Limit to 6 sections for time
    if (sectionNum > 6) break;
  }

  // Outro
  const nextEpisode = episodeNum < 6
    ? `Next time, we'll explore even more exciting topics in Physical AI.`
    : `This concludes our series on Physical AI. Thank you for joining this journey!`;

  script += SCRIPT_TEMPLATE.outro
    .replace('{{TOPIC}}', title.toLowerCase())
    .replace('{{NEXT_EPISODE}}', nextEpisode);

  // Add show notes
  script += `
---

## Show Notes

### Key Terms
${concepts.filter(c => c.type === 'term').slice(0, 10).map(c => `- ${c.text}`).join('\n')}

### Topics Covered
${concepts.filter(c => c.type === 'heading').slice(0, 8).map(c => `- ${c.text}`).join('\n')}

### Resources
- [Read the Chapter](/docs/${path.basename(path.dirname(chapterPath))})
- [Physical AI Textbook](/)
`;

  return script;
}

/**
 * Main execution
 */
function main() {
  const options = parseArgs();

  if (!options.input) {
    console.error('Usage: node generate-script.js <chapter-path> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --output, -o    Output directory (default: podcast/scripts)');
    console.error('  --episode, -e   Episode number');
    console.error('  --duration, -d  Target duration in minutes (default: 15)');
    process.exit(1);
  }

  if (!fs.existsSync(options.input)) {
    console.error(`Error: File not found: ${options.input}`);
    process.exit(1);
  }

  console.log(`Generating podcast script from: ${options.input}`);

  // Generate script
  const script = generateScript(options.input, options);

  // Create output directory if needed
  if (!fs.existsSync(options.output)) {
    fs.mkdirSync(options.output, { recursive: true });
  }

  // Write output
  const basename = path.basename(options.input, path.extname(options.input));
  const outputPath = path.join(options.output, `${basename}-script.md`);
  fs.writeFileSync(outputPath, script);

  console.log(`Script generated: ${outputPath}`);
  console.log(`Estimated duration: ${options.duration} minutes`);
}

main();
