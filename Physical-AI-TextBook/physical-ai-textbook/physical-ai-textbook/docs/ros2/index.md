---
sidebar_position: 2
title: ROS2 Fundamentals
description: Master the Robot Operating System 2 - the standard middleware for robotics development
keywords: [ros2, robotics, middleware, nodes, topics, services, actions]
---

# ROS2 Fundamentals

<div className="learning-objectives">

## Learning Objectives

By the end of this chapter, you will be able to:

- Understand the ROS2 architecture and its core concepts
- Create and run ROS2 nodes using Python and C++
- Implement communication patterns using topics, services, and actions
- Build and organize ROS2 packages
- Use essential ROS2 tools for development and debugging

</div>

## What is ROS2?

**ROS2 (Robot Operating System 2)** is an open-source middleware framework for building robot applications. Despite its name, ROS2 is not an operating system—it's a collection of software libraries and tools that help you build robot software.

### Why ROS2?

| Feature | Benefit |
|---------|---------|
| **Standardization** | Common interfaces for sensors, actuators, and algorithms |
| **Modularity** | Break complex systems into manageable, reusable components |
| **Community** | Vast ecosystem of packages and active community support |
| **Real-time Support** | Designed for deterministic, real-time applications |
| **Multi-platform** | Runs on Linux, Windows, macOS, and embedded systems |
| **DDS Foundation** | Built on Data Distribution Service for robust communication |

### ROS2 vs ROS1

ROS2 addresses limitations of ROS1:

```
ROS1 Limitations          →    ROS2 Solutions
─────────────────────────────────────────────────────
Single point of failure   →    Distributed architecture
Linux only                →    Cross-platform support
No real-time support      →    Real-time capable
Security concerns         →    Built-in security (SROS2)
Python 2 dependency       →    Modern Python 3
```

## Core Concepts

### Nodes

A **node** is the fundamental unit of computation in ROS2. Each node is responsible for a single, modular purpose.

```python
# minimal_node.py - A simple ROS2 node in Python
import rclpy
from rclpy.node import Node

class MinimalNode(Node):
    def __init__(self):
        super().__init__('minimal_node')
        self.get_logger().info('Hello from ROS2!')
        
        # Create a timer that fires every second
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.counter = 0
    
    def timer_callback(self):
        self.counter += 1
        self.get_logger().info(f'Timer fired: {self.counter}')

def main(args=None):
    rclpy.init(args=args)
    node = MinimalNode()
    
    try:
        rclpy.spin(node)  # Keep the node running
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Topics

**Topics** are named buses for nodes to exchange messages asynchronously. Publishers send messages; subscribers receive them.

```
┌──────────────┐                    ┌──────────────┐
│   Publisher  │                    │  Subscriber  │
│    Node      │                    │    Node      │
│              │     /camera/image  │              │
│   publish()──┼───────────────────▶┼──callback()  │
│              │                    │              │
└──────────────┘                    └──────────────┘
```

#### Publisher Example

```python
# image_publisher.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2

class ImagePublisher(Node):
    def __init__(self):
        super().__init__('image_publisher')
        
        # Create publisher with queue size of 10
        self.publisher = self.create_publisher(
            Image,           # Message type
            '/camera/image', # Topic name
            10               # Queue size
        )
        
        self.bridge = CvBridge()
        self.timer = self.create_timer(0.033, self.publish_image)  # ~30 FPS
        self.cap = cv2.VideoCapture(0)
        
        self.get_logger().info('Image publisher started')
    
    def publish_image(self):
        ret, frame = self.cap.read()
        if ret:
            msg = self.bridge.cv2_to_imgmsg(frame, encoding='bgr8')
            msg.header.stamp = self.get_clock().now().to_msg()
            self.publisher.publish(msg)
```

#### Subscriber Example

```python
# image_subscriber.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2

