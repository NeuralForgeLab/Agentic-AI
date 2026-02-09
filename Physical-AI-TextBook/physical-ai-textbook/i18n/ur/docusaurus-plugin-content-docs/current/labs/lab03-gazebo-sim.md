---
sidebar_position: 3
title: "لیب 3: Gazebo سمولیشن"
description: Gazebo میں روبوٹس سمولیٹ کریں
---

# لیب 3: Gazebo سمولیشن

اس لیب میں آپ Gazebo سمولیٹر میں روبوٹس چلانا سیکھیں گے۔

## مقاصد

- Gazebo شروع کریں
- روبوٹ ماڈل لوڈ کریں
- سمولیشن کنٹرول کریں

## Gazebo شروع کریں

```bash
# Gazebo لانچ کریں
ros2 launch gazebo_ros gazebo.launch.py
```

## روبوٹ سپان کریں

```bash
ros2 run gazebo_ros spawn_entity.py \
    -file /path/to/robot.urdf \
    -entity my_robot
```

## خلاصہ

آپ نے Gazebo سمولیشن کی بنیادیات سیکھیں۔

## اگلا لیب

[لیب 4: Isaac Sim بنیادیات](/docs/labs/lab04-isaac-basics) پر جائیں۔
