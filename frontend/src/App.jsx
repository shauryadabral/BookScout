// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import "./App.css";
import Starfield from "./components/Starfield";
import SwipeCard from "./components/SwipeCard";
import initialBooks from "./data/books.json";
import { searchBooks } from "./services/googleBooks";

const STORAGE_KEY = "bookscout_simplified_state_v1";
const BACKEND_URL = "http://localhost:4000"; // adjust if your backend uses another host/port

// Local path to your uploaded PPT (for reference). Not used by the app logic,
// but handy if you want to show or link to the file from documentation.
const PPT_PATH = "/mnt/data/Synopsis ppt[1][1].pptx"; // <--- local file you uploaded

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load stored state:", e);
    return null;
  }
}
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save state:", e);
  }
}

// recency decay constants (7 days half-life as example)
const DECAY = Math.log(2) / (7 * 24 * 3600 * 1000);
function recencyWeight(timestamp) {
  const age = Date.now() - (timestamp || Date.now());
  return Math.exp(-DECAY * age);
}

function computeScoreWithRecency(book, likedEntries) {
  let score = 0;
  for (const entry of likedEntries) {
    if (entry.action !== "like") continue;
    const w = recencyWeight(entry.timestamp);
    if (entry.book.author === book.author) score += 3 * w;
    if (entry.book.genre === book.genre) score += 2 * w;
  }
  score += Math.random() * 0.05; // small variety factor
  return score;
}

