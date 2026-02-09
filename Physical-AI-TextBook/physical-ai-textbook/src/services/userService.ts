import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "../lib/firebase";

// Types
export interface CompletedChapter {
  chapterId: string;
  completedAt: Timestamp;
  timeSpentMinutes: number;
}

export interface Bookmark {
  docId: string;
  title: string;
  url: string;
  createdAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  preferredLocale: "en" | "ur";
  completedChapters: CompletedChapter[];
  bookmarks: Bookmark[];
  currentChapter: string | null;
  totalTimeSpentMinutes: number;
}

// Create or update user profile on sign in
export async function createOrUpdateUserProfile(user: User): Promise<void> {
  if (!db) {
    console.warn("Firestore not initialized");
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    // Update last login time
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      displayName: user.displayName,
      photoURL: user.photoURL,
    });
  } else {
    // Create new user profile
    const newProfile: Omit<UserProfile, "createdAt" | "lastLoginAt"> & {
      createdAt: ReturnType<typeof serverTimestamp>;
      lastLoginAt: ReturnType<typeof serverTimestamp>;
    } = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      preferredLocale: "en",
      completedChapters: [],
      bookmarks: [],
      currentChapter: null,
      totalTimeSpentMinutes: 0,
    };
    await setDoc(userRef, newProfile);
  }
}

// Get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) {
    console.warn("Firestore not initialized");
    return null;
  }

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
}

// Mark chapter as completed
export async function markChapterCompleted(
  uid: string,
  chapterId: string,
  timeSpentMinutes: number = 0
): Promise<void> {
  if (!db) {
    console.warn("Firestore not initialized");
    return;
  }

  const userRef = doc(db, "users", uid);
  const completedChapter: CompletedChapter = {
    chapterId,
    completedAt: Timestamp.now(),
    timeSpentMinutes,
  };

  await updateDoc(userRef, {
    completedChapters: arrayUnion(completedChapter),
    totalTimeSpentMinutes: timeSpentMinutes,
  });
}

// Mark chapter as incomplete (remove from completed)
export async function markChapterIncomplete(
  uid: string,
  chapterId: string
): Promise<void> {
  if (!db) {
    console.warn("Firestore not initialized");
    return;
  }

  // First get the current profile to find the chapter to remove
  const profile = await getUserProfile(uid);
  if (!profile) return;

  const chapterToRemove = profile.completedChapters.find(
    (c) => c.chapterId === chapterId
  );
  if (!chapterToRemove) return;

  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    completedChapters: arrayRemove(chapterToRemove),
  });
}

// Add bookmark
export async function addBookmark(
  uid: string,
  docId: string,
  title: string,
  url: string
): Promise<void> {
  if (!db) {
    console.warn("Firestore not initialized");
    return;
  }

  const userRef = doc(db, "users", uid);
  const bookmark: Bookmark = {
    docId,
    title,
    url,
    createdAt: Timestamp.now(),
  };

  await updateDoc(userRef, {
    bookmarks: arrayUnion(bookmark),
  });
}

// Remove bookmark
export async function removeBookmark(uid: string, docId: string): Promise<void> {
  if (!db) {
    console.warn("Firestore not initialized");
    return;
  }

  // First get the current profile to find the bookmark to remove
  const profile = await getUserProfile(uid);
  if (!profile) return;

  const bookmarkToRemove = profile.bookmarks.find((b) => b.docId === docId);
  if (!bookmarkToRemove) return;

  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    bookmarks: arrayRemove(bookmarkToRemove),
  });
}

// Update current chapter (for tracking reading progress)
export async function updateCurrentChapter(
  uid: string,
  chapterId: string
): Promise<void> {
  if (!db) {
    console.warn("Firestore not initialized");
    return;
  }

  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    currentChapter: chapterId,
  });
}

// Update preferred locale
export async function updatePreferredLocale(
  uid: string,
  locale: "en" | "ur"
): Promise<void> {
  if (!db) {
    console.warn("Firestore not initialized");
    return;
  }

  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    preferredLocale: locale,
  });
}

// Get completion percentage
export function getCompletionPercentage(
  completedChapters: CompletedChapter[],
  totalChapters: number
): number {
  if (totalChapters === 0) return 0;
  return Math.round((completedChapters.length / totalChapters) * 100);
}

// Chapter list for the textbook
export const CHAPTERS = [
  { id: "intro", title: "Introduction to Physical AI", titleUr: "فزیکل AI کا تعارف" },
  { id: "ros2", title: "ROS2 Fundamentals", titleUr: "ROS2 بنیادی باتیں" },
  { id: "simulation", title: "Robot Simulation", titleUr: "روبوٹ سمولیشن" },
  { id: "isaac-sim", title: "NVIDIA Isaac Sim", titleUr: "NVIDIA Isaac Sim" },
  { id: "vla-models", title: "VLA Models", titleUr: "VLA ماڈلز" },
  { id: "humanoid", title: "Humanoid Robotics", titleUr: "ہیومنائیڈ روبوٹکس" },
];
