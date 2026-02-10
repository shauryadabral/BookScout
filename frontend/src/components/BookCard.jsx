// frontend/src/components/BookCard.jsx
import React from "react";

function BookCard({ book, onSwipeRight, onSwipeLeft, showButtons = true }) {
  if (!book) {
    return (
      <div style={{ color: "#cfeff0", textAlign: "center", padding: 24 }}>
        <h3 style={{ margin: 0 }}>No more books!</h3>
        <p style={{ marginTop: 8, opacity: 0.85 }}>Come back later for more magical finds ✨</p>
      </div>
    );
  }

  const Placeholder = () => (
    <div
      style={{
        width: "100%",
        height: 420, /* lowered from 460 */
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.95)",
        fontSize: 28,
        fontWeight: 700,
        letterSpacing: 1,
        textShadow: "0 2px 12px rgba(0,0,0,0.6)",
        background: "linear-gradient(135deg, rgba(157,124,255,0.28), rgba(126,231,201,0.18))",
      }}
    >
      ✨ Magic Book ✨
    </div>
  );

  return (
    <div
      className="magic-card"
      style={{
        width: 340, /* slightly narrower so it fits comfortably */
        borderRadius: 16,
        overflow: "hidden",
        transition: "transform 220ms ease, box-shadow 220ms ease",
        transformOrigin: "center",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ position: "relative", background: "#07101a" }}>
        {book.image ? (
          <img
            src={book.image}
            alt={book.title}
            style={{
              width: "100%",
              height: 420,
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <Placeholder />
        )}

        <div
          style={{
            position: "absolute",
            left: 14,
            top: 14,
            padding: "6px 10px",
            borderRadius: 10,
            background: "linear-gradient(90deg, rgba(157,124,255,0.16), rgba(126,231,201,0.10))",
            color: "#041019",
            fontWeight: 700,
            fontSize: 12,
            boxShadow: "0 6px 18px rgba(126,231,201,0.06)",
          }}
        >
          {book.genre}
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 90,
            background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(3,6,12,0.6) 60%)",
            pointerEvents: "none",
          }}
        />
      </div>

      <div
        style={{
          padding: "14px 14px 18px 14px",
          background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.04))",
        }}
      >
        <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 700, lineHeight: "1.28", color: "white" }}>
          {book.title}
        </h3>

        <div style={{ color: "#9fcfca", fontSize: 13, marginBottom: 8 }}>{book.author}</div>

        <div style={{ color: "#cfeff0", fontSize: 13, marginBottom: 10, minHeight: 36 }}>
          {book.description}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(90deg,#9d7cff,#7ee7c9)", color: "#041019", fontWeight: 700 }}>
              ⭐
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e9fff9" }}>{book.rating}</div>
          </div>

          {showButtons && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onSwipeLeft} style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", color: "#ffcfcf", border: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", fontSize: 13 }}>
                Dislike
              </button>

              <button onClick={onSwipeRight} style={{ padding: "8px 12px", borderRadius: 10, background: "linear-gradient(90deg,#9d7cff,#7ee7c9)", border: "none", color: "#041019", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                Like
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookCard;
