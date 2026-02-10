// backend/fetch_covers.js
// One-shot script to fill missing `image` fields in frontend/src/data/books.json
// Usage:
//   - Optionally set GOOGLE_BOOKS_API_KEY in env to increase quota
//   - Run: node backend/fetch_covers.js

import fs from "fs";
import path from "path";

// Node 18+ has global fetch. If your Node is older, install node-fetch and import it.
// This script assumes Node 18+ / 20+ where `fetch` is available.

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY || ""; // optional
const MAX_RESULTS = 5; // how many results to fetch per query
const PAUSE_MS = 300; // small delay between requests to be polite

const dataPath = path.join(process.cwd(), "..", "frontend", "src", "data", "books.json");
const backupPath = dataPath + ".bak";

if (!fs.existsSync(dataPath)) {
  console.error("Could not find books.json at:", dataPath);
  process.exit(1);
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchCoverForBook(title, author) {
  const qParts = [];
  if (title) qParts.push(`intitle:${title}`);
  if (author) qParts.push(`inauthor:${author}`);
  const q = encodeURIComponent(qParts.join("+"));
  const keyPart = API_KEY ? `&key=${encodeURIComponent(API_KEY)}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=${MAX_RESULTS}${keyPart}`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      console.warn("Google Books API returned", res.status, "for", title, "-", author);
      return null;
    }
    const json = await res.json();
    if (!json.items || json.items.length === 0) return null;

    // pick the first item with an image
    for (const item of json.items) {
      const info = item.volumeInfo || {};
      const links = info.imageLinks || {};
      const thumb = links.thumbnail || links.smallThumbnail || links.medium || links.small;
      if (thumb) {
        // ensure https
        return thumb.startsWith("http://") ? thumb.replace("http://", "https://") : thumb;
      }
    }
    return null;
  } catch (e) {
    console.warn("Fetch error for", title, "-", author, e.message || e);
    return null;
  }
}

async function main() {
  try {
    const raw = fs.readFileSync(dataPath, "utf8");
    const books = JSON.parse(raw);

    // backup first
    fs.writeFileSync(backupPath, JSON.stringify(books, null, 2), "utf8");
    console.log("Backup written to", backupPath);

    let updated = 0;
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      // skip if image exists and looks valid
      if (book.image && typeof book.image === "string" && book.image.trim() !== "") {
        console.log(`${i+1}/${books.length} SKIP (has image): ${book.title}`);
        continue;
      }

      console.log(`${i+1}/${books.length} Searching cover for: "${book.title}" — ${book.author || "unknown author"}`);
      const cover = await fetchCoverForBook(book.title || "", book.author || "");
      if (cover) {
        book.image = cover;
        updated++;
        console.log("  ✓ Found cover:", cover);
      } else {
        console.log("  ✗ No cover found for this book.");
      }

      // pause between requests
      await sleep(PAUSE_MS);
    }

    // write back the updated file
    fs.writeFileSync(dataPath, JSON.stringify(books, null, 2), "utf8");
    console.log(`Done. Updated ${updated} books. Wrote file to ${dataPath}`);
    console.log("If you want to revert, restore the backup:", backupPath);
  } catch (err) {
    console.error("Script failed:", err);
    process.exit(1);
  }
}

main();
