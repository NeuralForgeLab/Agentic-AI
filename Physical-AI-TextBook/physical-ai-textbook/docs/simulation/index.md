---
sidebar_position: 3
title: Robot Simulation
description: Build and simulate robots using URDF and Gazebo
keywords: [urdf, gazebo, simulation, robot modeling, physics simulation]
---

# Robot Simulation

<div className="learning-objectives">

## Learning Objectives

By the end of this chapter, you will be able to:

- Understand the importance of simulation in robotics development
- Create robot models using URDF (Unified Robot Description Format)
- Set up and configure Gazebo simulator
- Add sensors and actuators to simulated robots
- Integrate Gazebo with ROS2 for control and perception

</div>

## Why Simulate?

Simulation is fundamental to modern robotics development. Before deploying code on expensive hardware, we can test, iterate, and validate in a safe virtual environment.

### Benefits of Simulation

| Benefit | Description |
|---------|-------------|
| **Safety** | Test dangerous scenarios without risk to hardware or people |
| **Speed** | Faster-than-real-time simulation accelerates development |
| **Cost** | No hardware wear, no repairs, no downtime |
| **Reproducibility** | Exact scenario replay for debugging and testing |
| **Parallelization** | Run thousands of simulations simultaneously |
| **Edge Cases** | Test rare scenarios that are hard to create in reality |

### The Simulation Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                   SIMULATION WORKFLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐    ┌──────────────┐    ┌──────────────┐      │
│   │  URDF    │───▶│   Gazebo     │───▶│   ROS2       │      │
│   │  Model   │    │   Physics    │    │   Control    │      │
│   └──────────┘    └──────────────┘    └──────────────┘      │
│        │                │                    │               │
│        ▼                ▼                    ▼               │
│   ┌──────────┐    ┌──────────────┐    ┌──────────────┐      │
│   │  Visual  │    │   Sensor     │    │   Policy     │      │
│   │  Meshes  │    │   Plugins    │    │   Training   │      │
│   └──────────┘    └──────────────┘    └──────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## URDF: Unified Robot Description Format

URDF is an XML format for describing robot models. It defines the robot's physical structure, including links (rigid bodies) and joints (connections between links).

### Basic URDF Structure

```xml
<?xml version="1.0"?>
<robot name="simple_robot">
  
  <!-- Base Link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.3 0.1"/>
      </geometry>
      <material name="blue">
        <color rgba="0.0 0.0 0.8 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.5 0.3 0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="5.0"/>
      <inertia ixx="0.1" ixy="0.0" ixz="0.0" 
               iyy="0.1" iyz="0.0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Wheel Link -->
  <link name="wheel_left">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0.1 0.1 0.1 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.001" ixy="0.0" ixz="0.0" 
               iyy="0.001" iyz="0.0" izz="0.001"/>
    </inertial>
  </link>

  <!-- Joint connecting wheel to base -->
  <joint name="wheel_left_joint" type="continuous">
    <parent link="base_link"/>
    <child link="wheel_left"/>
    <origin xyz="0.0 0.2 -0.05" rpy="1.5708 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>

</robot>
```

### Link Components

Each link can have three components:

```xml
<link name="arm_link">
  <!-- Visual: What you see in visualization -->
  <visual>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <mesh filename="package://robot_description/meshes/arm.stl"/>
    </geometry>
    <material name="silver">
      <color rgba="0.8 0.8 0.8 1.0"/>
    </material>
  </visual>
  
  <!-- Collision: Simplified geometry for physics -->
  <collision>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <cylinder radius="0.05" length="0.3"/>
    </geometry>
  </collision>
  
  <!-- Inertial: Mass and inertia for dynamics -->
  <inertial>
    <origin xyz="0 0 0.15" rpy="0 0 0"/>
    <mass value="2.0"/>
    <inertia ixx="0.01" ixy="0" ixz="0" 
             iyy="0.01" iyz="0" izz="0.005"/>
  </inertial>
</link>
```

### Joint Types

| Joint Type | Description | DOF |
|------------|-------------|-----|
| `fixed` | No motion between links | 0 |
| `revolute` | Rotation around axis with limits | 1 |
| `continuous` | Rotation without limits (wheels) | 1 |
| `prismatic` | Linear motion along axis | 1 |
| `floating` | Free motion in 6 DOF | 6 |
| `planar` | Motion in a plane | 3 |