class ImageSubscriber(Node):
    def __init__(self):
        super().__init__('image_subscriber')
        
        # Create subscription
        self.subscription = self.create_subscription(
            Image,
            '/camera/image',
            self.image_callback,
            10
        )
        
        self.bridge = CvBridge()
        self.get_logger().info('Image subscriber started')
    
    def image_callback(self, msg):
        # Convert ROS Image to OpenCV format
        frame = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')
        
        # Process the image
        cv2.imshow('Camera Feed', frame)
        cv2.waitKey(1)
```

### Services

**Services** provide synchronous, request-response communication between nodes.

```
┌──────────────┐                    ┌──────────────┐
│    Client    │    /add_numbers    │    Server    │
│    Node      │                    │    Node      │
│              │   Request (a, b)   │              │
│   call() ────┼───────────────────▶│              │
│              │   Response (sum)   │              │
│   ◀──────────┼────────────────────┼── callback() │
└──────────────┘                    └──────────────┘
```

#### Service Definition

```python
# srv/AddTwoInts.srv
int64 a
int64 b
---
int64 sum
```

#### Service Server

```python
# add_service_server.py
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AdditionServer(Node):
    def __init__(self):
        super().__init__('addition_server')
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_callback
        )
        self.get_logger().info('Addition service ready')
    
    def add_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(
            f'Request: {request.a} + {request.b} = {response.sum}'
        )
        return response
```

#### Service Client

```python
# add_service_client.py
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AdditionClient(Node):
    def __init__(self):
        super().__init__('addition_client')
        self.client = self.create_client(AddTwoInts, 'add_two_ints')
        
        # Wait for service to be available
        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Waiting for service...')
    
    def send_request(self, a, b):
        request = AddTwoInts.Request()
        request.a = a
        request.b = b
        
        future = self.client.call_async(request)
        return future
```

### Actions

**Actions** are for long-running tasks that need feedback and can be canceled.

```
┌──────────────┐                         ┌──────────────┐
│    Client    │    /navigate_to_pose    │    Server    │
│    Node      │                         │    Node      │
│              │         Goal            │              │
│   send_goal()├────────────────────────▶│              │
│              │        Feedback         │              │
│   ◀──────────┼─────────────────────────┤  execute()   │
│              │        Feedback         │              │
│   ◀──────────┼─────────────────────────┤              │
│              │         Result          │              │
│   ◀──────────┼─────────────────────────┤              │
└──────────────┘                         └──────────────┘
```

#### Action Definition

```python
# action/Navigate.action
# Goal
geometry_msgs/PoseStamped target_pose
---
# Result
bool success
float32 total_distance
---
# Feedback
float32 distance_remaining
float32 eta_seconds
```

## Building ROS2 Packages

### Package Structure

```
my_robot_pkg/
├── package.xml           # Package metadata and dependencies
├── setup.py              # Python package setup (Python packages)
├── setup.cfg             # Python package config
├── CMakeLists.txt        # Build configuration (C++ packages)
├── my_robot_pkg/         # Python source code
│   ├── __init__.py
│   ├── node_publisher.py
│   └── node_subscriber.py
├── src/                  # C++ source code
├── include/              # C++ headers
├── msg/                  # Custom message definitions
├── srv/                  # Custom service definitions
├── action/               # Custom action definitions
├── launch/               # Launch files
│   └── robot.launch.py
├── config/               # Configuration files
│   └── params.yaml
└── test/                 # Test files
```

### package.xml

```xml
<?xml version="1.0"?>
<package format="3">
  <name>my_robot_pkg</name>
  <version>0.1.0</version>
  <description>My robot package for Physical AI</description>
  <maintainer email="dev@example.com">Developer</maintainer>
  <license>Apache-2.0</license>

  <buildtool_depend>ament_python</buildtool_depend>
  
  <depend>rclpy</depend>
  <depend>std_msgs</depend>
  <depend>sensor_msgs</depend>
  <depend>geometry_msgs</depend>
  
  <test_depend>ament_copyright</test_depend>
  <test_depend>ament_flake8</test_depend>
  <test_depend>ament_pep257</test_depend>
  <test_depend>python3-pytest</test_depend>

  <export>
    <build_type>ament_python</build_type>
  </export>
