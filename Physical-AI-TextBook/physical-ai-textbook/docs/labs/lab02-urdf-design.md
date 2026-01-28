---
sidebar_position: 2
title: "Lab 2: URDF Robot Design"
description: Design a mobile robot using URDF and visualize it in RViz
keywords: [urdf, robot design, rviz, visualization, lab]
---

# Lab 2: URDF Robot Design

In this lab, you'll create a differential drive mobile robot using URDF and visualize it in RViz.

## Prerequisites

- Completed Lab 1
- ROS2 Humble with visualization tools

## Objectives

- Understand URDF structure
- Create links with visual and collision geometries
- Define joints between links
- Visualize robot in RViz

## Step 1: Create Robot Description Package

```bash
cd ~/ros2_ws/src

# Create package
ros2 pkg create --build-type ament_python \
    my_robot_description

cd my_robot_description
mkdir -p urdf launch rviz meshes
```

## Step 2: Create Basic URDF

Create `urdf/my_robot.urdf`:

```xml
<?xml version="1.0"?>
<robot name="my_robot">
  
  <!-- ==================== COLORS ==================== -->
  <material name="blue">
    <color rgba="0.2 0.2 0.8 1.0"/>
  </material>
  <material name="black">
    <color rgba="0.1 0.1 0.1 1.0"/>
  </material>
  <material name="white">
    <color rgba="0.9 0.9 0.9 1.0"/>
  </material>
  <material name="red">
    <color rgba="0.8 0.0 0.0 1.0"/>
  </material>

  <!-- ==================== BASE LINK ==================== -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.3 0.2 0.1"/>
      </geometry>
      <origin xyz="0 0 0.05" rpy="0 0 0"/>
      <material name="blue"/>
    </visual>
    <collision>
      <geometry>
        <box size="0.3 0.2 0.1"/>
      </geometry>
      <origin xyz="0 0 0.05" rpy="0 0 0"/>
    </collision>
    <inertial>
      <mass value="5.0"/>
      <origin xyz="0 0 0.05" rpy="0 0 0"/>
      <inertia ixx="0.02" ixy="0" ixz="0" 
               iyy="0.04" iyz="0" izz="0.05"/>
    </inertial>
  </link>

  <!-- ==================== BASE FOOTPRINT ==================== -->
  <link name="base_footprint"/>
  
  <joint name="base_footprint_joint" type="fixed">
    <parent link="base_footprint"/>
    <child link="base_link"/>
    <origin xyz="0 0 0.05" rpy="0 0 0"/>
  </joint>

  <!-- ==================== LEFT WHEEL ==================== -->
  <link name="left_wheel">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.04"/>
      </geometry>
      <material name="black"/>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.05" length="0.04"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.0005" ixy="0" ixz="0" 
               iyy="0.0005" iyz="0" izz="0.001"/>
    </inertial>
  </link>

  <joint name="left_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="left_wheel"/>
    <origin xyz="0 0.12 0" rpy="-1.5708 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>

  <!-- ==================== RIGHT WHEEL ==================== -->
  <link name="right_wheel">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.04"/>
      </geometry>
      <material name="black"/>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.05" length="0.04"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.0005" ixy="0" ixz="0" 
               iyy="0.0005" iyz="0" izz="0.001"/>
    </inertial>
  </link>

  <joint name="right_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="right_wheel"/>
    <origin xyz="0 -0.12 0" rpy="-1.5708 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>

  <!-- ==================== CASTER WHEEL ==================== -->
  <link name="caster_wheel">
    <visual>
      <geometry>
        <sphere radius="0.025"/>
      </geometry>
      <material name="white"/>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.025"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.1"/>
      <inertia ixx="0.00001" ixy="0" ixz="0" 
               iyy="0.00001" iyz="0" izz="0.00001"/>
    </inertial>
  </link>

  <joint name="caster_joint" type="fixed">
    <parent link="base_link"/>
    <child link="caster_wheel"/>
    <origin xyz="-0.12 0 -0.025" rpy="0 0 0"/>
  </joint>

  <!-- ==================== LIDAR ==================== -->
  <link name="lidar_link">
    <visual>
      <geometry>
        <cylinder radius="0.03" length="0.04"/>
      </geometry>
      <material name="red"/>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.03" length="0.04"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.2"/>
      <inertia ixx="0.0001" ixy="0" ixz="0" 
               iyy="0.0001" iyz="0" izz="0.0001"/>
    </inertial>
  </link>

  <joint name="lidar_joint" type="fixed">
    <parent link="base_link"/>
    <child link="lidar_link"/>
    <origin xyz="0.1 0 0.12" rpy="0 0 0"/>
  </joint>

</robot>
```

