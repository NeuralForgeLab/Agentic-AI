---
sidebar_position: 4
title: NVIDIA Isaac Sim
description: Master NVIDIA's powerful robotics simulation platform for AI development
keywords: [nvidia, isaac sim, omniverse, synthetic data, digital twin, simulation]
---

# NVIDIA Isaac Sim

<div className="learning-objectives">

## Learning Objectives

By the end of this chapter, you will be able to:

- Understand Isaac Sim's architecture and capabilities
- Set up and navigate the Isaac Sim environment
- Import and configure robot models in Isaac Sim
- Generate synthetic training data for AI models
- Create digital twin workflows for robot development
- Integrate Isaac Sim with ROS2

</div>

## What is Isaac Sim?

**NVIDIA Isaac Sim** is a robotics simulation platform built on NVIDIA Omniverse. It provides photorealistic rendering, accurate physics simulation, and powerful tools for developing, testing, and training AI-based robots.

### Key Features

| Feature | Description |
|---------|-------------|
| **Photorealistic Rendering** | RTX ray tracing for realistic visuals and sensor simulation |
| **PhysX 5 Physics** | Accurate rigid body, articulation, and soft body simulation |
| **Synthetic Data Generation** | Automated ground truth labeling for training data |
| **Domain Randomization** | Vary environments for robust sim-to-real transfer |
| **ROS2 Integration** | Native bridges to ROS2 ecosystem |
| **Python API** | Full scriptability for automation and training |
| **Cloud Scalability** | Run thousands of simulations in parallel |

### Isaac Sim Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      NVIDIA ISAAC SIM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                    OMNIVERSE PLATFORM                     │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│   │  │    USD      │  │   Nucleus   │  │   Connectors    │   │  │
│   │  │   Format    │  │   Database  │  │   (CAD/DCC)     │   │  │
│   │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │   RTX        │  │   PhysX 5    │  │    Isaac           │  │
│   │   Renderer   │  │   Physics    │  │    Extensions      │  │
│   └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                    PYTHON API                             │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│   │  │ omni.isaac  │  │   Replicator │  │   ROS2 Bridge   │   │  │
│   │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Getting Started

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **GPU** | RTX 2070 | RTX 4080 or better |
| **VRAM** | 8 GB | 16+ GB |
| **RAM** | 32 GB | 64 GB |
| **Storage** | 50 GB SSD | 100+ GB NVMe |
| **OS** | Ubuntu 20.04/22.04, Windows 10/11 | Ubuntu 22.04 |
| **Driver** | 525.60+ | Latest |

### Installation

```bash
# 1. Install NVIDIA Omniverse Launcher
# Download from: https://www.nvidia.com/omniverse

# 2. Install Isaac Sim through the Launcher
# Navigate to Exchange > Isaac Sim > Install

# 3. Launch Isaac Sim
# Or from terminal:
~/.local/share/ov/pkg/isaac_sim-*/isaac-sim.sh
```

### First Steps in Isaac Sim

```python
# hello_isaac.py - Basic Isaac Sim script
from omni.isaac.kit import SimulationApp

# Initialize the simulation
simulation_app = SimulationApp({"headless": False})

# Import after SimulationApp is created
from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
import numpy as np

# Create a world
world = World(stage_units_in_meters=1.0)

# Add ground plane
world.scene.add_default_ground_plane()

# Add a cube
cube = world.scene.add(
    DynamicCuboid(
        prim_path="/World/Cube",
        name="my_cube",
        position=np.array([0.0, 0.0, 1.0]),
        size=np.array([0.5, 0.5, 0.5]),
        color=np.array([0.2, 0.4, 0.8])
    )
)

# Reset the world
world.reset()

# Run simulation loop
while simulation_app.is_running():
    world.step(render=True)
    
    # Get cube position
    position, _ = cube.get_world_pose()
    if position[2] < 0.3:  # Cube has fallen
        print(f"Cube at rest: {position}")
        break

simulation_app.close()
```

