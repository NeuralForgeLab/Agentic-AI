# Implementation Plan: Physical AI Textbook with Podcast Generation

**Branch**: `physical-ai-textbook` | **Date**: 2026-01-07 | **Spec**: specs/physical-ai-textbook/spec.md

## Summary

Build a comprehensive Docusaurus-based textbook on Physical AI and Humanoid Robotics covering ROS2, Gazebo, NVIDIA Isaac Sim, and Vision-Language-Action models. The system includes an innovative podcast generation feature that converts chapter content to audio episodes with automated script generation and TTS integration.

## Technical Context

**Language/Version**: JavaScript/TypeScript (Node.js 18+), React 18  
**Primary Dependencies**: Docusaurus 3.x, React, MDX, TTS libraries  
**Storage**: Static files (Markdown, JSON, MP3/WAV audio)  
**Testing**: Jest for components, manual verification for content  
**Target Platform**: Web (GitHub Pages), Node.js CLI for tooling  
**Project Type**: Web application (static site generator)  
**Performance Goals**: <3s initial load, <1s navigation, audio streaming  
**Constraints**: Static hosting (no server-side processing at runtime)  
**Scale/Scope**: 6+ chapters, 6+ podcast episodes, ~100 pages total

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     DOCUSAURUS SITE                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Chapters   │  │   Podcast    │  │    Labs/Examples     │   │
│  │   (MDX)      │  │   Section    │  │      (MDX)           │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘   │
│         │                 │                                      │
│         │    ┌────────────┴────────────┐                        │
│         │    │    PodcastPlayer        │                        │
│         │    │    Component            │                        │
│         │    └─────────────────────────┘                        │
└─────────┴───────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BUILD & GENERATION TOOLS                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  Script Generator │  │   TTS Pipeline   │  │ GitHub Actions│  │
│  │  (Node.js CLI)    │  │   (Node.js CLI)  │  │   (Deploy)    │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Content Architecture

### Chapter Structure

Each chapter follows a consistent template:
1. **Header**: Title, learning objectives, estimated reading time
2. **Content Sections**: Conceptual explanations with diagrams
3. **Code Examples**: Syntax-highlighted, runnable code blocks
4. **Hands-on Exercises**: Interactive elements where applicable
5. **Podcast Link**: Button/link to corresponding episode
6. **Navigation**: Previous/Next chapter links

### Podcast Structure

Each episode contains:
1. **Intro** (30-60 seconds): Music cue, episode title, topic overview
2. **Main Content** (8-15 minutes): Key concepts explained conversationally
3. **Examples** (3-5 minutes): Real-world applications and use cases
4. **Outro** (30-60 seconds): Summary, next episode teaser, call-to-action

## Module Breakdown

### Module 1: Introduction to Physical AI
- What is Physical AI?
- Embodied intelligence vs traditional AI
- Applications in robotics, autonomous vehicles, drones
- Industry landscape (NVIDIA, Boston Dynamics, Figure AI)

### Module 2: ROS2 Fundamentals
- ROS2 architecture and concepts
- Nodes, topics, services, actions
- Building ROS2 packages
- Communication patterns

### Module 3: Robot Simulation (URDF + Gazebo)
- URDF robot description format
- Gazebo simulator setup
- Sensor simulation
- Physics and collision

### Module 4: NVIDIA Isaac Sim
- Isaac Sim overview
- Omniverse integration
- Synthetic data generation
- Digital twin workflows

### Module 5: Vision-Language-Action (VLA) Models
- VLA model architecture
- RT-2, PaLM-E, and similar models
- Training and fine-tuning
- Deployment on robots

### Module 6: Humanoid Robotics Architectures
- Humanoid robot design principles
- Control systems
- Balance and locomotion
- Manipulation and grasping

### Module 7: Hands-on Labs
- Lab 1: ROS2 Hello World
- Lab 2: URDF Robot Design
- Lab 3: Gazebo Simulation
- Lab 4: Isaac Sim Basics

## Podcast Generation Pipeline

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│  Chapter    │────▶│ Script Generator │────▶│  Podcast    │
│  Markdown   │     │   (generate.js)  │     │   Script    │
└─────────────┘     └─────────────────┘     └──────┬──────┘
                                                    │
                                                    ▼
                    ┌─────────────────┐     ┌─────────────┐
                    │   TTS Engine    │◀────│   TTS CLI   │
                    │ (OpenAI/Coqui)  │     │  (tts.js)   │
                    └────────┬────────┘     └─────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Audio File    │
                    │   (MP3/WAV)     │
                    └─────────────────┘
