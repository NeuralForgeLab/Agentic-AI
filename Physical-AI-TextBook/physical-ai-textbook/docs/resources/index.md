---
sidebar_position: 7
title: Resources & References
description: Curated resources for learning Physical AI and robotics
keywords: [resources, references, learning, courses, papers, tools]
---

# Resources & References

This page provides curated resources for deepening your knowledge of Physical AI, robotics, and related fields.

## Official Documentation

### ROS2

- [ROS2 Documentation](https://docs.ros.org/en/humble/) - Official ROS2 Humble documentation
- [ROS2 Tutorials](https://docs.ros.org/en/humble/Tutorials.html) - Step-by-step tutorials
- [ROS2 Design](https://design.ros2.org/) - ROS2 design documents and REPs

### NVIDIA Isaac

- [Isaac Sim Documentation](https://docs.omniverse.nvidia.com/isaacsim/latest/) - Official Isaac Sim docs
- [Isaac ROS](https://nvidia-isaac-ros.github.io/) - Isaac ROS packages
- [Omniverse Documentation](https://docs.omniverse.nvidia.com/) - Full Omniverse platform docs

### Simulation

- [Gazebo Documentation](https://gazebosim.org/docs) - Gazebo simulator docs
- [MuJoCo Documentation](https://mujoco.readthedocs.io/) - MuJoCo physics engine
- [PyBullet Quickstart](https://pybullet.org/wordpress/) - PyBullet physics simulation

## Online Courses

### Free Courses

| Course | Platform | Topics |
|--------|----------|--------|
| [Modern Robotics](https://www.coursera.org/specializations/modernrobotics) | Coursera | Kinematics, dynamics, control |
| [Underactuated Robotics](https://underactuated.csail.mit.edu/) | MIT OCW | Dynamic systems, optimization |
| [Introduction to Robotics](https://see.stanford.edu/Course/CS223A) | Stanford | Foundations of robotics |
| [Deep RL Bootcamp](https://sites.google.com/view/deep-rl-bootcamp/) | Berkeley | Reinforcement learning |

### Paid Courses

| Course | Platform | Topics |
|--------|----------|--------|
| [Robot Ignite Academy](https://www.theconstructsim.com/) | The Construct | ROS2, simulation |
| [Self-Driving Cars](https://www.udacity.com/course/self-driving-car-engineer-nanodegree--nd0013) | Udacity | Autonomous vehicles |

## Books

### Robotics Fundamentals

- **Introduction to Robotics** by John J. Craig
  - Classic textbook on robot kinematics and dynamics
  
- **Robotics, Vision and Control** by Peter Corke
  - Practical approach with MATLAB/Python code
  
- **Probabilistic Robotics** by Sebastian Thrun et al.
  - Essential for perception and SLAM

### Machine Learning for Robotics

- **Deep Learning** by Goodfellow, Bengio, Courville
  - Foundation for modern AI methods
  
- **Reinforcement Learning: An Introduction** by Sutton & Barto
  - Classic RL textbook (free online)

### Humanoid Robotics

- **Humanoid Robotics: A Reference** edited by Ambarish Goswami
  - Comprehensive reference on humanoid systems
  
- **Legged Robots that Balance** by Marc Raibert
  - Foundational work on dynamic locomotion

## Research Papers

### Foundation Models for Robotics

| Paper | Year | Key Contribution |
|-------|------|------------------|
| [RT-2: Vision-Language-Action Models](https://arxiv.org/abs/2307.15818) | 2023 | VLA for robotics |
| [PaLM-E: An Embodied Multimodal Language Model](https://arxiv.org/abs/2303.03378) | 2023 | Embodied LLMs |
| [Open X-Embodiment](https://arxiv.org/abs/2310.08864) | 2023 | Cross-embodiment learning |

### Simulation and Sim-to-Real

| Paper | Year | Key Contribution |
|-------|------|------------------|
| [Domain Randomization for Sim-to-Real](https://arxiv.org/abs/1703.06907) | 2017 | Robust transfer |
| [Learning Dexterous Manipulation](https://arxiv.org/abs/1808.00177) | 2018 | In-hand manipulation |

### Humanoid Locomotion

| Paper | Year | Key Contribution |
|-------|------|------------------|
| [Learning to Walk in Minutes](https://arxiv.org/abs/2109.11978) | 2021 | Fast locomotion learning |
| [Parkour with Legged Robots](https://arxiv.org/abs/2309.14341) | 2023 | Agile locomotion |

## Tools & Software

### Robot Middleware

- **ROS2** - Robot Operating System
- **Isaac ROS** - NVIDIA's ROS packages
- **micro-ROS** - ROS2 for microcontrollers

### Simulation

- **Isaac Sim** - NVIDIA's robotics simulator
- **Gazebo** - Open-source robotics simulator
- **MuJoCo** - Multi-Joint dynamics with Contact
- **PyBullet** - Python physics simulation

### Machine Learning

- **PyTorch** - Deep learning framework
- **JAX** - High-performance ML framework
- **Stable Baselines3** - RL algorithms
- **IsaacGym** - GPU-accelerated RL

### Computer Vision

- **OpenCV** - Computer vision library
- **Open3D** - 3D data processing
- **YOLO** - Real-time object detection
- **Segment Anything** - Universal segmentation

## Hardware Platforms

### Research Platforms

| Platform | Type | Availability |
|----------|------|--------------|
| Unitree Go1/Go2 | Quadruped | Commercial |
| Franka Emika | Robot arm | Commercial |
| UR5/UR10 | Robot arm | Commercial |
| TurtleBot | Mobile robot | Commercial |

### Single-Board Computers

- **NVIDIA Jetson** - Edge AI computing
- **Raspberry Pi** - General purpose
- **Coral Dev Board** - Edge TPU

### Sensors

- **Intel RealSense** - Depth cameras
- **Velodyne/Ouster** - LiDAR
- **ZED Camera** - Stereo vision

## Communities

### Forums & Discussion

- [ROS Discourse](https://discourse.ros.org/) - ROS community forum
- [NVIDIA Developer Forums](https://forums.developer.nvidia.com/) - Isaac discussions
- [Robotics Stack Exchange](https://robotics.stackexchange.com/) - Q&A

### Open Source Projects

- [Open Robotics](https://www.openrobotics.org/) - ROS development
- [LeRobot](https://github.com/huggingface/lerobot) - Hugging Face robotics
- [ManiSkill](https://github.com/haosulab/ManiSkill) - Manipulation benchmark

### Conferences

- **ICRA** - IEEE International Conference on Robotics and Automation
- **IROS** - IEEE/RSJ International Conference on Intelligent Robots and Systems
- **CoRL** - Conference on Robot Learning
- **RSS** - Robotics: Science and Systems

## Datasets

### Robot Manipulation

| Dataset | Tasks | Size |
|---------|-------|------|
| [Open X-Embodiment](https://robotics-transformer-x.github.io/) | Multi-robot | 1M+ demos |
| [Bridge Data](https://rail-berkeley.github.io/bridgedata/) | Manipulation | 60K demos |
| [RoboNet](https://www.robonet.wiki/) | Multi-robot | 15M frames |

### Navigation

| Dataset | Environment | Size |
|---------|-------------|------|
| [Habitat-Matterport](https://aihabitat.org/datasets/hm3d/) | Indoor | 1000 scenes |
| [KITTI](http://www.cvlibs.net/datasets/kitti/) | Driving | 6 hours |

## Competitions

- **RoboCup** - Robot soccer and rescue
- **DARPA Robotics Challenge** - Humanoid challenges
- **Amazon Picking Challenge** - Warehouse manipulation
- **F1TENTH** - Autonomous racing

## Stay Updated

### Newsletters

- [The Robot Report](https://www.therobotreport.com/) - Industry news
- [IEEE Spectrum Robotics](https://spectrum.ieee.org/robotics) - Technical articles

### Podcasts

- **Robots in Depth** - Research interviews
- **Sense Think Act** - Robotics discussions

### YouTube Channels

- **Boston Dynamics** - Robot demonstrations
- **Two Minute Papers** - AI research summaries
- **Lex Fridman** - Technical interviews

---

*This resource list is continuously updated. For the latest information, check the links directly.*