```xml
<!-- Revolute joint with limits -->
<joint name="shoulder_joint" type="revolute">
  <parent link="base_link"/>
  <child link="upper_arm"/>
  <origin xyz="0 0 0.5" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-1.57" upper="1.57" effort="100" velocity="1.0"/>
  <dynamics damping="0.1" friction="0.05"/>
</joint>

<!-- Continuous joint for wheels -->
<joint name="wheel_joint" type="continuous">
  <parent link="base_link"/>
  <child link="wheel"/>
  <origin xyz="0.2 0 -0.1" rpy="-1.5708 0 0"/>
  <axis xyz="0 0 1"/>
</joint>
```

### Using Xacro for Modular URDFs

Xacro (XML Macros) makes URDFs more maintainable:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="my_robot">
  
  <!-- Properties (variables) -->
  <xacro:property name="wheel_radius" value="0.1"/>
  <xacro:property name="wheel_width" value="0.05"/>
  <xacro:property name="base_length" value="0.5"/>
  
  <!-- Macro for wheels -->
  <xacro:macro name="wheel" params="name parent x_offset y_offset">
    <link name="${name}">
      <visual>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
        <material name="black"/>
      </visual>
      <collision>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
      </collision>
      <inertial>
        <mass value="0.5"/>
        <xacro:cylinder_inertia m="0.5" r="${wheel_radius}" h="${wheel_width}"/>
      </inertial>
    </link>
    
    <joint name="${name}_joint" type="continuous">
      <parent link="${parent}"/>
      <child link="${name}"/>
      <origin xyz="${x_offset} ${y_offset} 0" rpy="-1.5708 0 0"/>
      <axis xyz="0 0 1"/>
    </joint>
  </xacro:macro>
  
  <!-- Use the macro -->
  <xacro:wheel name="wheel_fl" parent="base_link" x_offset="0.2" y_offset="0.15"/>
  <xacro:wheel name="wheel_fr" parent="base_link" x_offset="0.2" y_offset="-0.15"/>
  <xacro:wheel name="wheel_rl" parent="base_link" x_offset="-0.2" y_offset="0.15"/>
  <xacro:wheel name="wheel_rr" parent="base_link" x_offset="-0.2" y_offset="-0.15"/>
  
</robot>
```

## Gazebo Simulator

Gazebo is a powerful open-source robotics simulator that provides:

- **Physics engines**: ODE, Bullet, DART, Simbody
- **Sensor simulation**: Cameras, LiDAR, IMU, GPS, etc.
- **Realistic rendering**: Lighting, shadows, materials
- **ROS2 integration**: Seamless communication with ROS2

### Installing Gazebo

```bash
# Install Gazebo Harmonic (for ROS2 Humble/Iron)
sudo apt update
sudo apt install ros-humble-ros-gz

# Verify installation
gz sim --version
```

### Launching Gazebo with ROS2

```python
# launch/gazebo.launch.py
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, DeclareLaunchArgument
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    pkg_share = FindPackageShare('my_robot_description')
    
    # Gazebo launch
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            PathJoinSubstitution([
                FindPackageShare('ros_gz_sim'),
                'launch',
                'gz_sim.launch.py'
            ])
        ]),
        launch_arguments={
            'gz_args': '-r empty.sdf'
        }.items()
    )
    
    # Spawn robot
    spawn_robot = Node(
        package='ros_gz_sim',
        executable='create',
        arguments=[
            '-name', 'my_robot',
            '-topic', '/robot_description',
            '-x', '0.0',
            '-y', '0.0',
            '-z', '0.1',
        ],
        output='screen'
    )
    
    # Robot state publisher
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        parameters=[{
            'robot_description': Command(['xacro ', 
                PathJoinSubstitution([pkg_share, 'urdf', 'robot.urdf.xacro'])])
        }]
    )
    
    return LaunchDescription([
        gazebo,
        robot_state_publisher,
        spawn_robot,
    ])
```

## Adding Sensors

### Camera Sensor

```xml
<!-- In your URDF/Xacro file -->
<link name="camera_link">
  <visual>
    <geometry>
      <box size="0.02 0.05 0.02"/>
    </geometry>
  </visual>
</link>

<joint name="camera_joint" type="fixed">
  <parent link="base_link"/>
  <child link="camera_link"/>
  <origin xyz="0.25 0 0.1" rpy="0 0 0"/>
</joint>

<!-- Gazebo plugin for camera -->
<gazebo reference="camera_link">
  <sensor name="camera" type="camera">
    <always_on>true</always_on>
    <update_rate>30</update_rate>
    <camera>
      <horizontal_fov>1.047</horizontal_fov>
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.1</near>
        <far>100</far>
      </clip>
    </camera>
    <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>image_raw:=camera/image</remapping>
        <remapping>camera_info:=camera/info</remapping>
      </ros>
      <camera_name>front_camera</camera_name>
      <frame_name>camera_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

