import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

interface ChapterPodcastLinkProps {
  episodeUrl: string;
  episodeNumber: number;
  duration: string;
}

export default function ChapterPodcastLink({
  episodeUrl,
  episodeNumber,
  duration,
}: ChapterPodcastLinkProps): React.ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z" />
          </svg>
        </div>
        <div className={styles.content}>
          <span className={styles.label}>Prefer audio?</span>
          <span className={styles.title}>
            Listen to Episode {episodeNumber}
          </span>
          <span className={styles.duration}>{duration} listen</span>
        </div>
        <Link to={episodeUrl} className={styles.button}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          Listen Now
        </Link>
      </div>
    </div>
  );
}
