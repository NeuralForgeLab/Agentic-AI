---
sidebar_position: 2
title: "Episode 2: ROS2 Fundamentals"
description: Master the Robot Operating System 2 - the standard middleware for robotics
---

# Episode 2: ROS2 Fundamentals

import PodcastPlayer from '@site/src/components/PodcastPlayer';

<PodcastPlayer
  title="ROS2 Fundamentals"
  episodeNumber={2}
  duration="18 min"
  showNotes={[
    "What is ROS2 and why it's not actually an operating system",
    "Nodes - the fundamental units of computation",
    "Topics - asynchronous publish-subscribe communication",
    "Services - synchronous request-response patterns",
    "Actions - long-running tasks with feedback",
    "Packages and the ROS2 ecosystem"
  ]}
  transcript={`Welcome back to the Physical AI Podcast! Today we're getting hands-on with ROS2 - the software framework that powers most robots in research and industry. Whether you're building a warehouse robot or a Mars rover, chances are you'll be using ROS2.

Let's clear up a common misconception right away. ROS2 stands for Robot Operating System 2, but it's not actually an operating system. You still need Linux, Windows, or macOS underneath. ROS2 is what we call middleware - it sits between the operating system and your robot application, handling all the complex communication and coordination.

Think of it like this: building a robot from scratch means solving the same problems over and over - how do sensors talk to actuators? How do you coordinate multiple processes? ROS2 solves these problems once, so you can focus on what makes your robot unique.

The fundamental unit in ROS2 is the node. A node is a single process that does one thing well. You might have a camera node that captures images, a detection node that finds objects, and a navigation node that plans paths.

This modular approach has huge benefits. You can test nodes independently, swap them out easily, and reuse them across different robots. A camera driver you write for one project works on any robot with that camera.

Now, how do nodes talk to each other? The most common way is through topics. A topic is like a named message bus. One node publishes messages to a topic, and any number of other nodes can subscribe to receive those messages.

This is perfect for sensor data. Your camera node publishes images to the camera image topic at 30 frames per second. The detection node subscribes and processes each frame. The recording node also subscribes to save everything to disk. They all work independently.

Topics work great for streaming data, but sometimes you need a direct request-response pattern. That's where services come in. With a service, your node sends a request, waits for the response, and continues. Services are synchronous, meaning the caller blocks until it gets a response.

What if you need to tell a robot to navigate to a destination? The journey might take minutes. Enter actions. Actions are designed for long-running tasks. When you send an action goal, the server accepts it and starts working. While it works, it sends periodic feedback. When done, it sends a final result. And crucially, you can cancel an action at any time.

ROS2 organizes code into packages. A package contains your nodes, message definitions, launch files, and configuration. The ROS ecosystem has thousands of community packages for everything from SLAM to arm control to computer vision.

That's ROS2 in a nutshell. We've covered nodes, topics, services, and actions - the four pillars of ROS2 communication. Next episode, we're entering the world of simulation with URDF and Gazebo!`}
/>

## Episode Summary

In this episode, we dive into ROS2 - the Robot Operating System 2. Despite its name, ROS2 isn't actually an operating system. It's a powerful middleware framework that helps you build modular, reusable robot software. We'll explore nodes, topics, services, and actions - the building blocks of any ROS2 application.

## Key Topics Covered

- **What is ROS2?** Understanding middleware and why it matters for robotics
- **Nodes**: The fundamental units of computation in ROS2
- **Topics**: Asynchronous publish-subscribe communication
- **Services**: Synchronous request-response patterns
- **Actions**: Long-running tasks with feedback and cancellation
- **Packages**: Organizing and sharing robot software

## Show Notes

### ROS2 Concepts Explained

| Concept | Description | Use Case |
|---------|-------------|----------|
| **Node** | Single-purpose computation unit | Camera driver, motor controller |
| **Topic** | Named message bus | Sensor data streaming |
| **Service** | Request-response | Get robot state, set parameters |
| **Action** | Long task with feedback | Navigate to goal, pick object |

### Essential Commands

```bash
# List running nodes
ros2 node list

# List topics
ros2 topic list

# Echo messages
ros2 topic echo /camera/image

# Call a service
ros2 service call /add_two_ints ...

# Run a launch file
ros2 launch my_pkg robot.launch.py
```