## Working with Robots

### Importing URDF

```python
from omni.isaac.core.utils.extensions import enable_extension
enable_extension("omni.importer.urdf")

from omni.importer.urdf import _urdf
from omni.isaac.core import World

# Configure URDF import
urdf_interface = _urdf.acquire_urdf_interface()

import_config = _urdf.ImportConfig()
import_config.merge_fixed_joints = False
import_config.fix_base = False
import_config.import_inertia_tensor = True
import_config.distance_scale = 1.0
import_config.density = 0.0
import_config.default_drive_type = _urdf.UrdfJointTargetType.JOINT_DRIVE_POSITION
import_config.default_drive_strength = 1000.0
import_config.default_position_drive_damping = 100.0

# Import the robot
result, robot_prim_path = urdf_interface.parse_urdf(
    urdf_path="/path/to/robot.urdf",
    import_config=import_config
)
```

### Robot Controller

```python
from omni.isaac.core.articulations import Articulation
from omni.isaac.core.controllers import BaseController
import numpy as np

class SimpleArmController(BaseController):
    def __init__(self, name: str, robot: Articulation):
        super().__init__(name)
        self._robot = robot
        
    def forward(self, target_positions: np.ndarray) -> np.ndarray:
        """Compute joint actions to reach target positions"""
        current_positions = self._robot.get_joint_positions()
        
        # Simple P controller
        kp = 10.0
        position_error = target_positions - current_positions
        actions = kp * position_error
        
        return actions

# Usage
world = World()
robot = world.scene.add(
    Articulation(
        prim_path="/World/Robot",
        name="my_robot"
    )
)

controller = SimpleArmController("arm_controller", robot)

# In simulation loop
target = np.array([0.0, 0.5, -0.5, 0.0, 0.0, 0.0])
actions = controller.forward(target)
robot.apply_action(actions)
```

### Differential Drive Robot

```python
from omni.isaac.wheeled_robots.robots import WheeledRobot
from omni.isaac.wheeled_robots.controllers import DifferentialController

# Create wheeled robot
robot = WheeledRobot(
    prim_path="/World/Robot",
    name="diff_drive_robot",
    wheel_dof_names=["left_wheel_joint", "right_wheel_joint"],
    create_robot=True,
    usd_path="/path/to/robot.usd",
    position=np.array([0.0, 0.0, 0.0])
)

# Create controller
controller = DifferentialController(
    name="diff_controller",
    wheel_radius=0.05,
    wheel_base=0.3
)

# Control with linear and angular velocity
linear_velocity = 0.5  # m/s
angular_velocity = 0.2  # rad/s

wheel_velocities = controller.forward(
    command=[linear_velocity, angular_velocity]
)
robot.apply_wheel_actions(wheel_velocities)
```

## Sensor Simulation

### Camera Sensor

```python
from omni.isaac.sensor import Camera
import numpy as np

# Create camera
camera = Camera(
    prim_path="/World/Robot/Camera",
    name="front_camera",
    frequency=30,
    resolution=(640, 480),
    position=np.array([0.5, 0.0, 0.3]),
    orientation=np.array([1.0, 0.0, 0.0, 0.0])  # quaternion
)

# Initialize camera
camera.initialize()

# Get RGB image
rgb_data = camera.get_rgba()[:, :, :3]  # Remove alpha channel

# Get depth
depth_data = camera.get_depth()

# Get semantic segmentation (requires Replicator setup)
semantic_data = camera.get_semantic_segmentation()
```

### LiDAR Sensor

```python
from omni.isaac.range_sensor import LidarRtx

# Create LiDAR
lidar = LidarRtx(
    prim_path="/World/Robot/Lidar",
    name="top_lidar",
    position=np.array([0.0, 0.0, 0.5]),
    rotation=np.array([0.0, 0.0, 0.0]),
    config_file_path="/Isaac/Sensors/LiDAR/Velodyne_VLP16.json"
)

# Get point cloud
point_cloud = lidar.get_point_cloud()

# Get range data
ranges = lidar.get_linear_depth_data()
```