```

### Script Generation Algorithm

1. Parse chapter markdown
2. Extract: title, headings, key concepts, code explanations
3. Transform to conversational format
4. Add intro template with music cue marker
5. Structure content into digestible segments
6. Add transitions between sections
7. Append outro with next episode teaser
8. Output formatted script markdown

### TTS Integration Options

| Provider | Type | Pros | Cons |
|----------|------|------|------|
| OpenAI TTS | API | High quality, easy setup | Requires API key, cost |
| Coqui TTS | Local | Free, offline, customizable | Requires setup, lower quality |
| ElevenLabs | API | Best quality, voice cloning | Expensive, API key |

**Recommended**: OpenAI TTS for quality, Coqui TTS as free fallback

## UI Components

### PodcastPlayer Component

```jsx
// Features:
// - Play/pause/seek controls
// - Progress bar with time display
// - Playback speed control (0.5x - 2x)
// - Volume control
// - Episode info display
// - Responsive design
```

### Chapter-Podcast Integration

Each chapter page includes:
- Floating "Listen" button (fixed position)
- Episode card in sidebar
- "Prefer audio?" callout box

## Project Structure

```text
physical-ai-textbook/
├── docs/                           # Chapter content
│   ├── intro/
│   │   └── index.md               # Introduction to Physical AI
│   ├── ros2/
│   │   └── index.md               # ROS2 Fundamentals
│   ├── simulation/
│   │   └── index.md               # Robot Simulation
│   ├── isaac-sim/
│   │   └── index.md               # NVIDIA Isaac Sim
│   ├── vla-models/
│   │   └── index.md               # VLA Models
│   ├── humanoid/
│   │   └── index.md               # Humanoid Robotics
│   └── labs/
│       ├── lab01-ros2-hello.md
│       ├── lab02-urdf-design.md
│       ├── lab03-gazebo-sim.md
│       └── lab04-isaac-basics.md
├── podcast/
│   ├── index.md                   # Podcast landing page
│   ├── episodes/
│   │   ├── ep01-physical-ai.md
│   │   ├── ep02-ros2.md
│   │   ├── ep03-simulation.md
│   │   ├── ep04-isaac-sim.md
│   │   ├── ep05-vla-models.md
│   │   └── ep06-humanoid.md
│   ├── scripts/                   # Generated scripts
│   │   └── .gitkeep
│   └── audio/                     # Generated audio
│       └── .gitkeep
├── src/
│   ├── components/
│   │   ├── PodcastPlayer/
│   │   │   ├── index.jsx
│   │   │   └── styles.module.css
│   │   ├── PodcastCard/
│   │   │   ├── index.jsx
│   │   │   └── styles.module.css
│   │   └── ChapterPodcastLink/
│   │       ├── index.jsx
│   │       └── styles.module.css
│   ├── css/
│   │   └── custom.css
│   └── pages/
│       └── index.js               # Homepage
├── scripts/
│   ├── generate-script.js         # Script generator CLI
│   ├── generate-audio.js          # TTS pipeline CLI
│   └── batch-generate.js          # Batch processing
├── static/
│   ├── img/
│   │   ├── logo.svg
│   │   └── diagrams/
│   └── audio/                     # Static audio files
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Pages deployment
├── docusaurus.config.js
├── sidebars.js
├── package.json
├── babel.config.js
└── README.md
```

## Dependencies

### Production Dependencies

```json
{
  "@docusaurus/core": "^3.0.0",
  "@docusaurus/preset-classic": "^3.0.0",
  "@mdx-js/react": "^3.0.0",
  "clsx": "^2.0.0",
  "prism-react-renderer": "^2.1.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

### Development Dependencies

```json
{
  "@docusaurus/module-type-aliases": "^3.0.0",
  "openai": "^4.0.0",
  "commander": "^11.0.0",
  "gray-matter": "^4.0.3",
  "marked": "^9.0.0"
}
```

## Deployment Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   GitHub    │────▶│  GitHub Actions  │────▶│  GitHub     │
│   Push      │     │  Build & Deploy  │     │   Pages     │
└─────────────┘     └─────────────────┘     └─────────────┘
                            │
                    ┌───────┴───────┐
                    │  npm run build │
                    │  docusaurus    │
                    │  deploy        │
                    └───────────────┘
```

## Constitution Check

- [x] Single responsibility: Each component has one purpose
- [x] Minimal dependencies: Using established, well-maintained packages
- [x] Static hosting compatible: No runtime server requirements
- [x] Accessible: Semantic HTML, ARIA labels on audio controls
- [x] Progressive enhancement: Site works without JavaScript for content

## Key Technical Decisions

### Decision 1: Docusaurus over alternatives

**Options Considered**: Docusaurus, Next.js, Astro, VitePress  
**Selected**: Docusaurus 3.x  
**Rationale**: Purpose-built for documentation, excellent MDX support, built-in versioning, strong ecosystem

### Decision 2: Script generation approach

**Options Considered**: AI-powered (GPT), Template-based, Manual  
**Selected**: Template-based with optional AI enhancement  
**Rationale**: Deterministic output, no API costs for basic generation, AI can enhance if available

### Decision 3: Audio storage strategy

**Options Considered**: Git repository, External CDN, Git LFS  
**Selected**: Static files in repository with Git LFS for large files  
**Rationale**: Simplicity for initial deployment, can migrate to CDN later

### Decision 4: TTS provider abstraction

**Selected**: Provider-agnostic interface with plugin architecture  
**Rationale**: Allows switching between OpenAI, Coqui, ElevenLabs without code changes

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Audio files bloat repository | Medium | Git LFS, consider external hosting for v2 |
| TTS quality inconsistent | Medium | Manual review before publishing |
| Chapter updates break podcast sync | Low | Regeneration script, versioned episodes |
| Rate limits on TTS APIs | Medium | Batch processing, caching, local fallback |

## Next Steps

1. Initialize Docusaurus project
2. Create chapter templates and first 2 chapters
3. Build PodcastPlayer component
4. Implement script generator
5. Add TTS integration
6. Configure GitHub Actions deployment
7. Create remaining chapters and episodes
