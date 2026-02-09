---
sidebar_position: 1
title: "لیب 1: ROS2 ہیلو ورلڈ"
description: پبلشرز اور سبسکرائبرز کے ساتھ اپنا پہلا ROS2 نوڈ بنائیں
---

# لیب 1: ROS2 ہیلو ورلڈ

اس لیب میں، آپ پبلشر اور سبسکرائبر نوڈ کے ساتھ اپنا پہلا ROS2 پیکیج بنائیں گے۔

## پیش شرائط

- Ubuntu 22.04 یا Windows with WSL2
- ROS2 Humble انسٹال
- بنیادی Python علم

## مقاصد

- ROS2 ورک اسپیس بنائیں
- ROS2 Python پیکیج بنائیں
- پبلشر نوڈ لاگو کریں
- سبسکرائبر نوڈ لاگو کریں
- متعدد نوڈز ایک ساتھ لانچ کریں

## مرحلہ 1: ورک اسپیس بنائیں

```bash
# ورک اسپیس ڈائریکٹری بنائیں
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws

# ROS2 سورس کریں
source /opt/ros/humble/setup.bash
```

## مرحلہ 2: پیکیج بنائیں

```bash
cd ~/ros2_ws/src

# Python پیکیج بنائیں
ros2 pkg create --build-type ament_python \
    --node-name hello_node \
    hello_world_pkg
```

## مرحلہ 3: پبلشر نوڈ بنائیں

`hello_world_pkg/talker.py` میں ترمیم کریں:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class TalkerNode(Node):
    def __init__(self):
        super().__init__('talker')
        self.publisher = self.create_publisher(String, 'greetings', 10)
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.count = 0
    
    def timer_callback(self):
        msg = String()
        msg.data = f'Hello, Physical AI! Count: {self.count}'
        self.publisher.publish(msg)
        self.count += 1

def main(args=None):
    rclpy.init(args=args)
    node = TalkerNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## مرحلہ 4: سبسکرائبر نوڈ بنائیں

`hello_world_pkg/listener.py` بنائیں:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class ListenerNode(Node):
    def __init__(self):
        super().__init__('listener')
        self.subscription = self.create_subscription(
            String, 'greetings', self.listener_callback, 10)
    
    def listener_callback(self, msg):
        self.get_logger().info(f'Received: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)
    node = ListenerNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## مرحلہ 5: بنائیں اور چلائیں

```bash
cd ~/ros2_ws
colcon build --packages-select hello_world_pkg
source install/setup.bash

# ٹرمینل 1: پبلشر چلائیں
ros2 run hello_world_pkg talker

# ٹرمینل 2: سبسکرائبر چلائیں
ros2 run hello_world_pkg listener
```

## خلاصہ

آپ نے سیکھا کہ کیسے:
- ROS2 Python پیکیج بنائیں
- پبلشر اور سبسکرائبر نوڈز لاگو کریں
- ROS2 نوڈز بنائیں اور چلائیں

## اگلا لیب

[لیب 2: URDF روبوٹ ڈیزائن](/docs/labs/lab02-urdf-design) پر جائیں۔