## Step 3: Create Launch File

Create `launch/display.launch.py`:

```python
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.substitutions import Command, PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare
import os

def generate_launch_description():
    pkg_share = FindPackageShare('my_robot_description')
    
    urdf_file = PathJoinSubstitution([
        pkg_share, 'urdf', 'my_robot.urdf'
    ])
    
    rviz_config = PathJoinSubstitution([
        pkg_share, 'rviz', 'display.rviz'
    ])
    
    robot_description = Command(['cat ', urdf_file])
    
    return LaunchDescription([
        # Robot State Publisher
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            name='robot_state_publisher',
            parameters=[{
                'robot_description': robot_description
            }]
        ),
        
        # Joint State Publisher GUI
        Node(
            package='joint_state_publisher_gui',
            executable='joint_state_publisher_gui',
            name='joint_state_publisher_gui'
        ),
        
        # RViz
        Node(
            package='rviz2',
            executable='rviz2',
            name='rviz2',
            arguments=['-d', rviz_config],
            output='screen'
        ),
    ])
```

## Step 4: Create RViz Config

Create `rviz/display.rviz`:

```yaml
Panels:
  - Class: rviz_common/Displays
    Name: Displays
Visualization Manager:
  Displays:
    - Class: rviz_default_plugins/Grid
      Name: Grid
      Value: true
    - Class: rviz_default_plugins/RobotModel
      Name: RobotModel
      Value: true
      Description Topic:
        Value: /robot_description
    - Class: rviz_default_plugins/TF
      Name: TF
      Value: true
  Global Options:
    Fixed Frame: base_link
    Frame Rate: 30
```

## Step 5: Update setup.py

```python
from setuptools import setup
from glob import glob
import os

package_name = 'my_robot_description'

setup(
    name=package_name,
    version='0.1.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        (os.path.join('share', package_name, 'urdf'), 
            glob('urdf/*.urdf')),
        (os.path.join('share', package_name, 'launch'), 
            glob('launch/*.py')),
        (os.path.join('share', package_name, 'rviz'), 
            glob('rviz/*.rviz')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='your_name',
    maintainer_email='your@email.com',
    description='Robot description package',
    license='Apache-2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [],
    },
)
```

## Step 6: Update package.xml

Add dependencies:

```xml
<depend>robot_state_publisher</depend>
<depend>joint_state_publisher_gui</depend>
<depend>rviz2</depend>
```

## Step 7: Build and Visualize

```bash
cd ~/ros2_ws
colcon build --packages-select my_robot_description
source install/setup.bash

ros2 launch my_robot_description display.launch.py
```

## Step 8: Using Xacro (Optional)

Convert to Xacro for modularity. Create `urdf/my_robot.urdf.xacro`:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="my_robot">
  
  <!-- Properties -->
  <xacro:property name="wheel_radius" value="0.05"/>
  <xacro:property name="wheel_width" value="0.04"/>
  <xacro:property name="base_width" value="0.2"/>
  <xacro:property name="base_length" value="0.3"/>
  
  <!-- Wheel Macro -->
  <xacro:macro name="wheel" params="name x_offset y_offset">
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
    </link>
    
    <joint name="${name}_joint" type="continuous">
      <parent link="base_link"/>
      <child link="${name}"/>
      <origin xyz="${x_offset} ${y_offset} 0" rpy="-1.5708 0 0"/>
      <axis xyz="0 0 1"/>
    </joint>
  </xacro:macro>
  
  <!-- Use macros -->
  <xacro:wheel name="left_wheel" x_offset="0" y_offset="0.12"/>
  <xacro:wheel name="right_wheel" x_offset="0" y_offset="-0.12"/>
  
</robot>
```

## Verification Checklist

- [ ] Robot displays correctly in RViz
- [ ] Wheels rotate using joint state publisher GUI
- [ ] TF tree shows all frames
- [ ] No red errors in RViz

## Challenge

1. Add a camera link on top of the robot
2. Create a robot arm with 3 revolute joints
3. Use mesh files for realistic appearance

## Summary

You learned how to:
- Create URDF robot descriptions
- Define links with visual, collision, and inertial properties
- Connect links with joints
- Visualize robots in RViz

## Next Lab

Continue to [Lab 3: Gazebo Simulation](/docs/labs/lab03-gazebo-sim) to simulate your robot.
