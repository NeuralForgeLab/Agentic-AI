import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import Translate, { translate } from "@docusaurus/Translate";
import { useAuth } from "../contexts/AuthContext";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const { user, loading } = useAuth();
  const loginUrl = useBaseUrl("/auth/login");

  const handleProtectedClick = (e: React.MouseEvent, targetUrl: string) => {
    if (!user && !loading) {
      e.preventDefault();
      window.location.href =
        loginUrl + "?returnUrl=" + encodeURIComponent(targetUrl);
    }
  };

  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          <Translate id="homepage.title" description="The homepage title">
            Physical AI Textbook
          </Translate>
        </Heading>
        <p className={styles.heroSubtitle}>
          <Translate id="homepage.tagline" description="The homepage tagline">
            Humanoid Robotics with ROS2, Gazebo, NVIDIA Isaac &
            Vision-Language-Action Models
          </Translate>
        </p>
        <div className={styles.buttons}>
          {user ? (
            <>
              <Link
                className={clsx("button button--lg", styles.primaryButton)}
                to="/docs/intro"
              >
                <Translate
                  id="homepage.startLearning"
                  description="Start learning button"
                >
                  Start Learning
                </Translate>
              </Link>
              <Link
                className={clsx("button button--lg", styles.secondaryButton)}
                to="/podcast"
              >
                <Translate
                  id="homepage.listenPodcast"
                  description="Listen to podcast button"
                >
                  Listen to Podcast
                </Translate>
              </Link>
            </>
          ) : (
            <Link
              className={clsx("button button--lg", styles.primaryButton)}
              to={loginUrl}
            >
              <Translate
                id="homepage.signInToStart"
                description="Sign in to start learning button"
              >
                Sign In to Start Learning
              </Translate>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  titleId: string;
  titleDefault: string;
  icon: string;
  descriptionId: string;
  descriptionDefault: string;
  link: string;
};

const FeatureList: FeatureItem[] = [
  {
    titleId: "homepage.features.ros2.title",
    titleDefault: "ROS2 & Middleware",
    icon: "🤖",
    descriptionId: "homepage.features.ros2.description",
    descriptionDefault:
      "Master the Robot Operating System 2 - the industry standard for building modular, reusable robot software with nodes, topics, services, and actions.",
    link: "/docs/ros2",
  },
  {
    titleId: "homepage.features.simulation.title",
    titleDefault: "Simulation & Digital Twins",
    icon: "🎮",
    descriptionId: "homepage.features.simulation.description",
    descriptionDefault:
      "Build and test robots in virtual environments with Gazebo and NVIDIA Isaac Sim. Generate synthetic training data at scale.",
    link: "/docs/simulation",
  },
  {
    titleId: "homepage.features.vla.title",
    titleDefault: "VLA Models",
    icon: "🧠",
    descriptionId: "homepage.features.vla.description",
    descriptionDefault:
      "Explore Vision-Language-Action models that unify perception, understanding, and action in a single neural network for robot control.",
    link: "/docs/vla-models",
  },
  {
    titleId: "homepage.features.humanoid.title",
    titleDefault: "Humanoid Robotics",
    icon: "🦾",
    descriptionId: "homepage.features.humanoid.description",
    descriptionDefault:
      "Learn bipedal locomotion, balance control, and dexterous manipulation for building human-like robots.",
    link: "/docs/humanoid",
  },
  {
    titleId: "homepage.features.labs.title",
    titleDefault: "Hands-on Labs",
    icon: "🔬",
    descriptionId: "homepage.features.labs.description",
    descriptionDefault:
      "Practice with step-by-step tutorials covering ROS2 nodes, URDF design, Gazebo simulation, and Isaac Sim basics.",
    link: "/docs/labs/lab01-ros2-hello",
  },
  {
    titleId: "homepage.features.audio.title",
    titleDefault: "Audio Learning",
    icon: "🎧",
    descriptionId: "homepage.features.audio.description",
    descriptionDefault:
      "Listen to podcast episodes that accompany each chapter. Perfect for learning on the go.",
    link: "/podcast",
  },
];

function Feature({
  titleId,
  titleDefault,
  icon,
  descriptionId,
  descriptionDefault,
  link,
}: FeatureItem) {
  return (
    <div className={clsx("col col--4", styles.feature)}>
      <Link to={link} className={styles.featureLink}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>{icon}</div>
          <Heading as="h3" className={styles.featureTitle}>
            <Translate id={titleId}>{titleDefault}</Translate>
          </Heading>
          <p className={styles.featureDescription}>
            <Translate id={descriptionId}>{descriptionDefault}</Translate>
          </p>
        </div>
      </Link>
    </div>
  );
}

function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection(): ReactNode {
  return (
    <section className={styles.stats}>
      <div className="container">
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>6+</div>
            <div className={styles.statLabel}>
              <Translate id="homepage.stats.chapters">Chapters</Translate>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>4</div>
            <div className={styles.statLabel}>
              <Translate id="homepage.stats.labs">Hands-on Labs</Translate>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>6</div>
            <div className={styles.statLabel}>
              <Translate id="homepage.stats.podcasts">
                Podcast Episodes
              </Translate>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>100+</div>
            <div className={styles.statLabel}>
              <Translate id="homepage.stats.codeExamples">
                Code Examples
              </Translate>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type TechItem = {
  nameId: string;
  nameDefault: string;
  descId: string;
  descDefault: string;
};

const technologies: TechItem[] = [
  {
    nameId: "homepage.tech.ros2.name",
    nameDefault: "ROS2",
    descId: "homepage.tech.ros2.desc",
    descDefault: "Robot middleware",
  },
  {
    nameId: "homepage.tech.gazebo.name",
    nameDefault: "Gazebo",
    descId: "homepage.tech.gazebo.desc",
    descDefault: "Open-source simulation",
  },
  {
    nameId: "homepage.tech.isaac.name",
    nameDefault: "Isaac Sim",
    descId: "homepage.tech.isaac.desc",
    descDefault: "NVIDIA simulation",
  },
  {
    nameId: "homepage.tech.pytorch.name",
    nameDefault: "PyTorch",
    descId: "homepage.tech.pytorch.desc",
    descDefault: "Deep learning",
  },
  {
    nameId: "homepage.tech.python.name",
    nameDefault: "Python",
    descId: "homepage.tech.python.desc",
    descDefault: "Primary language",
  },
  {
    nameId: "homepage.tech.urdf.name",
    nameDefault: "URDF",
    descId: "homepage.tech.urdf.desc",
    descDefault: "Robot description",
  },
];

function TechStackSection(): ReactNode {
  return (
    <section className={styles.techStack}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          <Translate id="homepage.techStack.title">
            Technologies Covered
          </Translate>
        </Heading>
        <div className={styles.techGrid}>
          {technologies.map((tech, idx) => (
            <div key={idx} className={styles.techItem}>
              <div className={styles.techName}>
                <Translate id={tech.nameId}>{tech.nameDefault}</Translate>
              </div>
              <div className={styles.techDesc}>
                <Translate id={tech.descId}>{tech.descDefault}</Translate>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection(): ReactNode {
  return (
    <section className={styles.cta}>
      <div className="container">
        <Heading as="h2" className={styles.ctaTitle}>
          <Translate id="homepage.cta.title">
            Ready to Build the Future of Robotics?
          </Translate>
        </Heading>
        <p className={styles.ctaSubtitle}>
          <Translate id="homepage.cta.subtitle">
            Start your journey into Physical AI today with our comprehensive
            textbook and podcast.
          </Translate>
        </p>
        <div className={styles.ctaButtons}>
          <Link
            className={clsx("button button--lg", styles.primaryButton)}
            to="/docs/intro"
          >
            <Translate id="homepage.cta.beginChapter">
              Begin Chapter 1
            </Translate>
          </Link>
          <Link
            className={clsx("button button--lg", styles.outlineButton)}
            to="https://github.com/your-username/physical-ai-textbook"
          >
            <Translate id="homepage.cta.viewGithub">View on GitHub</Translate>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={translate({ id: "homepage.layoutTitle", message: "Home" })}
      description={translate({
        id: "homepage.layoutDescription",
        message:
          "Learn Physical AI and Humanoid Robotics with ROS2, Gazebo, NVIDIA Isaac, and Vision-Language-Action Models",
      })}
    >
      <HomepageHeader />
      <main>
        <StatsSection />
        <HomepageFeatures />
        <TechStackSection />
        <CTASection />
      </main>
    </Layout>
  );
}
