import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

interface PodcastPlayerProps {
  audioUrl?: string;
  title: string;
  episodeNumber: number;
  duration: string;
  showNotes?: string[];
  transcript?: string;
}

export default function PodcastPlayer({
  audioUrl,
  title,
  episodeNumber,
  duration,
  showNotes,
  transcript,
}: PodcastPlayerProps): React.ReactElement {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [hasAudio, setHasAudio] = useState(false);

  // Text-to-Speech state
  const [useTTS, setUseTTS] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [ttsVoices, setTtsVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [ttsProgress, setTtsProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textChunksRef = useRef<string[]>([]);
  const currentChunkRef = useRef(0);
  const isPlayingRef = useRef(false);

  // Detect locale from URL path
  const location = useLocation();
  const isUrdu =
    location.pathname.startsWith("/ur/") || location.pathname.includes("/ur/");
  const targetLang = isUrdu ? "ur" : "en";

  // Resolve audio URL with baseUrl
  const resolvedAudioUrl = useBaseUrl(audioUrl || "");

  // Keep isPlayingRef in sync with isPlaying state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Chrome bug workaround: speechSynthesis pauses after ~15 seconds
  // This keeps the speech synthesis alive by periodically resuming
  useEffect(() => {
    if (!isPlaying || !useTTS) return;

    const intervalId = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(intervalId);
  }, [isPlaying, useTTS]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Check for TTS support and load voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setTtsSupported(true);

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setTtsVoices(voices);

          // Select appropriate voice based on locale
          let preferredVoice: SpeechSynthesisVoice | undefined;

          if (targetLang === "ur") {
            // Try to find Urdu voice
            preferredVoice =
              voices.find((v) => v.lang.startsWith("ur")) ||
              voices.find((v) => v.lang.includes("ur-PK")) ||
              voices.find((v) => v.lang.includes("ur-IN")) ||
              // Fallback to Hindi which can pronounce Urdu reasonably well
              voices.find((v) => v.lang.startsWith("hi")) ||
              voices.find((v) => v.lang.includes("hi-IN")) ||
              // Last resort - use any available voice
              voices[0];
          } else {
            // Prefer English voices
            preferredVoice =
              voices.find(
                (v) => v.lang.startsWith("en") && v.name.includes("Google"),
              ) ||
              voices.find((v) => v.lang.startsWith("en")) ||
              voices[0];
          }

          setSelectedVoice(preferredVoice || voices[0]);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      // If no audio URL, use TTS by default
      if (!audioUrl) {
        setUseTTS(true);
      }
    }
  }, [audioUrl, targetLang]);

  // Prepare text chunks for TTS - improved for Urdu
  useEffect(() => {
    if (transcript) {
      const chunks: string[] = [];

      if (isUrdu) {
        // For Urdu: Split by Urdu full stop (۔), comma, or regular punctuation
        // Also handle cases where there's no punctuation
        const urduText = transcript.trim();

        // Split by Urdu sentence endings and other delimiters
        const parts = urduText.split(/(?<=[۔؟!،,.])\s*/);

        let currentChunk = "";
        parts.forEach((part) => {
          const trimmedPart = part.trim();
          if (!trimmedPart) return;

          if (currentChunk.length + trimmedPart.length > 150) {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
            }
            currentChunk = trimmedPart;
          } else {
            currentChunk = currentChunk
              ? currentChunk + " " + trimmedPart
              : trimmedPart;
          }
        });

        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }

        // If no chunks were created, just use the whole transcript
        if (chunks.length === 0 && urduText) {
          // Split by spaces into reasonable chunks
          const words = urduText.split(/\s+/);
          let chunk = "";
          words.forEach((word) => {
            if (chunk.length + word.length > 100) {
              if (chunk) chunks.push(chunk.trim());
              chunk = word;
            } else {
              chunk = chunk ? chunk + " " + word : word;
            }
          });
          if (chunk) chunks.push(chunk.trim());
        }
      } else {
        // For English: Split by sentences
        const sentences = transcript.match(/[^.!?]+[.!?]+/g) || [transcript];
        let currentChunk = "";

        sentences.forEach((sentence) => {
          if (currentChunk.length + sentence.length > 200) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = sentence;
          } else {
            currentChunk += " " + sentence;
          }
        });
        if (currentChunk) chunks.push(currentChunk.trim());
      }

      textChunksRef.current = chunks.filter((c) => c.length > 0);
    }
  }, [transcript, isUrdu]);

  // Audio file event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setTotalDuration(audio.duration);
      setHasAudio(true);
      setUseTTS(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setHasAudio(false);
      if (ttsSupported) setUseTTS(true);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [audioUrl, ttsSupported]);

  const speakChunk = useCallback(
    (index: number) => {
      if (index >= textChunksRef.current.length) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setTtsProgress(100);
        return;
      }

      const text = textChunksRef.current[index];
      if (!text || text.trim().length === 0) {
        // Skip empty chunks
        currentChunkRef.current = index + 1;
        if (isPlayingRef.current) {
          speakChunk(index + 1);
        }
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = playbackRate;
      utterance.volume = volume;

      // Set language for proper pronunciation
      if (isUrdu) {
        utterance.lang = "ur-PK";
      } else {
        utterance.lang = "en-US";
      }

      utterance.onend = () => {
        currentChunkRef.current = index + 1;
        setTtsProgress(((index + 1) / textChunksRef.current.length) * 100);
        // Use ref to avoid stale closure issue
        if (isPlayingRef.current) {
          // Small delay between chunks for natural flow
          setTimeout(() => {
            speakChunk(index + 1);
          }, 100);
        }
      };

      utterance.onerror = (event) => {
        console.error("TTS Error:", event);
        // Try next chunk on error
        currentChunkRef.current = index + 1;
        if (isPlayingRef.current && index + 1 < textChunksRef.current.length) {
          speakChunk(index + 1);
        } else {
          setIsPlaying(false);
          isPlayingRef.current = false;
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, playbackRate, volume, isUrdu],
  );

  const togglePlay = () => {
    if (useTTS && ttsSupported) {
      // TTS playback
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        isPlayingRef.current = false;
      } else {
        setIsPlaying(true);
        isPlayingRef.current = true;
        speakChunk(currentChunkRef.current);
      }
    } else {
      // Audio file playback
      const audio = audioRef.current;
      if (!audio || !hasAudio) return;

      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(() => setHasAudio(false));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (useTTS) {
      const progress = parseFloat(e.target.value);
      const chunkIndex = Math.floor(
        (progress / 100) * textChunksRef.current.length,
      );
      currentChunkRef.current = chunkIndex;
      setTtsProgress(progress);

      if (isPlaying) {
        window.speechSynthesis.cancel();
        speakChunk(chunkIndex);
      }
    } else {
      const audio = audioRef.current;
      if (!audio || !hasAudio) return;

      const newTime = parseFloat(e.target.value);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);

    if (useTTS && isPlaying) {
      window.speechSynthesis.cancel();
      speakChunk(currentChunkRef.current);
    } else {
      const audio = audioRef.current;
      if (audio && hasAudio) {
        audio.playbackRate = speed;
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (!useTTS) {
      const audio = audioRef.current;
      if (audio && hasAudio) {
        audio.volume = newVolume;
      }
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voice = ttsVoices.find((v) => v.name === e.target.value);
    if (voice) {
      setSelectedVoice(voice);
      if (isPlaying) {
        window.speechSynthesis.cancel();
        speakChunk(currentChunkRef.current);
      }
    }
  };

  const restartPlayback = () => {
    if (useTTS) {
      window.speechSynthesis.cancel();
      currentChunkRef.current = 0;
      setTtsProgress(0);
      setIsPlaying(true);
      isPlayingRef.current = true;
      speakChunk(0);
    } else {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const canPlay = (useTTS && ttsSupported && transcript) || hasAudio;

  // Localized labels
  const labels = isUrdu
    ? {
        ttsMode: "🔊 ٹیکسٹ ٹو اسپیچ موڈ",
        restart: "دوبارہ شروع کریں",
        play: "چلائیں",
        pause: "روکیں",
        speed: "رفتار:",
        showNotes: "شو نوٹس",
        noAudio:
          "آڈیو دستیاب نہیں۔ آپ کا براؤزر ٹیکسٹ ٹو اسپیچ کو سپورٹ نہیں کرتا۔",
        noTranscript: "ٹرانسکرپٹ دستیاب نہیں۔ براہ کرم نیچے ٹرانسکرپٹ پڑھیں۔",
      }
    : {
        ttsMode: "🔊 Text-to-Speech Mode",
        restart: "Restart",
        play: "Play",
        pause: "Pause",
        speed: "Speed:",
        showNotes: "Show Notes",
        noAudio:
          "Audio not available. Your browser doesn't support Text-to-Speech.",
        noTranscript:
          "No transcript available. Please read the transcript below.",
      };

  return (
    <div className={styles.podcastPlayer}>
      {audioUrl && (
        <audio ref={audioRef} src={resolvedAudioUrl} preload="metadata" />
      )}

      <div className={styles.header}>
        <div className={styles.episodeBadge}>{episodeNumber}</div>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.duration}>{duration}</span>
        </div>
      </div>

      {/* TTS Mode Indicator */}
      {useTTS && ttsSupported && (
        <div className={styles.ttsIndicator}>
          {labels.ttsMode}
          {ttsVoices.length > 1 && (
            <select
              value={selectedVoice?.name || ""}
              onChange={handleVoiceChange}
              className={styles.voiceSelect}
            >
              {ttsVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className={styles.controls}>
        <button
          className={styles.restartButton}
          onClick={restartPlayback}
          aria-label={labels.restart}
          disabled={!canPlay}
          title={labels.restart}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
        </button>

        <button
          className={styles.playButton}
          onClick={togglePlay}
          aria-label={isPlaying ? labels.pause : labels.play}
          disabled={!canPlay}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className={styles.progressSection}>
          {useTTS ? (
            <>
              <span className={styles.time}>{Math.round(ttsProgress)}%</span>
              <input
                type="range"
                className={styles.progressBar}
                min="0"
                max="100"
                value={ttsProgress}
                onChange={handleSeek}
                disabled={!canPlay}
              />
              <span className={styles.time}>100%</span>
            </>
          ) : (
            <>
              <span className={styles.time}>{formatTime(currentTime)}</span>
              <input
                type="range"
                className={styles.progressBar}
                min="0"
                max={totalDuration || 100}
                value={currentTime}
                onChange={handleSeek}
                disabled={!canPlay}
              />
              <span className={styles.time}>{formatTime(totalDuration)}</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.secondaryControls}>
        <div className={styles.speedControls}>
          <span className={styles.label}>{labels.speed}</span>
          {speedOptions.map((speed) => (
            <button
              key={speed}
              className={`${styles.speedButton} ${playbackRate === speed ? styles.active : ""}`}
              onClick={() => handleSpeedChange(speed)}
              disabled={!canPlay}
            >
              {speed}x
            </button>
          ))}
        </div>

        <div className={styles.volumeControl}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            type="range"
            className={styles.volumeSlider}
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            disabled={!canPlay}
          />
        </div>
      </div>

      {!canPlay && !ttsSupported && (
        <div className={styles.placeholder}>
          <p>{labels.noAudio}</p>
        </div>
      )}

      {useTTS && ttsSupported && !transcript && (
        <div className={styles.placeholder}>
          <p>{labels.noTranscript}</p>
        </div>
      )}

      {showNotes && showNotes.length > 0 && (
        <details className={styles.showNotes}>
          <summary>{labels.showNotes}</summary>
          <ul>
            {showNotes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
