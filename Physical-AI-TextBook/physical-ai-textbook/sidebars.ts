import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  textbookSidebar: [
    {
      type: "doc",
      id: "intro/index",
      label: "Introduction to Physical AI",
    },
    {
      type: "doc",
      id: "ros2/index",
      label: "ROS2 Fundamentals",
    },
    {
      type: "doc",
      id: "simulation/index",
      label: "Robot Simulation",
    },
    {
      type: "doc",
      id: "isaac-sim/index",
      label: "NVIDIA Isaac Sim",
    },
    {
      type: "doc",
      id: "vla-models/index",
      label: "Vision-Language-Action Models",
    },
    {
      type: "doc",
      id: "humanoid/index",
      label: "Humanoid Robotics",
    },
    {
      type: "doc",
      id: "resources/index",
      label: "Resources & References",
    },
  ],
  labsSidebar: [
    {
      type: "category",
      label: "Hands-on Labs",
      collapsed: false,
      items: [
        "labs/lab01-ros2-hello",
        "labs/lab02-urdf-design",
        "labs/lab03-gazebo-sim",
        "labs/lab04-isaac-basics",
      ],
    },
  ],
};

export default sidebars;