### LiDAR Sensor

```xml
<link name="lidar_link">
  <visual>
    <geometry>
      <cylinder radius="0.03" length="0.05"/>
    </geometry>
    <material name="red">
      <color rgba="1 0 0 1"/>
    </material>
  </visual>
</link>

<joint name="lidar_joint" type="fixed">
  <parent link="base_link"/>
  <child link="lidar_link"/>
  <origin xyz="0 0 0.15" rpy="0 0 0"/>
</joint>

<gazebo reference="lidar_link">
  <sensor name="lidar" type="ray">
    <always_on>true</always_on>
    <update_rate>10</update_rate>
    <ray>
      <scan>
        <horizontal>
          <samples>360</samples>
          <resolution>1</resolution>
          <min_angle>-3.14159</min_angle>
          <max_angle>3.14159</max_angle>
        </horizontal>
      </scan>
      <range>
        <min>0.1</min>
        <max>30.0</max>
        <resolution>0.01</resolution>
      </range>
    </ray>
    <plugin name="lidar_controller" filename="libgazebo_ros_ray_sensor.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>~/out:=scan</remapping>
      </ros>
      <output_type>sensor_msgs/LaserScan</output_type>
      <frame_name>lidar_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

### IMU Sensor

```xml
<gazebo reference="base_link">
  <sensor name="imu" type="imu">
    <always_on>true</always_on>
    <update_rate>100</update_rate>
    <imu>
      <angular_velocity>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.001</stddev>
          </noise>
        </x>
        <!-- Similar for y and z -->
      </angular_velocity>
      <linear_acceleration>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.01</stddev>
          </noise>
        </x>
        <!-- Similar for y and z -->
      </linear_acceleration>
    </imu>
    <plugin name="imu_controller" filename="libgazebo_ros_imu_sensor.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>~/out:=imu/data</remapping>
      </ros>
      <frame_name>base_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

## Differential Drive Control

```xml
<!-- Differential drive plugin -->
<gazebo>
  <plugin name="diff_drive" filename="libgazebo_ros_diff_drive.so">
    <ros>
      <namespace>/robot</namespace>
    </ros>
    
    <!-- Wheel joints -->
    <left_joint>wheel_left_joint</left_joint>
    <right_joint>wheel_right_joint</right_joint>
    
    <!-- Kinematics -->
    <wheel_separation>0.3</wheel_separation>
    <wheel_diameter>0.2</wheel_diameter>
    
    <!-- Limits -->
    <max_wheel_torque>20</max_wheel_torque>
    <max_wheel_acceleration>1.0</max_wheel_acceleration>
    
    <!-- Topics -->
    <command_topic>cmd_vel</command_topic>
    <odometry_topic>odom</odometry_topic>
    <odometry_frame>odom</odometry_frame>
    <robot_base_frame>base_link</robot_base_frame>
    
    <!-- Output -->
    <publish_odom>true</publish_odom>
    <publish_odom_tf>true</publish_odom_tf>
    <publish_wheel_tf>true</publish_wheel_tf>
  </plugin>
</gazebo>
```

## Complete Example: Mobile Robot

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="mobile_robot">
  
  <!-- Constants -->
  <xacro:property name="base_width" value="0.3"/>
  <xacro:property name="base_length" value="0.4"/>
  <xacro:property name="base_height" value="0.1"/>
  <xacro:property name="wheel_radius" value="0.05"/>
  <xacro:property name="wheel_width" value="0.025"/>
  
  <!-- Base Link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
      <material name="blue">
        <color rgba="0.2 0.2 0.8 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="5.0"/>
      <inertia ixx="0.05" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
  </link>
  
  <!-- Include wheels, sensors, and plugins... -->
  
</robot>
```

## Summary

- **Simulation** enables safe, fast, and reproducible robot development
- **URDF** describes robot structure with links and joints
- **Xacro** adds modularity with macros and properties
- **Gazebo** provides physics, sensors, and ROS2 integration
- **Sensors** like cameras, LiDAR, and IMU can be simulated realistically
- **Control plugins** enable testing locomotion and manipulation

## Next Steps

In the next chapter, we'll explore NVIDIA Isaac Sim, which provides photorealistic rendering, advanced physics, and powerful AI training capabilities.

---

import ChapterPodcastLink from '@site/src/components/ChapterPodcastLink';

<ChapterPodcastLink 
  episodeUrl="/podcast/episodes/ep03-simulation"
  episodeNumber={3}
  duration="16 min"
/>