</package>
```

### setup.py

```python
from setuptools import setup

package_name = 'my_robot_pkg'

setup(
    name=package_name,
    version='0.1.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        ('share/' + package_name + '/launch', ['launch/robot.launch.py']),
        ('share/' + package_name + '/config', ['config/params.yaml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Developer',
    maintainer_email='dev@example.com',
    description='My robot package for Physical AI',
    license='Apache-2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'publisher = my_robot_pkg.node_publisher:main',
            'subscriber = my_robot_pkg.node_subscriber:main',
        ],
    },
)
```

### Launch Files

```python
# launch/robot.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration

def generate_launch_description():
    return LaunchDescription([
        # Declare arguments
        DeclareLaunchArgument(
            'use_sim_time',
            default_value='false',
            description='Use simulation time'
        ),
        
        # Publisher node
        Node(
            package='my_robot_pkg',
            executable='publisher',
            name='image_publisher',
            parameters=[{
                'use_sim_time': LaunchConfiguration('use_sim_time'),
                'publish_rate': 30.0,
            }],
            output='screen',
        ),
        
        # Subscriber node
        Node(
            package='my_robot_pkg',
            executable='subscriber',
            name='image_subscriber',
            parameters=[{
                'use_sim_time': LaunchConfiguration('use_sim_time'),
            }],
            remappings=[
                ('/camera/image', '/robot/camera/rgb'),
            ],
            output='screen',
        ),
    ])
```

## Essential ROS2 Commands

### Workspace Management

```bash
# Create a workspace
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws

# Build the workspace
colcon build

# Source the workspace
source install/setup.bash

# Build specific packages
colcon build --packages-select my_robot_pkg

# Build with symlink install (faster for Python development)
colcon build --symlink-install
```

### Node Operations

```bash
# List running nodes
ros2 node list

# Get info about a node
ros2 node info /image_publisher

# Run a node
ros2 run my_robot_pkg publisher
```

### Topic Operations

```bash
# List all topics
ros2 topic list

# Show topic info
ros2 topic info /camera/image

# Echo topic messages
ros2 topic echo /camera/image

# Publish to a topic
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist "{linear: {x: 1.0}, angular: {z: 0.5}}"

# Check publishing rate
ros2 topic hz /camera/image
```

### Service Operations

```bash
# List all services
ros2 service list

# Call a service
ros2 service call /add_two_ints example_interfaces/srv/AddTwoInts "{a: 5, b: 3}"
```

### Launch Operations

```bash
# Run a launch file
ros2 launch my_robot_pkg robot.launch.py

# With arguments
ros2 launch my_robot_pkg robot.launch.py use_sim_time:=true
```

## Quality of Service (QoS)

ROS2 uses QoS policies to configure communication reliability and performance.

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy, DurabilityPolicy

# Sensor data profile - prioritizes latest data
sensor_qos = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,
    history=HistoryPolicy.KEEP_LAST,
    depth=1,
    durability=DurabilityPolicy.VOLATILE
)

# Reliable profile - ensures message delivery
reliable_qos = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,
    history=HistoryPolicy.KEEP_LAST,
    depth=10,
    durability=DurabilityPolicy.TRANSIENT_LOCAL
)

# Use in publisher
self.publisher = self.create_publisher(
    Image,
    '/camera/image',
    sensor_qos
)
```

## Summary

- **ROS2** is the standard middleware for building robot applications
- **Nodes** are the fundamental computation units
- **Topics** enable asynchronous publish-subscribe communication
- **Services** provide synchronous request-response patterns
- **Actions** handle long-running, cancelable tasks with feedback
- **Packages** organize code, messages, and configurations
- **QoS** policies configure communication reliability

## Next Steps

In the next chapter, we'll use ROS2 with robot simulation in Gazebo, where you'll see these concepts in action with a simulated robot.

---

import ChapterPodcastLink from '@site/src/components/ChapterPodcastLink';

<ChapterPodcastLink 
  episodeUrl="/podcast/episodes/ep02-ros2"
  episodeNumber={2}
  duration="18 min"
/>
