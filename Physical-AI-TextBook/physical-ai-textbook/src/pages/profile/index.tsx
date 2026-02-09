import React, { useEffect, useState } from "react";
import Layout from "@theme/Layout";
import { useHistory } from "@docusaurus/router";
import Translate from "@docusaurus/Translate";
import { useAuth } from "../../contexts/AuthContext";
import {
  getUserProfile,
  UserProfile,
  CHAPTERS,
  getCompletionPercentage,
  markChapterCompleted,
  markChapterIncomplete,
  removeBookmark,
} from "../../services/userService";
import styles from "./styles.module.css";

export default function ProfilePage(): React.ReactElement {
  const { user, signOut } = useAuth();
  const history = useHistory();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"progress" | "bookmarks">("progress");

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    history.push("/");
  };

  const handleToggleChapter = async (chapterId: string, isCompleted: boolean) => {
    if (!user || !profile) return;

    try {
      if (isCompleted) {
        await markChapterIncomplete(user.uid, chapterId);
        setProfile({
          ...profile,
          completedChapters: profile.completedChapters.filter(
            (c) => c.chapterId !== chapterId
          ),
        });
      } else {
        await markChapterCompleted(user.uid, chapterId, 0);
        setProfile({
          ...profile,
          completedChapters: [
            ...profile.completedChapters,
            { chapterId, completedAt: { seconds: Date.now() / 1000 } as any, timeSpentMinutes: 0 },
          ],
        });
      }
    } catch (err) {
      console.error("Error toggling chapter:", err);
    }
  };

  const handleRemoveBookmark = async (docId: string) => {
    if (!user || !profile) return;

    try {
      await removeBookmark(user.uid, docId);
      setProfile({
        ...profile,
        bookmarks: profile.bookmarks.filter((b) => b.docId !== docId),
      });
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  };

  const completedChapterIds = profile?.completedChapters.map((c) => c.chapterId) || [];
  const completionPercentage = getCompletionPercentage(
    profile?.completedChapters || [],
    CHAPTERS.length
  );

  if (loading) {
    return (
      <Layout title="Profile">
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile">
      <div className={styles.profileContainer}>
        <div className={styles.profileCard}>
          {/* User Info Section */}
          <div className={styles.userSection}>
            <div className={styles.avatarLarge}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "User"} />
              ) : (
                <div className={styles.avatarFallback}>
                  {user?.displayName?.substring(0, 2).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className={styles.userDetails}>
              <h1 className={styles.userName}>{user?.displayName || "User"}</h1>
              <p className={styles.userEmail}>{user?.email}</p>
              <button className={styles.signOutButton} onClick={handleSignOut}>
                <Translate id="profile.signOut">Sign Out</Translate>
              </button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className={styles.progressOverview}>
            <h2 className={styles.sectionTitle}>
              <Translate id="profile.learningProgress">Learning Progress</Translate>
            </h2>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className={styles.progressStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{completedChapterIds.length}</span>
                <span className={styles.statLabel}>
                  <Translate id="profile.chaptersCompleted">Completed</Translate>
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  {CHAPTERS.length - completedChapterIds.length}
                </span>
                <span className={styles.statLabel}>
                  <Translate id="profile.chaptersRemaining">Remaining</Translate>
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{completionPercentage}%</span>
                <span className={styles.statLabel}>
                  <Translate id="profile.complete">Complete</Translate>
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "progress" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("progress")}
            >
              <Translate id="profile.tabChapters">Chapters</Translate>
            </button>
            <button
              className={`${styles.tab} ${activeTab === "bookmarks" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("bookmarks")}
            >
              <Translate id="profile.tabBookmarks">Bookmarks</Translate>
              {profile?.bookmarks && profile.bookmarks.length > 0 && (
                <span className={styles.badge}>{profile.bookmarks.length}</span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === "progress" && (
              <div className={styles.chapterList}>
                {CHAPTERS.map((chapter) => {
                  const isCompleted = completedChapterIds.includes(chapter.id);
                  return (
                    <div
                      key={chapter.id}
                      className={`${styles.chapterItem} ${isCompleted ? styles.chapterCompleted : ""}`}
                    >
                      <button
                        className={styles.checkbox}
                        onClick={() => handleToggleChapter(chapter.id, isCompleted)}
                        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                      >
                        {isCompleted && (
                          <svg viewBox="0 0 24 24" width="16" height="16">
                            <path
                              fill="currentColor"
                              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                            />
                          </svg>
                        )}
                      </button>
                      <a href={`/docs/${chapter.id}`} className={styles.chapterLink}>
                        <span className={styles.chapterTitle}>{chapter.title}</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "bookmarks" && (
              <div className={styles.bookmarkList}>
                {profile?.bookmarks && profile.bookmarks.length > 0 ? (
                  profile.bookmarks.map((bookmark) => (
                    <div key={bookmark.docId} className={styles.bookmarkItem}>
                      <a href={bookmark.url} className={styles.bookmarkLink}>
                        <svg viewBox="0 0 24 24" width="18" height="18" className={styles.bookmarkIcon}>
                          <path
                            fill="currentColor"
                            d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
                          />
                        </svg>
                        <span>{bookmark.title}</span>
                      </a>
                      <button
                        className={styles.removeButton}
                        onClick={() => handleRemoveBookmark(bookmark.docId)}
                        aria-label="Remove bookmark"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path
                            fill="currentColor"
                            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                          />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <svg viewBox="0 0 24 24" width="48" height="48" className={styles.emptyIcon}>
                      <path
                        fill="currentColor"
                        d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"
                      />
                    </svg>
                    <p>
                      <Translate id="profile.noBookmarks">No bookmarks yet</Translate>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
