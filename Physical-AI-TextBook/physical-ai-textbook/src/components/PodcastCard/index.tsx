import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

interface PodcastCardProps {
  episodeNumber: number;
  title: string;
  description: string;
  duration: string;
  url: string;
  chapterUrl?: string;
}

export default function PodcastCard({
  episodeNumber,
  title,
  description,
  duration,
  url,
  chapterUrl,
}: PodcastCardProps): React.ReactElement {
  return (
    <div className={styles.podcastCard}>
      <div className={styles.thumbnail}>
        <span className={styles.episodeNumber}>{episodeNumber}</span>
      </div>
      <div className={styles.content}>
        <Link to={url} className={styles.titleLink}>
          <h3 className={styles.title}>{title}</h3>
        </Link>
        <p className={styles.description}>{description}</p>
        <div className={styles.meta}>
          <span className={styles.duration}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            {duration}
          </span>
          {chapterUrl && (
            <Link to={chapterUrl} className={styles.chapterLink}>
              View Chapter
            </Link>
          )}
        </div>
      </div>
      <Link to={url} className={styles.playButton} aria-label="Play episode">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </Link>
    </div>
  );
}