export default function App() {
  const stored = loadState();

  // make allBooks stateful so we can add Google Books results
  const [allBooks, setAllBooks] = useState(initialBooks);
  const [liked, setLiked] = useState(stored?.liked ?? []);
  const [disliked, setDisliked] = useState(stored?.disliked ?? []);

  // queue is the remaining books (ordered by recommender)
  const [queue, setQueue] = useState(() => {
    const removedIds = new Set([...(stored?.liked ?? []).map(e => e.book?.id ?? e.id), ...(stored?.disliked ?? []).map(e => e.book?.id ?? e.id)]);
    return initialBooks.filter(b => !removedIds.has(b.id));
  });

  const [idx, setIdx] = useState(0);

  // Google Books search UI state
  const [query, setQuery] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  // Backend logging helper (non-blocking)
  const postChoiceToBackend = async (book, action) => {
    try {
      await fetch(`${BACKEND_URL}/api/choice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book, action, timestamp: Date.now() })
      });
    } catch (e) {
      console.warn("Failed to post to backend:", e);
    }
  };

  // Recompute queue when liked/disliked/allBooks change
  useEffect(() => {
    saveState({ liked, disliked });

    const removedIds = new Set([...liked.map(e => e.book?.id ?? e.id), ...disliked.map(e => e.book?.id ?? e.id)]);
    const remaining = allBooks.filter(b => !removedIds.has(b.id));

    if (liked.length > 0) {
      const scored = remaining.map(b => ({ ...b, score: computeScoreWithRecency(b, liked) }));
      scored.sort((a, b) => b.score - a.score);
      setQueue(scored.map(({ score, ...rest }) => rest));
    } else {
      setQueue(remaining);
    }

    setIdx(0);
  }, [liked, disliked, allBooks]);

  // ensure idx is valid if queue shrinks
  useEffect(() => {
    if (idx >= queue.length && queue.length > 0) setIdx(queue.length - 1);
  }, [queue, idx]);

  // handle a like/dislike action coming from swipe or buttons
  const handleSwipe = (action) => {
    const current = queue[idx];
    if (!current) {
      alert("No more books!");
      return;
    }
    const entry = { book: current, action, timestamp: Date.now() };

    if (action === "like") setLiked(prev => [...prev, entry]);
    else setDisliked(prev => [...prev, entry]);

    postChoiceToBackend(current, action);
  };

  const handleSkip = () => {
    if (idx + 1 < queue.length) setIdx(idx + 1);
    else alert("No more books to skip to.");
  };

  const handleReset = () => {
    if (!window.confirm("Reset choices and dataset to initial state?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setLiked([]);
    setDisliked([]);
    setAllBooks(initialBooks);
    setQueue(initialBooks);
    setIdx(0);
  };

  // Google Books integration: fetch and merge results
  const handleFetchFromGoogle = async () => {
    if (!query || query.trim() === "") return alert("Type a search query first (e.g., 'harry potter').");
    setIsFetching(true);
    const results = await searchBooks(query, 15, apiKey);
    setIsFetching(false);
    if (!results || results.length === 0) return alert("No results found.");

    const existingIds = new Set(allBooks.map(b => b.id));
    const newOnes = results.filter(r => !existingIds.has(r.id));

    if (newOnes.length === 0) {
      alert("Fetched books already exist in dataset (no new items).");
      return;
    }

    setAllBooks(prev => {
      const merged = [...prev, ...newOnes];
      return merged;
    });

    alert(`Fetched ${results.length} items — added ${newOnes.length} new ones to dataset.`);
    // queue will recompute automatically by useEffect
  };

  const currentBook = queue[idx];

  // helper to open backend summary (quick debug)
  const showBackendSummary = async () => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/summary`);
      const j = await r.json();
      alert(JSON.stringify(j, null, 2));
    } catch (e) {
      alert("Failed to fetch summary from backend (is it running?).");
    }
  };

  return (
    <div className="app-shell">
      <Starfield />

      <div className="panel">
        <div className="header">
          <div className="title">
            <h1>BookScout</h1>
            <p>Discover books that feel like magic ✨</p>
            
          </div>

          <div className="search-area" role="search">
            <input
              aria-label="Search query"
              type="text"
              placeholder="Search Google Books (e.g. 'tolkien')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <input
              aria-label="API key (optional)"
              type="text"
              placeholder="(optional) Google API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button onClick={handleFetchFromGoogle} aria-busy={isFetching}>
              {isFetching ? "Fetching..." : "Fetch"}
            </button>
          </div>
        </div>

        <div className="left">
          <div style={{ position: "relative" }}>
            <SwipeCard
              book={currentBook}
              onSwipeRight={() => handleSwipe("like")}
              onSwipeLeft={() => handleSwipe("dislike")}
            />
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
            <button onClick={handleSkip} style={{ padding: "6px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.03)", color: "#e8eef8" }}>
              Skip ➡️
            </button>

            <button onClick={() => handleSwipe("dislike")} style={{ padding: "6px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)", color: "#ffcfcf" }}>
              Dislike 👎
            </button>

            <button onClick={() => handleSwipe("like")} style={{ padding: "6px 12px", borderRadius: 10, background: "linear-gradient(90deg,#9d7cff,#7ee7c9)", border: "none", color: "#041019", fontWeight: 700 }}>
              Like 👍
            </button>
          </div>
        </div>

        <div className="right">
          <div className="badge">Remaining: {queue.length - idx > 0 ? queue.length - idx : 0}</div>
          <div className="badge">Liked: {liked.length}</div>

          <div style={{ width: "100%" }}>
            <h4 style={{ margin: "8px 0 6px" }}>Your liked books</h4>
            <div className="liked-grid">
              {liked.map((e, i) => (
                <div className="liked-item" key={i}>
                  <div style={{ fontWeight: 700 }}>{e.book.title}</div>
                  <div style={{ fontSize: 12, color: "#9fcfca" }}>{e.book.author}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>{new Date(e.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ width: "100%", marginTop: 12 }}>
            <button onClick={handleReset} style={{ width: "100%", padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.03)", color: "#e8eef8" }}>
              Reset choices
            </button>

            <button onClick={showBackendSummary} style={{ marginTop: 8, width: "100%", padding: "8px 10px", borderRadius: 10, background: "linear-gradient(90deg,var(--accent2),var(--accent1))", border: "none", color: "#041019", fontWeight: 700 }}>
              Backend: Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
