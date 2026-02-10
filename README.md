# 📚 BookScout – Smart Book Recommendation Web App

BookScout is a swipe-based book recommendation web application inspired by Tinder-style interactions.  
Users can **like or dislike books**, explore book details with real cover images, and view their liked books in a visually rich and magical interface.

This project focuses on building a **complete frontend–backend system** and is designed to be **machine-learning ready** for future upgrades.

---

## 🚀 Features

- 📖 Swipe-based book browsing (Like / Dislike)
- ✨ Animated book cards with flip & sparkle effects
- 🖼 Real book cover images using Google Books API
- ❤️ Liked books list panel
- 📊 Backend summary (total likes & dislikes)
- 🎨 Modern and magical UI
- 🔌 REST API-based frontend–backend communication
- 🧠 ML-ready architecture for future enhancements

---

## 🛠 Tech Stack

### Frontend
- React.js
- Vite
- JavaScript (JSX)
- CSS (Animations & Responsive Design)

### Backend
- Node.js
- Express.js
- JSON-based data storage

### External API
- Google Books API (for book cover images)

---

## 📂 Project Structure

```text
bookscout-simplified/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx
│   │   │   ├── BookCard.jsx
│   │   │   └── SwipeCard.jsx
│   │   ├── data/
│   │   │   └── books.json
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── server.js
│   ├── fetch_covers.js
│   ├── choices.json
│   └── package.json
│
└── README.md
