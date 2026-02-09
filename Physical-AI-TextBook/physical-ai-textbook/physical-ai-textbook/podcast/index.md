---
sidebar_position: 1
title: Physical AI Podcast
description: Learn Physical AI and robotics through audio episodes
---

# Physical AI Podcast

Welcome to the Physical AI Podcast! Each episode accompanies a chapter from the textbook, providing an audio-friendly way to learn about robotics, ROS2, simulation, and AI.

## About the Podcast

This podcast is designed for:
- **Commuters** who want to learn on the go
- **Audio learners** who prefer listening over reading
- **Busy professionals** looking to stay current with robotics
- **Students** wanting to reinforce textbook concepts

Each episode is 10-20 minutes and covers key concepts in a conversational, accessible format.

## All Episodes

import PodcastCard from '@site/src/components/PodcastCard';

<PodcastCard
  episodeNumber={1}
  title="Introduction to Physical AI"
  description="What is Physical AI? Explore embodied intelligence, the industry landscape, and why robots need to understand the physical world."
  duration="15 min"
  url="/podcast/episodes/ep01-physical-ai"
  chapterUrl="/docs/intro"
/>

<PodcastCard
  episodeNumber={2}
  title="ROS2 Fundamentals"
  description="Master the Robot Operating System 2. Learn about nodes, topics, services, actions, and how to build modular robot software."
  duration="18 min"
  url="/podcast/episodes/ep02-ros2"
  chapterUrl="/docs/ros2"
/>

<PodcastCard
  episodeNumber={3}
  title="Robot Simulation"
  description="Build and simulate robots with URDF and Gazebo. Understand why simulation is critical for safe, fast robotics development."
  duration="16 min"
  url="/podcast/episodes/ep03-simulation"
  chapterUrl="/docs/simulation"
/>

<PodcastCard
  episodeNumber={4}
  title="NVIDIA Isaac Sim"
  description="Explore NVIDIA's powerful simulation platform. Learn about photorealistic rendering, synthetic data generation, and AI training."
  duration="17 min"
  url="/podcast/episodes/ep04-isaac-sim"
  chapterUrl="/docs/isaac-sim"
/>

<PodcastCard
  episodeNumber={5}
  title="Vision-Language-Action Models"
  description="Understand VLA models that unify perception, language, and robot action. Explore RT-2, PaLM-E, and how to deploy them."
  duration="19 min"
  url="/podcast/episodes/ep05-vla-models"
  chapterUrl="/docs/vla-models"
/>

<PodcastCard
  episodeNumber={6}
  title="Humanoid Robotics"
  description="Design principles for humanoid robots. Learn about bipedal locomotion, balance control, and manipulation."
  duration="20 min"
  url="/podcast/episodes/ep06-humanoid"
  chapterUrl="/docs/humanoid"
/>

## Subscribe

Stay updated with new episodes:

- **RSS Feed**: Coming soon
- **Apple Podcasts**: Coming soon
- **Spotify**: Coming soon
- **YouTube**: Coming soon

## How Episodes Are Made

Each podcast episode is generated from the corresponding textbook chapter using our automated pipeline:

1. **Script Generation**: Chapter content is transformed into conversational podcast scripts
2. **Review**: Scripts are reviewed for audio-friendliness
3. **Audio Production**: Text-to-speech generates the audio
4. **Quality Check**: Final audio is reviewed before publishing

Want to contribute? Check out our [GitHub repository](https://github.com/your-username/physical-ai-textbook).