## Synthetic Data Generation

Isaac Sim's **Replicator** enables automated synthetic data generation with perfect ground truth labels.

### Basic Replicator Setup

```python
import omni.replicator.core as rep

# Create a simple scene
with rep.new_layer():
    # Create camera
    camera = rep.create.camera(
        position=(5, 5, 5),
        look_at=(0, 0, 0)
    )
    
    # Create render product
    render_product = rep.create.render_product(camera, (1024, 1024))
    
    # Create writer for output
    writer = rep.WriterRegistry.get("BasicWriter")
    writer.initialize(
        output_dir="_output",
        rgb=True,
        bounding_box_2d_tight=True,
        semantic_segmentation=True,
        instance_segmentation=True,
        distance_to_camera=True
    )
    writer.attach([render_product])

# Run data generation
rep.orchestrator.run()
```

### Domain Randomization

```python
import omni.replicator.core as rep

def randomize_scene():
    """Randomize scene for domain randomization"""
    
    # Randomize object positions
    with rep.get.prims(semantics=[("class", "object")]):
        rep.modify.pose(
            position=rep.distribution.uniform((-2, -2, 0), (2, 2, 0.5)),
            rotation=rep.distribution.uniform((0, 0, 0), (0, 0, 360))
        )
    
    # Randomize lighting
    with rep.get.prims(path_pattern="/World/Lights/*"):
        rep.modify.attribute(
            "intensity",
            rep.distribution.uniform(500, 2000)
        )
        rep.modify.attribute(
            "color",
            rep.distribution.uniform((0.8, 0.8, 0.8), (1.0, 1.0, 1.0))
        )
    
    # Randomize materials
    with rep.get.prims(semantics=[("class", "floor")]):
        rep.randomizer.materials(
            materials=rep.get.material(path_pattern="/World/Materials/*")
        )

# Register randomizer
rep.randomizer.register(randomize_scene)

# Generate multiple frames with randomization
with rep.trigger.on_frame(num_frames=1000):
    rep.randomizer.randomize_scene()
```

### Training Data for Object Detection

```python
import omni.replicator.core as rep

# Scene setup
with rep.new_layer():
    # Background
    rep.create.plane(scale=10, material=rep.create.material_omnipbr(
        diffuse_texture=rep.distribution.choice([
            "omniverse://localhost/NVIDIA/Materials/Floor/concrete.mdl",
            "omniverse://localhost/NVIDIA/Materials/Floor/wood.mdl",
        ])
    ))
    
    # Objects to detect
    objects = []
    for i in range(10):
        obj = rep.create.from_usd(
            rep.distribution.choice([
                "/path/to/object1.usd",
                "/path/to/object2.usd",
                "/path/to/object3.usd",
            ]),
            semantics=[("class", "target_object")]
        )
        objects.append(obj)
    
    # Camera
    camera = rep.create.camera(
        position=rep.distribution.uniform((3, 3, 2), (5, 5, 4)),
        look_at=(0, 0, 0)
    )
    
    # Render product with annotations
    rp = rep.create.render_product(camera, (1280, 720))
    
    # Writer with all annotations
    writer = rep.WriterRegistry.get("KittiWriter")
    writer.initialize(output_dir="_kitti_output")
    writer.attach([rp])

# Run with randomization
with rep.trigger.on_frame(num_frames=5000):
    with rep.get.prims(semantics=[("class", "target_object")]):
        rep.modify.pose(
            position=rep.distribution.uniform((-2, -2, 0.1), (2, 2, 0.5)),
            rotation=rep.distribution.uniform((0, 0, 0), (360, 360, 360))
        )
```

## ROS2 Integration

### Isaac Sim ROS2 Bridge

