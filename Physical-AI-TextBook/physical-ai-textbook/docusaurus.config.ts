import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// Load environment variables
require("dotenv").config();

const config: Config = {
  title: "Physical AI Textbook",
  tagline:
    "Humanoid Robotics with ROS2, Gazebo, NVIDIA Isaac & Vision-Language-Action Models",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  url: "https://mansoor-siddiqui.github.io",
  baseUrl: "/physical-ai-textbook/",

  // SEO metadata
  headTags: [
    // Primary meta tags
    {
      tagName: "meta",
      attributes: {
        name: "description",
        content:
          "Comprehensive educational platform for Physical AI and Humanoid Robotics. Learn ROS2, Gazebo simulation, NVIDIA Isaac Sim, and Vision-Language-Action models with hands-on labs and podcasts.",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "keywords",
        content:
          "Physical AI, Humanoid Robotics, ROS2, Gazebo, NVIDIA Isaac Sim, VLA Models, Robot Simulation, Embodied AI, Machine Learning, Robotics Tutorial",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "author",
        content: "Physical AI Textbook Team",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "robots",
        content: "index, follow",
      },
    },
    // Open Graph / Facebook
    {
      tagName: "meta",
      attributes: {
        property: "og:type",
        content: "website",
      },
    },
    {
      tagName: "meta",
      attributes: {
        property: "og:site_name",
        content: "Physical AI Textbook",
      },
    },
    {
      tagName: "meta",
      attributes: {
        property: "og:locale",
        content: "en_US",
      },
    },
    // Twitter Card
    {
      tagName: "meta",
      attributes: {
        name: "twitter:card",
        content: "summary_large_image",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "twitter:creator",
        content: "@physicalai",
      },
    },
    // Theme color for mobile browsers
    {
      tagName: "meta",
      attributes: {
        name: "theme-color",
        content: "#1a1a2e",
      },
    },
    // Apple touch icon
    {
      tagName: "link",
      attributes: {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/img/apple-touch-icon.png",
      },
    },
    // Structured data for educational content
    {
      tagName: "script",
      attributes: {
        type: "application/ld+json",
      },
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Physical AI Textbook",
        description:
          "Comprehensive educational platform for Physical AI and Humanoid Robotics covering ROS2, Gazebo, NVIDIA Isaac Sim, and Vision-Language-Action models.",
        provider: {
          "@type": "Organization",
          name: "Physical AI Textbook",
        },
        educationalLevel: "Intermediate",
        teaches: [
          "ROS2 Fundamentals",
          "Robot Simulation with Gazebo",
          "NVIDIA Isaac Sim",
          "Vision-Language-Action Models",
          "Humanoid Robotics",
        ],
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: "PT20H",
        },
      }),
    },
  ],

  organizationName: "Mansoor-Siddiqui",
  projectName: "physical-ai-textbook",
  deploymentBranch: "gh-pages",
  trailingSlash: false,

  // Expose Firebase config and RAG API URL to client-side
  customFields: {
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    ragApiUrl:
      process.env.RAG_API_URL ||
      "https://nedianmansoor-physical-ai-backend.hf.space",
  },

  onBrokenLinks: "throw",

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en", "ur"],
    localeConfigs: {
      en: {
        label: "English",
        direction: "ltr",
        htmlLang: "en-US",
      },
      ur: {
        label: "اردو",
        direction: "rtl",
        htmlLang: "ur-PK",
      },
    },
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/Mansoor-Siddiqui/physical-ai-textbook/tree/master/physical-ai-textbook/",
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "podcast",
        path: "podcast",
        routeBasePath: "podcast",
        sidebarPath: "./sidebarsPodcast.ts",
        editUrl:
          "https://github.com/Mansoor-Siddiqui/physical-ai-textbook/tree/master/physical-ai-textbook/",
        showLastUpdateTime: false,
        showLastUpdateAuthor: false,
      },
    ],
    // Google Analytics placeholder - uncomment and add tracking ID when ready
    // [
    //   "@docusaurus/plugin-google-gtag",
    //   {
    //     trackingID: "G-XXXXXXXXXX", // Replace with your Google Analytics 4 tracking ID
    //     anonymizeIP: true,
    //   },
    // ],
    // Plausible Analytics alternative - uncomment when ready
    // [
    //   "docusaurus-plugin-plausible",
    //   {
    //     domain: "your-domain.com",
    //   },
    // ],
  ],

  // Sitemap for SEO
  // The sitemap plugin is included by default in preset-classic

  themeConfig: {
    image: "img/physical-ai-social-card.png",
    metadata: [
      {
        name: "og:image:width",
        content: "1200",
      },
      {
        name: "og:image:height",
        content: "630",
      },
    ],
    announcementBar: {
      id: "support_us",
      content:
        '🤖 New: <a rel="noopener noreferrer" href="podcast">Listen to our Physical AI Podcast</a> - Audio versions of all chapters!',
      backgroundColor: "#1a1a2e",
      textColor: "#e94560",
      isCloseable: true,
    },
    colorMode: {
      defaultMode: "dark",
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      title: "Physical AI Textbook",
      logo: {
        alt: "Physical AI Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "textbookSidebar",
          position: "left",
          label: "Textbook",
        },
        {
          to: "/podcast",
          label: "Podcast",
          position: "left",
        },
        {
          type: "docSidebar",
          sidebarId: "labsSidebar",
          position: "left",
          label: "Labs",
        },
        {
          type: "localeDropdown",
          position: "right",
        },
        {
          href: "https://github.com/Mansoor-Siddiqui/physical-ai-textbook",
          label: "GitHub",
          position: "right",
        },
        {
          type: "custom-userMenu",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Learn",
          items: [
            {
              label: "Introduction",
              to: "/docs/intro",
            },
            {
              label: "ROS2 Fundamentals",
              to: "/docs/ros2",
            },
            {
              label: "Labs",
              to: "/docs/labs/lab01-ros2-hello",
            },
          ],
        },
        {
          title: "Podcast",
          items: [
            {
              label: "All Episodes",
              to: "/podcast",
            },
            {
              label: "Latest Episode",
              to: "/podcast/episodes/ep01-physical-ai",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub Discussions",
              href: "https://github.com/Mansoor-Siddiqui/physical-ai-textbook/discussions",
            },
            {
              label: "ROS Discourse",
              href: "https://discourse.ros.org/",
            },
            {
              label: "NVIDIA Developer Forums",
              href: "https://forums.developer.nvidia.com/c/agx-autonomous-machines/isaac/67",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/Mansoor-Siddiqui/physical-ai-textbook",
            },
            {
              label: "ROS2 Documentation",
              href: "https://docs.ros.org/en/humble/",
            },
            {
              label: "NVIDIA Isaac Sim",
              href: "https://developer.nvidia.com/isaac-sim",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI Textbook. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["python", "bash", "markup", "yaml", "json", "cpp"],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
