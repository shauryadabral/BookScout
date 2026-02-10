// frontend/src/services/googleBooks.js
// Minimal Google Books helper. Does not require an API key but you can include one.
// Usage: const books = await searchBooks("harry potter", 10, API_KEY);

async function searchBooks(query, maxResults = 10, apiKey = "") {
  if (!query || query.trim() === "") return [];

  const q = encodeURIComponent(query.trim());
  // include key if provided
  const keyPart = apiKey ? `&key=${encodeURIComponent(apiKey)}` : "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=${maxResults}${keyPart}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("Google Books API returned non-OK status", res.status);
      return [];
    }
    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) return [];

    // map to our internal book shape
    const mapped = data.items.map((item) => {
      const info = item.volumeInfo || {};
      const authors = info.authors || [];
      const title = info.title || "Unknown Title";
      const author = authors.length > 0 ? authors[0] : "Unknown Author";
      const genre = (info.categories && info.categories[0]) || "General";
      const description = info.description || info.subtitle || "No description available.";
      // approximate rating if available
      const rating = info.averageRating ? Number(info.averageRating) : 4.0;
      // pick a thumbnail if available
      const image =
        (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)) ||
        "https://via.placeholder.com/128x192?text=No+Cover";

      // create a stable id: googleId prefixed to avoid collision with local ids
      const id = `gb_${item.id}`;

      return {
        id,
        title,
        author,
        genre,
        rating,
        description,
        image,
        // keep the raw volume info in case you want it later
        _raw: info
      };
    });

    return mapped;
  } catch (e) {
    console.error("Failed to fetch from Google Books:", e);
    return [];
  }
}

export { searchBooks };