### Resources
- [Chapter: ROS2 Fundamentals](/docs/ros2)
- [Lab 1: ROS2 Hello World](/docs/labs/lab01-ros2-hello)
- [Official ROS2 Documentation](https://docs.ros.org/en/humble/)

## Transcript

**[INTRO MUSIC]**

Welcome back to the Physical AI Podcast! Today we're getting hands-on with ROS2 - the software framework that powers most robots in research and industry. Whether you're building a warehouse robot or a Mars rover, chances are you'll be using ROS2.

**[SECTION 1: What is ROS2?]**

Let's clear up a common misconception right away. ROS2 stands for Robot Operating System 2, but it's not actually an operating system. You still need Linux, Windows, or macOS underneath. ROS2 is what we call middleware - it sits between the operating system and your robot application, handling all the complex communication and coordination.

Think of it like this: building a robot from scratch means solving the same problems over and over - how do sensors talk to actuators? How do you coordinate multiple processes? ROS2 solves these problems once, so you can focus on what makes your robot unique.

**[SECTION 2: Nodes - The Building Blocks]**

The fundamental unit in ROS2 is the node. A node is a single process that does one thing well. You might have a camera node that captures images, a detection node that finds objects, and a navigation node that plans paths.

This modular approach has huge benefits. You can test nodes independently, swap them out easily, and reuse them across different robots. A camera driver you write for one project works on any robot with that camera.

In Python, creating a node is straightforward. You inherit from the Node class, give it a name, and implement your logic. The ROS2 runtime handles all the behind-the-scenes work of registration, discovery, and communication.

**[SECTION 3: Topics - Streaming Data]**

Now, how do nodes talk to each other? The most common way is through topics. A topic is like a named message bus. One node publishes messages to a topic, and any number of other nodes can subscribe to receive those messages.

This is perfect for sensor data. Your camera node publishes images to the /camera/image topic at 30 frames per second. The detection node subscribes and processes each frame. The recording node also subscribes to save everything to disk. They all work independently.

The key insight is that publishers don't know who's listening, and subscribers don't know who's publishing. This decoupling makes the system flexible and robust.

**[SECTION 4: Services - Request and Response]**

Topics work great for streaming data, but sometimes you need a direct request-response pattern. That's where services come in.

Imagine you want to ask the robot for its current battery level. You don't want a constant stream of battery updates - you just want to ask once and get an answer. With a service, your node sends a request to the battery service, waits for the response, and continues.

Services are synchronous, meaning the caller blocks until it gets a response. This is perfect for quick queries and commands, but not ideal for anything that takes a long time.

**[SECTION 5: Actions - The Best of Both Worlds]**

What if you need to tell a robot to navigate to a destination? The journey might take minutes. You can't use a topic because you need to know when it's done. You can't use a service because blocking for minutes is impractical.

Enter actions. Actions are designed for long-running tasks. When you send an action goal, the server accepts it and starts working. While it works, it sends periodic feedback - maybe the remaining distance or current speed. When done, it sends a final result. And crucially, you can cancel an action at any time.

Navigation, manipulation, and any multi-step task typically uses actions.

**[SECTION 6: Packages and Building]**

ROS2 organizes code into packages. A package contains your nodes, message definitions, launch files, and configuration. The build system, colcon, compiles everything and sets up the environment.

The ROS ecosystem has thousands of community packages for everything from SLAM to arm control to computer vision. Before writing something from scratch, check if someone's already built it!

**[OUTRO]**

That's ROS2 in a nutshell. We've covered nodes, topics, services, and actions - the four pillars of ROS2 communication. In the lab, you'll actually build a publisher and subscriber from scratch.

Next episode, we're entering the world of simulation. We'll create virtual robots with URDF and bring them to life in Gazebo. This is where things get really fun!

**[OUTRO MUSIC]**

---

## Related Content

- **Previous Episode**: [Episode 1: Introduction to Physical AI](/podcast/episodes/ep01-physical-ai)
- **Next Episode**: [Episode 3: Robot Simulation](/podcast/episodes/ep03-simulation)
- **Read the Chapter**: [ROS2 Fundamentals](/docs/ros2)
