import React, { useState, useRef, useEffect } from "react";
import { useHistory } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Translate from "@docusaurus/Translate";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./styles.module.css";

export default function UserMenu(): React.ReactElement {
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const loginUrl = useBaseUrl("/auth/login");

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
      history.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    history.push("/profile");
  };

  // Show loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingDot}></div>
      </div>
    );
  }

  // Show sign in button if not authenticated
  if (!user) {
    return (
      <div className={styles.container}>
        <a href={loginUrl} className={styles.signInButton}>
          <Translate id="navbar.signIn">Sign In</Translate>
        </a>
      </div>
    );
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string | null): string => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={styles.container} ref={menuRef}>
      <button
        className={styles.avatarButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={
              user.user_metadata?.display_name ||
              user.user_metadata?.full_name ||
              "User"
            }
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarFallback}>
            {getInitials(
              user.user_metadata?.display_name ||
                user.user_metadata?.full_name ||
                user.email,
            )}
          </div>
        )}
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          viewBox="0 0 24 24"
          width="16"
          height="16"
        >
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user.user_metadata?.display_name ||
                user.user_metadata?.full_name ||
                "User"}
            </span>
            <span className={styles.userEmail}>{user.email}</span>
          </div>

          <div className={styles.divider}></div>

          <button className={styles.menuItem} onClick={handleProfileClick}>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              className={styles.menuIcon}
            >
              <path
                fill="currentColor"
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
            <Translate id="navbar.profile">Profile</Translate>
          </button>

          <button className={styles.menuItem} onClick={handleSignOut}>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              className={styles.menuIcon}
            >
              <path
                fill="currentColor"
                d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
              />
            </svg>
            <Translate id="navbar.signOut">Sign Out</Translate>
          </button>
        </div>
      )}
    </div>
  );
}
