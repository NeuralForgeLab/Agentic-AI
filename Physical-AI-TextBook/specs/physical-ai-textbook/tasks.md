# Tasks: Physical AI Textbook with Podcast Generation

**Input**: Design documents from `/specs/physical-ai-textbook/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Docusaurus setup

- [ ] T001 [US1] Initialize Docusaurus project in `physical-ai-textbook/` with `npx create-docusaurus@latest`
- [ ] T002 [US1] Configure `package.json` with project metadata and scripts
- [ ] T003 [P] [US1] Create `docusaurus.config.js` with site configuration (title, URL, navbar, footer)
- [ ] T004 [P] [US1] Configure `sidebars.js` with chapter navigation structure
- [ ] T005 [P] [US1] Setup custom CSS in `src/css/custom.css` with theme variables
- [ ] T006 [P] [US1] Add logo and favicon in `static/img/`
- [ ] T007 [US1] Create homepage in `src/pages/index.js` with hero section and feature highlights

**Checkpoint**: Docusaurus site running locally with basic navigation

---

## Phase 2: User Story 1 - Browse Educational Content (Priority: P1)

**Goal**: Complete textbook with all chapters accessible and readable

**Independent Test**: Navigate to any chapter, verify content renders with code examples and navigation

### Chapter Templates

- [ ] T008 [P] [US1] Create chapter template with standard frontmatter and sections in `docs/_template.md`

### Core Chapters

- [ ] T009 [P] [US1] Write Chapter 1: Introduction to Physical AI in `docs/intro/index.md`
  - Learning objectives, What is Physical AI, Embodied intelligence, Industry landscape
  - Code: None (conceptual)
  - Diagrams: Physical AI ecosystem placeholder

- [ ] T010 [P] [US1] Write Chapter 2: ROS2 Fundamentals in `docs/ros2/index.md`
  - ROS2 architecture, Nodes/Topics/Services/Actions, Package structure
  - Code: ROS2 node examples (Python), publisher/subscriber
  - Diagrams: ROS2 graph visualization placeholder

- [ ] T011 [P] [US1] Write Chapter 3: Robot Simulation in `docs/simulation/index.md`
  - URDF format, Gazebo setup, Sensor simulation, Physics
  - Code: URDF robot definition, launch files
  - Diagrams: Simulation pipeline placeholder

- [ ] T012 [P] [US1] Write Chapter 4: NVIDIA Isaac Sim in `docs/isaac-sim/index.md`
  - Isaac Sim overview, Omniverse, Synthetic data, Digital twins
  - Code: Isaac Sim Python snippets
  - Diagrams: Isaac architecture placeholder

- [ ] T013 [P] [US1] Write Chapter 5: VLA Models in `docs/vla-models/index.md`
  - VLA architecture, RT-2/PaLM-E, Training, Deployment
  - Code: Model inference examples
  - Diagrams: VLA architecture placeholder

- [ ] T014 [P] [US1] Write Chapter 6: Humanoid Robotics in `docs/humanoid/index.md`
  - Design principles, Control systems, Balance/locomotion, Manipulation
  - Code: Control loop examples
  - Diagrams: Humanoid architecture placeholder

### Labs Section

- [ ] T015 [P] [US1] Write Lab 1: ROS2 Hello World in `docs/labs/lab01-ros2-hello.md`
- [ ] T016 [P] [US1] Write Lab 2: URDF Robot Design in `docs/labs/lab02-urdf-design.md`
- [ ] T017 [P] [US1] Write Lab 3: Gazebo Simulation in `docs/labs/lab03-gazebo-sim.md`
- [ ] T018 [P] [US1] Write Lab 4: Isaac Sim Basics in `docs/labs/lab04-isaac-basics.md`

### Resources

- [ ] T019 [US1] Create Resources & References page in `docs/resources/index.md`

**Checkpoint**: All chapters accessible, content renders correctly, code blocks highlighted

---

## Phase 3: User Story 2 - Listen to Podcast Episodes (Priority: P2)

**Goal**: Podcast section with episode pages and audio player component

**Independent Test**: Navigate to Podcast section, see episodes, play audio (placeholder initially)

### Podcast Player Component

- [ ] T020 [US2] Create PodcastPlayer component in `src/components/PodcastPlayer/index.jsx`
  - Play/pause controls
  - Progress bar with seek
  - Time display (current/total)
  - Playback speed control (0.5x, 1x, 1.5x, 2x)
  - Volume control
  - Responsive design

- [ ] T021 [US2] Style PodcastPlayer in `src/components/PodcastPlayer/styles.module.css`

### Podcast Card Component

- [ ] T022 [P] [US2] Create PodcastCard component in `src/components/PodcastCard/index.jsx`
  - Episode thumbnail
  - Title and duration
  - Brief description
  - Play button

- [ ] T023 [P] [US2] Style PodcastCard in `src/components/PodcastCard/styles.module.css`

### Chapter-Podcast Link Component

- [ ] T024 [P] [US2] Create ChapterPodcastLink component in `src/components/ChapterPodcastLink/index.jsx`
  - "Listen to this chapter" button
  - Episode duration display
  - Links to podcast episode

- [ ] T025 [P] [US2] Style ChapterPodcastLink in `src/components/ChapterPodcastLink/styles.module.css`

### Podcast Pages

- [ ] T026 [US2] Create Podcast landing page in `podcast/index.md`
  - Podcast description
  - Episode list with cards
  - Subscribe links (placeholder)

- [ ] T027 [P] [US2] Create Episode 1: Physical AI in `podcast/episodes/ep01-physical-ai.md`
  - Episode metadata (title, duration, date)
  - Embedded PodcastPlayer
  - Show notes
  - Transcript/script
  - Link to Chapter 1

- [ ] T028 [P] [US2] Create Episode 2: ROS2 in `podcast/episodes/ep02-ros2.md`
- [ ] T029 [P] [US2] Create Episode 3: Simulation in `podcast/episodes/ep03-simulation.md`
- [ ] T030 [P] [US2] Create Episode 4: Isaac Sim in `podcast/episodes/ep04-isaac-sim.md`
- [ ] T031 [P] [US2] Create Episode 5: VLA Models in `podcast/episodes/ep05-vla-models.md`
- [ ] T032 [P] [US2] Create Episode 6: Humanoid in `podcast/episodes/ep06-humanoid.md`

### Navigation Integration

- [ ] T033 [US2] Add Podcast to navbar in `docusaurus.config.js`
- [ ] T034 [US2] Update sidebars to include podcast section in `sidebars.js`
- [ ] T035 [US2] Add ChapterPodcastLink to each chapter (update T009-T014)

**Checkpoint**: Podcast section navigable, episodes display correctly, player component works

---

## Phase 4: User Story 3 - Generate Podcast Scripts (Priority: P3)

**Goal**: CLI tool to generate podcast scripts from chapter markdown

**Independent Test**: Run `node scripts/generate-script.js docs/intro/index.md` and verify script output

### Script Generator

- [ ] T036 [US3] Create script generator CLI in `scripts/generate-script.js`
  - Parse markdown frontmatter and content
  - Extract headings, key concepts, code explanations
  - Transform to conversational format
  - Apply podcast script template

- [ ] T037 [US3] Create podcast script template in `scripts/templates/script-template.md`
  - Intro section with music cue marker
  - Greeting and episode introduction
  - Main content sections
  - Examples and real-world applications
  - Outro with summary and teaser

- [ ] T038 [US3] Create batch generation script in `scripts/batch-generate.js`
  - Process all chapters in docs/
  - Generate scripts to podcast/scripts/
  - Handle episode numbering

- [ ] T039 [US3] Add npm scripts for generation in `package.json`
  - `npm run generate:script -- <chapter>`
  - `npm run generate:all-scripts`

- [ ] T040 [US3] Create sample generated scripts in `podcast/scripts/`
  - Generate scripts for all 6 chapters
  - Review and refine output

**Checkpoint**: Script generation works, outputs are readable and podcast-ready

---

## Phase 5: User Story 4 - Convert Scripts to Audio (Priority: P4)

**Goal**: TTS pipeline to generate audio from scripts

**Independent Test**: Run `node scripts/generate-audio.js podcast/scripts/ep01.md` and verify audio output

### TTS Pipeline

- [ ] T041 [US4] Create TTS abstraction layer in `scripts/lib/tts-provider.js`
  - Provider interface (init, synthesize, getVoices)
  - Configuration loading from env

- [ ] T042 [P] [US4] Implement OpenAI TTS provider in `scripts/lib/providers/openai-tts.js`
  - Use openai npm package
  - Support voice selection (alloy, echo, fable, onyx, nova, shimmer)
  - Handle streaming and chunking for long scripts

- [ ] T043 [P] [US4] Implement Coqui TTS provider in `scripts/lib/providers/coqui-tts.js`
  - Local TTS fallback
  - Basic voice support
  - Offline capability

- [ ] T044 [US4] Create TTS CLI in `scripts/generate-audio.js`
  - Parse script markdown
  - Split into segments if needed
  - Generate audio per segment
  - Concatenate to final file
  - Add metadata (ID3 tags)

- [ ] T045 [US4] Create batch audio generation in `scripts/batch-audio.js`
  - Process all scripts
  - Progress reporting
  - Error handling and retry

- [ ] T046 [US4] Add npm scripts for audio generation in `package.json`
  - `npm run generate:audio -- <script>`
  - `npm run generate:all-audio`

- [ ] T047 [US4] Create `.env.example` with TTS configuration
  - `TTS_PROVIDER=openai|coqui`
  - `OPENAI_API_KEY=...`

- [ ] T048 [US4] Generate placeholder audio files in `static/audio/`
  - Short intro clips for testing
  - Or full episodes if API available

**Checkpoint**: Audio generation pipeline works, files play correctly in browser

---

## Phase 6: User Story 5 - Deploy and Update Site (Priority: P5)

**Goal**: Automated deployment to GitHub Pages

**Independent Test**: Push to repository, verify GitHub Actions runs, site is accessible

### GitHub Actions

- [ ] T049 [US5] Create GitHub Actions workflow in `.github/workflows/deploy.yml`
  - Trigger on push to main
  - Install dependencies
  - Build Docusaurus site
  - Deploy to GitHub Pages

- [ ] T050 [P] [US5] Configure GitHub Pages settings documentation in `README.md`
  - Repository settings instructions
  - Custom domain setup (optional)

- [ ] T051 [P] [US5] Add build status badge to `README.md`

### Git LFS for Audio

- [ ] T052 [US5] Configure Git LFS for audio files in `.gitattributes`
  - Track `*.mp3`, `*.wav` files
  - Exclude from regular Git

### Documentation

- [ ] T053 [US5] Create comprehensive README.md
  - Project overview
  - Quick start
  - Development setup
  - Content authoring guide
  - Podcast generation guide
  - Deployment instructions

**Checkpoint**: Site deploys automatically on push, accessible at GitHub Pages URL

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and quality assurance

- [ ] T054 [P] Add SEO metadata to all pages (descriptions, og:image)
- [ ] T055 [P] Add analytics placeholder (Google Analytics or Plausible)
- [ ] T056 [P] Accessibility audit and fixes (ARIA labels, keyboard navigation)
- [ ] T057 [P] Performance optimization (image compression, lazy loading)
- [ ] T058 [P] Mobile responsiveness testing and fixes
- [ ] T059 Create 404 page with helpful navigation
- [ ] T060 Final content review and proofreading

**Checkpoint**: Site is production-ready, accessible, performant

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────────┐
        │                                                 │
        ▼                                                 │
Phase 2 (US1: Content) ──────────────────────────────────┤
        │                                                 │
        ├──────────────┐                                  │
        ▼              ▼                                  │
Phase 3 (US2)    Phase 4 (US3)                           │
        │              │                                  │
        └──────┬───────┘                                  │
               ▼                                          │
        Phase 5 (US4: Audio)                              │
               │                                          │
               ▼                                          │
        Phase 6 (US5: Deploy) ◀───────────────────────────┘
               │
               ▼
        Phase 7 (Polish)
```

### Parallel Opportunities

**Within Phase 1**: T003, T004, T005, T006 can run in parallel  
**Within Phase 2**: All chapter tasks (T009-T019) can run in parallel  
**Within Phase 3**: Component tasks can run in parallel, episode pages can run in parallel  
**Within Phase 4**: TTS provider implementations (T042, T043) can run in parallel  
**Within Phase 6**: Documentation tasks (T050, T051) can run in parallel  
**Within Phase 7**: All polish tasks can run in parallel

### MVP Strategy

**Minimum Viable Product** (User Story 1 only):
1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Content)
3. Deploy with Phase 6

**MVP + Podcast** (User Stories 1-2):
1. Complete Phases 1-3
2. Use placeholder audio
3. Deploy with Phase 6

**Full Product** (All User Stories):
1. Complete all phases in order

---

## Notes

- All chapter content should follow consistent formatting
- Code examples should be tested where possible
- Podcast scripts should be reviewed for audio-friendliness
- Audio files should be checked for quality before committing
- Commit after each logical task group
- Test site locally before pushing
