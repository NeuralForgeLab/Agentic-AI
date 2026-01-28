import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import Translate, { translate } from "@docusaurus/Translate";

import styles from "./404.module.css";

type QuickLink = {
  titleId: string;
  titleDefault: string;
  descId: string;
  descDefault: string;
  to: string;
  icon: string;
};

const quickLinks: QuickLink[] = [
  {
    titleId: "notFound.links.home.title",
    titleDefault: "Home",
    descId: "notFound.links.home.desc",
    descDefault: "Return to the homepage",
    to: "/",
    icon: "🏠",
  },
  {
    titleId: "notFound.links.intro.title",
    titleDefault: "Introduction",
    descId: "notFound.links.intro.desc",
    descDefault: "Start learning Physical AI",
    to: "/docs/intro",
    icon: "📖",
  },
  {
    titleId: "notFound.links.ros2.title",
    titleDefault: "ROS2 Fundamentals",
    descId: "notFound.links.ros2.desc",
    descDefault: "Learn robot middleware",
    to: "/docs/ros2",
    icon: "🤖",
  },
  {
    titleId: "notFound.links.labs.title",
    titleDefault: "Hands-on Labs",
    descId: "notFound.links.labs.desc",
    descDefault: "Practice with tutorials",
    to: "/docs/labs/lab01-ros2-hello",
    icon: "🔬",
  },
  {
    titleId: "notFound.links.podcast.title",
    titleDefault: "Podcast",
    descId: "notFound.links.podcast.desc",
    descDefault: "Listen to audio episodes",
    to: "/podcast",
    icon: "🎧",
  },
  {
    titleId: "notFound.links.resources.title",
    titleDefault: "Resources",
    descId: "notFound.links.resources.desc",
    descDefault: "External references",
    to: "/docs/resources",
    icon: "📚",
  },
];

function QuickLinkCard({ titleId, titleDefault, descId, descDefault, to, icon }: QuickLink) {
  return (
    <Link to={to} className={styles.quickLinkCard}>
      <span className={styles.quickLinkIcon}>{icon}</span>
      <div className={styles.quickLinkContent}>
        <span className={styles.quickLinkTitle}>
          <Translate id={titleId}>{titleDefault}</Translate>
        </span>
        <span className={styles.quickLinkDesc}>
          <Translate id={descId}>{descDefault}</Translate>
        </span>
      </div>
    </Link>
  );
}

export default function NotFound(): ReactNode {
  return (
    <Layout
      title={translate({ id: "notFound.layoutTitle", message: "Page Not Found" })}
      description={translate({
        id: "notFound.layoutDescription",
        message: "The page you are looking for could not be found",
      })}
    >
      <main className={styles.notFoundContainer}>
        <div className="container">
          <div className={styles.errorSection}>
            <div className={styles.errorCode}>404</div>
            <Heading as="h1" className={styles.errorTitle}>
              <Translate id="notFound.title">Page Not Found</Translate>
            </Heading>
            <p className={styles.errorDescription}>
              <Translate id="notFound.description">
                Oops! The page you're looking for seems to have wandered off like an untrained robot.
                Let's get you back on track.
              </Translate>
            </p>
          </div>

          <div className={styles.quickLinksSection}>
            <Heading as="h2" className={styles.quickLinksTitle}>
              <Translate id="notFound.quickLinks.title">Quick Navigation</Translate>
            </Heading>
            <div className={styles.quickLinksGrid}>
              {quickLinks.map((link, idx) => (
                <QuickLinkCard key={idx} {...link} />
              ))}
            </div>
          </div>

          <div className={styles.searchSection}>
            <p className={styles.searchText}>
              <Translate id="notFound.searchText">
                Looking for something specific? Try using the search bar in the navigation.
              </Translate>
            </p>
            <Link className={clsx("button button--primary button--lg", styles.homeButton)} to="/">
              <Translate id="notFound.goHome">Go to Homepage</Translate>
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
