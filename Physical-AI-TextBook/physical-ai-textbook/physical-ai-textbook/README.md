# Physical AI Textbook

A comprehensive, AI-native textbook on Physical AI and Humanoid Robotics, featuring ROS2, Gazebo, NVIDIA Isaac Sim, and Vision-Language-Action Models. Includes an integrated podcast for audio learning.

## Features

- **6 Core Chapters**: From fundamentals to advanced humanoid robotics
- **4 Hands-on Labs**: Step-by-step tutorials with code
- **Podcast Episodes**: Audio versions of each chapter
- **Code Examples**: Real, runnable Python and ROS2 code
- **Modern Design**: Built with Docusaurus 3

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/physical-ai-textbook.git
cd physical-ai-textbook

# Install dependencies
npm install

# Start development server
npm start
```

The site will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

The static site will be generated in the `build/` directory.

## Content Structure

```
physical-ai-textbook/
├── docs/                    # Chapter content
│   ├── intro/              # Chapter 1: Introduction to Physical AI
│   ├── ros2/               # Chapter 2: ROS2 Fundamentals
│   ├── simulation/         # Chapter 3: Robot Simulation
│   ├── isaac-sim/          # Chapter 4: NVIDIA Isaac Sim
│   ├── vla-models/         # Chapter 5: Vision-Language-Action Models
│   ├── humanoid/           # Chapter 6: Humanoid Robotics
│   ├── resources/          # References and links
│   └── labs/               # Hands-on tutorials
├── podcast/                 # Podcast content
│   ├── episodes/           # Episode pages
│   ├── scripts/            # Generated scripts
│   └── audio/              # Audio files
├── src/                     # React components
│   └── components/
│       ├── PodcastPlayer/  # Audio player component
│       ├── PodcastCard/    # Episode card component
│       └── ChapterPodcastLink/
└── scripts/                 # Build tools
    ├── generate-script.js  # Script generator
    ├── generate-audio.js   # TTS pipeline
    └── batch-generate.js   # Batch processing
```

## Podcast Generation

### Browser-Based Text-to-Speech (No API Required)

The podcast player includes built-in browser Text-to-Speech (TTS) that works without any API keys:

- **Automatic Fallback**: If no audio file exists, the player automatically uses browser TTS
- **Voice Selection**: Users can choose from available system voices
- **Playback Controls**: Speed control (0.5x - 2x), volume, seek, restart
- **Cross-Browser**: Works in Chrome, Firefox, Safari, Edge

Simply navigate to any podcast episode and click Play - the browser will read the transcript aloud.

### Generate Scripts from Chapters

```bash
# Generate a single script
node scripts/generate-script.js docs/intro/index.md -e 1

# Generate all scripts
node scripts/batch-generate.js
```

### Generate Audio Files (Optional - requires API)

For pre-generated audio files (higher quality, offline playback):

```bash
# Set your OpenAI API key
export OPENAI_API_KEY="your-key-here"

# Generate audio from script
node scripts/generate-audio.js podcast/scripts/intro-script.md
```

See `.env.example` for configuration options.

## Deployment

### GitHub Pages

The repository includes a GitHub Actions workflow for automatic deployment:

1. Go to repository Settings > Pages
2. Set Source to "GitHub Actions"
3. Push to `main` branch to trigger deployment

### Manual Deploy

```bash
# Build and deploy to GitHub Pages
npm run deploy
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

### Content Guidelines

- Each chapter should include learning objectives
- Code examples should be runnable and tested
- Diagrams should have alt text for accessibility
- Podcast scripts should be conversational and audio-friendly

## Topics Covered

1. **Introduction to Physical AI**
   - Embodied intelligence
   - Industry landscape
   - Key challenges

2. **ROS2 Fundamentals**
   - Nodes, topics, services, actions
   - Package structure
   - Launch files

3. **Robot Simulation**
   - URDF robot description
   - Gazebo setup and plugins
   - Sensor simulation

4. **NVIDIA Isaac Sim**
   - Omniverse platform
   - Synthetic data generation
   - Domain randomization

5. **Vision-Language-Action Models**
   - VLA architecture
   - RT-2 and PaLM-E
   - Training and deployment

6. **Humanoid Robotics**
   - Bipedal locomotion
   - Balance control
   - Dexterous manipulation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Docusaurus](https://docusaurus.io/) - Documentation framework
- [ROS2](https://www.ros.org/) - Robot Operating System
- [NVIDIA Isaac](https://developer.nvidia.com/isaac) - Simulation platform
- Open-source robotics community
