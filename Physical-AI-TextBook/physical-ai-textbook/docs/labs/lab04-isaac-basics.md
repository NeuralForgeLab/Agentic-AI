---
sidebar_position: 4
title: "Lab 4: Isaac Sim Basics"
description: Get started with NVIDIA Isaac Sim for robotics simulation
keywords: [isaac sim, nvidia, simulation, synthetic data, lab]
---

# Lab 4: Isaac Sim Basics

In this lab, you'll get started with NVIDIA Isaac Sim, import a robot, and generate synthetic data.

## Prerequisites

- NVIDIA GPU (RTX 2070 or better)
- NVIDIA Omniverse installed
- Isaac Sim installed via Omniverse Launcher

## Objectives

- Navigate Isaac Sim interface
- Import and configure robots
- Add sensors and simulate
- Generate synthetic training data

## Step 1: Launch Isaac Sim

```bash
# From terminal (Linux)
~/.local/share/ov/pkg/isaac_sim-*/isaac-sim.sh

# Or launch from Omniverse Launcher
```

## Step 2: Interface Overview

Key panels in Isaac Sim:
- **Viewport**: 3D scene view
- **Stage**: Scene hierarchy (USD structure)
- **Property**: Selected object properties
- **Content Browser**: Assets and materials
- **Console**: Python output and errors

## Step 3: Create Simple Scene (GUI)

1. **Add Ground Plane**
   - Create > Physics > Ground Plane

2. **Add Lighting**
   - Create > Light > Dome Light
   - Set Intensity: 1000

3. **Add Objects**
   - Create > Mesh > Cube
   - Position: (0, 0, 0.5)
   - Add Rigid Body: Right-click > Add > Physics > Rigid Body

4. **Play Simulation**
   - Press Play button or Space

## Step 4: Python Scripting

Open Script Editor: Window > Script Editor

```python
# hello_isaac.py - Basic scene setup

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
import numpy as np

# Create world
world = World(stage_units_in_meters=1.0)

# Add ground plane
world.scene.add_default_ground_plane()

# Add cubes
for i in range(5):
    cube = world.scene.add(
        DynamicCuboid(
            prim_path=f"/World/Cube_{i}",
            name=f"cube_{i}",
            position=np.array([i * 0.3 - 0.6, 0.0, 0.5 + i * 0.2]),
            size=np.array([0.1, 0.1, 0.1]),
            color=np.array([0.2 + i * 0.15, 0.3, 0.8 - i * 0.1])
        )
    )

# Reset world
world.reset()

print("Scene created! Press Play to simulate.")
```

## Step 5: Import Robot from URDF

```python
from omni.isaac.core.utils.extensions import enable_extension
enable_extension("omni.importer.urdf")

from omni.importer.urdf import _urdf

# Configure import
urdf_interface = _urdf.acquire_urdf_interface()

import_config = _urdf.ImportConfig()
import_config.fix_base = False
import_config.import_inertia_tensor = True
import_config.default_drive_type = _urdf.UrdfJointTargetType.JOINT_DRIVE_POSITION
import_config.default_drive_strength = 1000.0
import_config.default_position_drive_damping = 100.0

# Import robot
urdf_path = "/path/to/my_robot.urdf"
result, robot_prim_path = urdf_interface.parse_urdf(
    urdf_path=urdf_path,
    import_config=import_config
)

print(f"Robot imported at: {robot_prim_path}")
```

## Step 6: Robot Controller

```python
from omni.isaac.core import World
from omni.isaac.core.articulations import Articulation
from omni.isaac.core.utils.types import ArticulationAction
import numpy as np

# Create world and add robot
world = World()
world.scene.add_default_ground_plane()

# Get robot articulation
robot = world.scene.add(
    Articulation(
        prim_path="/World/my_robot",
        name="my_robot"
    )
)

# Reset
world.reset()

# Get joint info
num_joints = robot.num_dof
joint_names = robot.dof_names
print(f"Robot has {num_joints} joints: {joint_names}")

# Control joints
target_positions = np.zeros(num_joints)
target_positions[0] = 0.5  # Move first joint

# Create action
action = ArticulationAction(
    joint_positions=target_positions,
    joint_efforts=None,
    joint_velocities=None
)

# Apply action
robot.apply_action(action)

# Step simulation
for i in range(100):
    world.step(render=True)
```

## Step 7: Add Camera Sensor

```python
from omni.isaac.sensor import Camera
import numpy as np

# Create camera
camera = Camera(
    prim_path="/World/Camera",
    name="front_camera",
    frequency=30,
    resolution=(640, 480),
    position=np.array([2.0, 0.0, 1.0]),
)

# Point camera at origin
camera.set_focal_length(24.0)

# Initialize
camera.initialize()

# In simulation loop
world.step(render=True)

# Get image data
rgba = camera.get_rgba()           # Shape: (480, 640, 4)
depth = camera.get_depth()         # Shape: (480, 640)
rgb = rgba[:, :, :3]               # Remove alpha

print(f"Image shape: {rgb.shape}")
```

