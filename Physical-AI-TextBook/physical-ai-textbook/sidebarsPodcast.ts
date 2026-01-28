import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  podcastSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'All Episodes',
    },
    {
      type: 'category',
      label: 'Episodes',
      collapsed: false,
      items: [
        'episodes/ep01-physical-ai',
        'episodes/ep02-ros2',
        'episodes/ep03-simulation',
        'episodes/ep04-isaac-sim',
        'episodes/ep05-vla-models',
        'episodes/ep06-humanoid',
      ],
    },
  ],
};

export default sidebars;
