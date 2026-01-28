---
sidebar_position: 3
title: "Lab 3: Gazebo Simulation"
description: Simulate your robot in Gazebo with sensors and control
keywords: [gazebo, simulation, physics, sensors, lab]
---

# Lab 3: Gazebo Simulation

In this lab, you'll simulate your robot in Gazebo, add sensors, and control it with ROS2.

## Prerequisites

- Completed Lab 2 (URDF robot)
- Gazebo installed with ROS2 integration

## Objectives

- Launch robot in Gazebo
- Add Gazebo plugins for sensors
- Control robot with teleop
- Visualize sensor data in RViz

## Step 1: Install Gazebo Dependencies

```bash
sudo apt install ros-humble-ros-gz ros-humble-gazebo-ros-pkgs
```

## Step 2: Add Gazebo Tags to URDF

Create `urdf/my_robot.gazebo.xacro`:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <!-- Gazebo Colors -->
  <gazebo reference="base_link">
    <material>Gazebo/Blue</material>
  </gazebo>
  
  <gazebo reference="left_wheel">
    <material>Gazebo/Black</material>
    <mu1>1.0</mu1>
    <mu2>1.0</mu2>
  </gazebo>
  
  <gazebo reference="right_wheel">
    <material>Gazebo/Black</material>
    <mu1>1.0</mu1>
    <mu2>1.0</mu2>
  </gazebo>
  
  <gazebo reference="caster_wheel">
    <material>Gazebo/White</material>
    <mu1>0.0</mu1>
    <mu2>0.0</mu2>
  </gazebo>

  <!-- Differential Drive Plugin -->
  <gazebo>
    <plugin name="diff_drive" filename="libgazebo_ros_diff_drive.so">
      <ros>
        <namespace>/my_robot</namespace>
      </ros>
      
      <left_joint>left_wheel_joint</left_joint>
      <right_joint>right_wheel_joint</right_joint>
      
      <wheel_separation>0.24</wheel_separation>
      <wheel_diameter>0.1</wheel_diameter>
      
      <max_wheel_torque>20</max_wheel_torque>
      <max_wheel_acceleration>1.0</max_wheel_acceleration>
      
      <command_topic>cmd_vel</command_topic>
      <odometry_topic>odom</odometry_topic>
      <odometry_frame>odom</odometry_frame>
      <robot_base_frame>base_footprint</robot_base_frame>
      
      <publish_odom>true</publish_odom>
      <publish_odom_tf>true</publish_odom_tf>
      <publish_wheel_tf>false</publish_wheel_tf>
      
      <update_rate>50</update_rate>
    </plugin>
  </gazebo>

  <!-- LiDAR Plugin -->
  <gazebo reference="lidar_link">
    <material>Gazebo/Red</material>
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
          <max>10.0</max>
          <resolution>0.01</resolution>
        </range>
        <noise>
          <type>gaussian</type>
          <mean>0.0</mean>
          <stddev>0.01</stddev>
        </noise>
      </ray>
      <plugin name="lidar_controller" filename="libgazebo_ros_ray_sensor.so">
        <ros>
          <namespace>/my_robot</namespace>
          <remapping>~/out:=scan</remapping>
        </ros>
        <output_type>sensor_msgs/LaserScan</output_type>
        <frame_name>lidar_link</frame_name>
      </plugin>
    </sensor>
  </gazebo>

</robot>
```

## Step 3: Update Main URDF

Update `urdf/my_robot.urdf.xacro`:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="my_robot">
  
  <!-- Include Gazebo file -->
  <xacro:include filename="$(find my_robot_description)/urdf/my_robot.gazebo.xacro"/>
  
  <!-- Rest of robot definition... -->
  
</robot>
```

## Step 4: Create World File

Create `worlds/simple_world.world`:

```xml
<?xml version="1.0"?>
<sdf version="1.6">
  <world name="simple_world">
    
    <!-- Sun -->
    <include>
      <uri>model://sun</uri>
    </include>
    
    <!-- Ground Plane -->
    <include>
      <uri>model://ground_plane</uri>
    </include>
    
    <!-- Walls -->
    <model name="wall_1">
      <static>true</static>
      <pose>5 0 0.5 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box><size>0.1 10 1</size></box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box><size>0.1 10 1</size></box>
          </geometry>
        </visual>
      </link>
    </model>
    
    <!-- Obstacles -->
    <model name="obstacle_1">
      <static>true</static>
      <pose>2 1 0.25 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <cylinder><radius>0.3</radius><length>0.5</length></cylinder>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <cylinder><radius>0.3</radius><length>0.5</length></cylinder>
          </geometry>
          <material>
            <ambient>0.8 0.2 0.2 1</ambient>
          </material>
        </visual>
      </link>
    </model>

  </world>
</sdf>
```