```python
from omni.isaac.core import World
from omni.isaac.ros2_bridge import ROS2Bridge
import rclpy

# Enable ROS2 bridge extension
from omni.isaac.core.utils.extensions import enable_extension
enable_extension("omni.isaac.ros2_bridge")

# Create world
world = World()

# Create robot and add to scene
# ...

# Initialize ROS2
rclpy.init()

# Camera publisher
from omni.isaac.ros2_bridge import publishers
camera_publisher = publishers.CameraRgbPublisher(
    camera_prim_path="/World/Robot/Camera",
    topic_name="/camera/image_raw",
    frame_id="camera_link"
)

# LiDAR publisher
lidar_publisher = publishers.LaserScanPublisher(
    lidar_prim_path="/World/Robot/Lidar",
    topic_name="/scan",
    frame_id="lidar_link"
)

# Command velocity subscriber
from omni.isaac.ros2_bridge import subscribers
cmd_vel_subscriber = subscribers.TwistSubscriber(
    robot_prim_path="/World/Robot",
    topic_name="/cmd_vel"
)

# Simulation loop
while simulation_app.is_running():
    world.step(render=True)
    
    # ROS2 communication happens automatically
    rclpy.spin_once(timeout_sec=0)
```

### Action Graph for ROS2

Isaac Sim uses Action Graphs for visual programming of ROS2 nodes:

```python
import omni.graph.core as og

# Create action graph
og.Controller.create_graph({
    "graph_path": "/World/ROS2Graph",
    "evaluator_name": "execution"
})

# Add ROS2 clock
og.Controller.create_node(
    "/World/ROS2Graph/ros2_clock",
    "omni.isaac.ros2_bridge.ROS2Clock"
)

# Add camera publisher
og.Controller.create_node(
    "/World/ROS2Graph/camera_rgb",
    "omni.isaac.ros2_bridge.ROS2CameraHelper"
)

# Connect nodes
og.Controller.connect(
    "/World/ROS2Graph/ros2_clock.outputs:execOut",
    "/World/ROS2Graph/camera_rgb.inputs:execIn"
)
```

## Headless Training

For reinforcement learning and large-scale training:

```python
# headless_training.py
from omni.isaac.kit import SimulationApp

# Launch in headless mode
config = {
    "headless": True,
    "width": 128,
    "height": 128,
}
simulation_app = SimulationApp(config)

from omni.isaac.core import World
from omni.isaac.core.utils.nucleus import get_assets_root_path
import torch

# Setup environment
world = World(physics_dt=1/120, rendering_dt=1/30)

# Training loop
num_episodes = 10000
for episode in range(num_episodes):
    world.reset()
    
    done = False
    total_reward = 0
    
    while not done:
        # Get observation
        obs = get_observation()
        
        # Policy forward pass
        action = policy(torch.tensor(obs))
        
        # Step simulation
        apply_action(action)
        world.step(render=False)  # No rendering for speed
        
        # Get reward
        reward, done = compute_reward()
        total_reward += reward
    
    # Update policy
    policy.update()
    
    if episode % 100 == 0:
        print(f"Episode {episode}, Reward: {total_reward}")

simulation_app.close()
```

## Summary

- **Isaac Sim** provides photorealistic simulation with RTX rendering
- **URDF import** brings ROS robots into Isaac Sim
- **Sensor simulation** includes cameras, LiDAR, and IMU with realistic noise
- **Replicator** automates synthetic data generation with domain randomization
- **ROS2 bridge** enables seamless integration with the ROS ecosystem
- **Headless mode** enables large-scale parallel training

## Next Steps

In the next chapter, we'll explore Vision-Language-Action (VLA) models that can be trained using Isaac Sim's synthetic data capabilities.

---

import ChapterPodcastLink from '@site/src/components/ChapterPodcastLink';

<ChapterPodcastLink 
  episodeUrl="/podcast/episodes/ep04-isaac-sim"
  episodeNumber={4}
  duration="17 min"
/>
