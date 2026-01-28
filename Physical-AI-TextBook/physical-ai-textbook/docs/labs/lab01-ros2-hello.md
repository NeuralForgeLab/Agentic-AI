---
sidebar_position: 1
title: "Lab 1: ROS2 Hello World"
description: Create your first ROS2 node with publishers and subscribers
keywords: [ros2, lab, tutorial, publisher, subscriber, beginner]
---

# Lab 1: ROS2 Hello World

In this lab, you'll create your first ROS2 package with a publisher and subscriber node.

## Prerequisites

- Ubuntu 22.04 or Windows with WSL2
- ROS2 Humble installed
- Basic Python knowledge

## Objectives

- Create a ROS2 workspace
- Build a ROS2 Python package
- Implement a publisher node
- Implement a subscriber node
- Launch multiple nodes together

## Step 1: Create Workspace

```bash
# Create workspace directory
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws

# Source ROS2
source /opt/ros/humble/setup.bash
```

## Step 2: Create Package

```bash
cd ~/ros2_ws/src

# Create Python package
ros2 pkg create --build-type ament_python \
    --node-name hello_node \
    hello_world_pkg

# Navigate to package
cd hello_world_pkg
```

Your package structure:
```
hello_world_pkg/
├── hello_world_pkg/
│   ├── __init__.py
│   └── hello_node.py
├── resource/
│   └── hello_world_pkg
├── test/
├── package.xml
├── setup.cfg
└── setup.py
```

## Step 3: Create Publisher Node

Edit `hello_world_pkg/talker.py`:

```python
#!/usr/bin/env python3
"""
ROS2 Publisher Node - Publishes greeting messages
"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class TalkerNode(Node):
    """Publisher node that sends greeting messages"""
    
    def __init__(self):
        super().__init__('talker')
        
        # Create publisher
        self.publisher = self.create_publisher(
            String,           # Message type
            'greetings',      # Topic name
            10                # Queue size
        )
        
        # Create timer (publish every 0.5 seconds)
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.count = 0
        
        self.get_logger().info('Talker node started!')
    
    def timer_callback(self):
        """Callback function for timer"""
        msg = String()
        msg.data = f'Hello, Physical AI! Count: {self.count}'
        
        self.publisher.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        
        self.count += 1


def main(args=None):
    rclpy.init(args=args)
    
    node = TalkerNode()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Step 4: Create Subscriber Node

Create `hello_world_pkg/listener.py`:

```python
#!/usr/bin/env python3
"""
ROS2 Subscriber Node - Listens for greeting messages
"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class ListenerNode(Node):
    """Subscriber node that receives greeting messages"""
    
    def __init__(self):
        super().__init__('listener')
        
        # Create subscription
        self.subscription = self.create_subscription(
            String,               # Message type
            'greetings',          # Topic name
            self.listener_callback,  # Callback function
            10                    # Queue size
        )
        
        self.get_logger().info('Listener node started!')
    
    def listener_callback(self, msg):
        """Callback function for received messages"""
        self.get_logger().info(f'Received: "{msg.data}"')


def main(args=None):
    rclpy.init(args=args)
    
    node = ListenerNode()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

## Step 5: Update setup.py

Edit `setup.py` to register entry points:

```python
from setuptools import setup

package_name = 'hello_world_pkg'

setup(
    name=package_name,
    version='0.1.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='your_name',
    maintainer_email='your@email.com',
    description='ROS2 Hello World package',
    license='Apache-2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'talker = hello_world_pkg.talker:main',
            'listener = hello_world_pkg.listener:main',
        ],
    },
)
```

## Step 6: Build and Run

```bash
# Navigate to workspace root
cd ~/ros2_ws

# Build package
colcon build --packages-select hello_world_pkg

# Source workspace
source install/setup.bash

# Terminal 1: Run publisher
ros2 run hello_world_pkg talker

# Terminal 2: Run subscriber (new terminal)
source ~/ros2_ws/install/setup.bash
ros2 run hello_world_pkg listener
```

## Step 7: Verify with ROS2 CLI

```bash
# List topics
ros2 topic list

# Echo topic
ros2 topic echo /greetings

# Get topic info
ros2 topic info /greetings

# Check publishing rate
ros2 topic hz /greetings
```

## Challenge: Custom Message

Create a custom message type:

1. Create `msg/Greeting.msg`:
```
string name
string message
int32 count
float64 timestamp
```

2. Update `package.xml` and `CMakeLists.txt`
3. Use the new message type in your nodes

## Summary

You learned how to:
- Create a ROS2 Python package
- Implement publisher and subscriber nodes
- Build and run ROS2 nodes
- Use ROS2 CLI tools for debugging

## Next Lab

Continue to [Lab 2: URDF Robot Design](/docs/labs/lab02-urdf-design) to create your first robot model.