## Step 8: Synthetic Data Generation

```python
import omni.replicator.core as rep

# Create replicator scene
with rep.new_layer():
    # Camera
    camera = rep.create.camera(
        position=(3, 3, 2),
        look_at=(0, 0, 0)
    )
    
    # Objects with semantic labels
    cubes = rep.create.cube(
        count=5,
        position=rep.distribution.uniform((-1, -1, 0.1), (1, 1, 0.5)),
        scale=rep.distribution.uniform(0.1, 0.3),
        semantics=[("class", "cube")]
    )
    
    spheres = rep.create.sphere(
        count=3,
        position=rep.distribution.uniform((-1, -1, 0.1), (1, 1, 0.5)),
        scale=rep.distribution.uniform(0.1, 0.2),
        semantics=[("class", "sphere")]
    )
    
    # Render product
    render_product = rep.create.render_product(camera, (512, 512))
    
    # Writer
    writer = rep.WriterRegistry.get("BasicWriter")
    writer.initialize(
        output_dir="_output/synthetic_data",
        rgb=True,
        bounding_box_2d_tight=True,
        semantic_segmentation=True,
        instance_segmentation=True,
        distance_to_camera=True
    )
    writer.attach([render_product])

# Randomization function
def randomize():
    with rep.get.prims(semantics=[("class", "cube")]):
        rep.modify.pose(
            position=rep.distribution.uniform((-1, -1, 0.1), (1, 1, 0.5)),
            rotation=rep.distribution.uniform((0, 0, 0), (360, 360, 360))
        )

rep.randomizer.register(randomize)

# Generate data
with rep.trigger.on_frame(num_frames=100):
    rep.randomizer.randomize()

rep.orchestrator.run()
print("Synthetic data generated in _output/synthetic_data/")
```

## Step 9: ROS2 Bridge

```python
from omni.isaac.core.utils.extensions import enable_extension
enable_extension("omni.isaac.ros2_bridge")

import rclpy
from omni.isaac.ros2_bridge import publishers

# Initialize ROS2
rclpy.init()

# Create camera publisher
camera_pub = publishers.CameraRgbPublisher(
    camera_prim_path="/World/Camera",
    topic_name="/isaac/camera/rgb",
    frame_id="camera_link"
)

# Create clock publisher
clock_pub = publishers.ClockPublisher()

# In simulation loop
while simulation_app.is_running():
    world.step(render=True)
    rclpy.spin_once(timeout_sec=0)
```

## Step 10: Complete Example

```python
"""
Complete Isaac Sim example with robot, sensors, and control
"""
from omni.isaac.kit import SimulationApp

# Launch simulation
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.wheeled_robots.robots import WheeledRobot
from omni.isaac.wheeled_robots.controllers import DifferentialController
from omni.isaac.sensor import Camera
import numpy as np

# Create world
world = World(stage_units_in_meters=1.0)
world.scene.add_default_ground_plane()

# Add robot
robot = WheeledRobot(
    prim_path="/World/Robot",
    name="my_robot",
    wheel_dof_names=["left_wheel_joint", "right_wheel_joint"],
    create_robot=True,
    position=np.array([0.0, 0.0, 0.1])
)
world.scene.add(robot)

# Add camera to robot
camera = Camera(
    prim_path="/World/Robot/Camera",
    name="robot_camera",
    frequency=30,
    resolution=(320, 240),
)
world.scene.add(camera)

# Controller
controller = DifferentialController(
    name="controller",
    wheel_radius=0.05,
    wheel_base=0.24
)

# Reset
world.reset()
camera.initialize()

# Control loop
linear_vel = 0.3
angular_vel = 0.0
step = 0

while simulation_app.is_running():
    # Change direction periodically
    if step % 200 == 0:
        angular_vel = np.random.uniform(-0.5, 0.5)
    
    # Get wheel velocities
    wheel_vels = controller.forward([linear_vel, angular_vel])
    
    # Apply to robot
    robot.apply_wheel_actions(wheel_vels)
    
    # Step simulation
    world.step(render=True)
    
    # Get camera image every 30 steps
    if step % 30 == 0:
        image = camera.get_rgba()
        print(f"Step {step}, Image shape: {image.shape}")
    
    step += 1
    
    if step > 1000:
        break

simulation_app.close()
```

## Verification Checklist

- [ ] Isaac Sim launches successfully
- [ ] Can create objects and simulate physics
- [ ] Robot imports from URDF
- [ ] Camera captures images
- [ ] Synthetic data generates with labels

## Challenge

1. Import a robot arm and control each joint
2. Create a warehouse scene with shelves
3. Generate 1000 labeled images for object detection
4. Connect to ROS2 and control from teleop

## Summary

You learned how to:
- Navigate Isaac Sim interface
- Create scenes with Python
- Import and control robots
- Add camera sensors
- Generate synthetic training data
- Connect to ROS2

## Next Steps

Explore advanced Isaac Sim features:
- Isaac Gym for reinforcement learning
- Domain randomization
- Multi-robot simulation
- Photorealistic rendering
