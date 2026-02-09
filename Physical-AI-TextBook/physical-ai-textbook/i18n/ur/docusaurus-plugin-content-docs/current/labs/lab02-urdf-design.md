---
sidebar_position: 2
title: "لیب 2: URDF روبوٹ ڈیزائن"
description: URDF کا استعمال کرتے ہوئے اپنا پہلا روبوٹ ماڈل بنائیں
---

# لیب 2: URDF روبوٹ ڈیزائن

اس لیب میں آپ URDF (Unified Robot Description Format) کا استعمال کرتے ہوئے روبوٹ ماڈل بنانا سیکھیں گے۔

## مقاصد

- URDF ساخت کو سمجھیں
- لنکس اور جوائنٹس بنائیں
- RViz میں روبوٹ ویژولائز کریں

## URDF بنیادیات

URDF XML فارمیٹ میں روبوٹ کی وضاحت کرتا ہے:

```xml
<?xml version="1.0"?>
<robot name="simple_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.3 0.1"/>
      </geometry>
    </visual>
  </link>
</robot>
```

## خلاصہ

آپ نے URDF کی بنیادیات سیکھیں۔

## اگلا لیب

[لیب 3: Gazebo سمولیشن](/docs/labs/lab03-gazebo-sim) پر جائیں۔