## Step 5: Create Gazebo Launch File

Create `launch/gazebo.launch.py`:

```python
import os
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import Command, LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare
from ament_index_python.packages import get_package_share_directory


def generate_launch_description():
    pkg_share = FindPackageShare('my_robot_description')
    pkg_gazebo_ros = get_package_share_directory('gazebo_ros')
    
    # Paths
    urdf_file = PathJoinSubstitution([
        pkg_share, 'urdf', 'my_robot.urdf.xacro'
    ])
    world_file = PathJoinSubstitution([
        pkg_share, 'worlds', 'simple_world.world'
    ])
    
    # Robot description
    robot_description = Command(['xacro ', urdf_file])
    
    # Declare arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='true')
    
    return LaunchDescription([
        # Declare launch arguments
        DeclareLaunchArgument(
            'use_sim_time',
            default_value='true',
            description='Use simulation time'
        ),
        
        # Gazebo Server
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(
                os.path.join(pkg_gazebo_ros, 'launch', 'gzserver.launch.py')
            ),
            launch_arguments={'world': world_file}.items()
        ),
        
        # Gazebo Client
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(
                os.path.join(pkg_gazebo_ros, 'launch', 'gzclient.launch.py')
            )
        ),
        
        # Robot State Publisher
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            name='robot_state_publisher',
            parameters=[{
                'robot_description': robot_description,
                'use_sim_time': use_sim_time
            }],
            output='screen'
        ),
        
        # Spawn Robot
        Node(
            package='gazebo_ros',
            executable='spawn_entity.py',
            name='spawn_entity',
            arguments=[
                '-topic', 'robot_description',
                '-entity', 'my_robot',
                '-x', '0',
                '-y', '0',
                '-z', '0.1'
            ],
            output='screen'
        ),
    ])
```

## Step 6: Update Package Files

Update `setup.py`:

```python
data_files=[
    # ... existing entries ...
    (os.path.join('share', package_name, 'worlds'), 
        glob('worlds/*.world')),
],
```

Update `package.xml`:

```xml
<exec_depend>gazebo_ros</exec_depend>
<exec_depend>gazebo_plugins</exec_depend>
```

## Step 7: Build and Launch

```bash
cd ~/ros2_ws
colcon build --packages-select my_robot_description
source install/setup.bash

ros2 launch my_robot_description gazebo.launch.py
```

## Step 8: Control the Robot

In a new terminal:

```bash
# Install teleop
sudo apt install ros-humble-teleop-twist-keyboard

# Run teleop
ros2 run teleop_twist_keyboard teleop_twist_keyboard \
    --ros-args --remap cmd_vel:=/my_robot/cmd_vel
```

Use keyboard:
- `i`: Forward
- `,`: Backward
- `j`: Turn left
- `l`: Turn right
- `k`: Stop

## Step 9: Visualize in RViz

```bash
ros2 run rviz2 rviz2
```

Add displays:
1. **RobotModel** - Topic: `/robot_description`
2. **LaserScan** - Topic: `/my_robot/scan`
3. **Odometry** - Topic: `/my_robot/odom`

## Step 10: Record and Playback

```bash
# Record topics
ros2 bag record -o my_robot_bag /my_robot/scan /my_robot/odom /my_robot/cmd_vel

# Playback
ros2 bag play my_robot_bag
```

## Verification Checklist

- [ ] Robot spawns in Gazebo
- [ ] Robot moves with teleop
- [ ] LiDAR scan visible in RViz
- [ ] Odometry updates as robot moves

## Challenge

1. Add a camera sensor with image topic
2. Create a maze world for navigation
3. Implement obstacle avoidance using LiDAR

## Summary

You learned how to:
- Add Gazebo plugins to URDF
- Launch robot in Gazebo simulation
- Control robot with teleop
- Visualize sensor data

## Next Lab

Continue to [Lab 4: Isaac Sim Basics](/docs/labs/lab04-isaac-basics) to explore NVIDIA's advanced simulator.
