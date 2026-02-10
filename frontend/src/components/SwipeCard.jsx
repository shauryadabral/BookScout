// frontend/src/components/SwipeCard.jsx
import React, { useRef, useState, useEffect } from "react";
import BookCard from "./BookCard";

/*
 Improved SwipeCard (no external libs)
 - pointer events (works on mobile + desktop)
 - velocity + distance threshold
 - smooth fly-away animation
 - visual overlays for Like / Dislike
 - calls onSwipeRight / onSwipeLeft after animation completes
*/

const DISTANCE_THRESHOLD = 140;      // px - hard swipe distance
const VELOCITY_THRESHOLD = 0.6;      // px/ms - flick speed threshold
const FLYAWAY_DISTANCE = 900;        // px - off-screen translate
const RELEASE_ANIM_MS = 340;         // ms - animation duration

export default function SwipeCard({ book, onSwipeRight, onSwipeLeft }) {
  const elRef = useRef(null);
  const pointerIdRef = useRef(null);

  // state used for rendering transform & transition
  const [pos, setPos] = useState({ x: 0, y: 0, rot: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [animating, setAnimating] = useState(false);
  const lastTimeRef = useRef(0);
  const lastXRef = useRef(0);

  // track start info for velocity calculation
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);

  // convenience for overlay opacity
  const likeOpacity = Math.max(0, Math.min(1, pos.x / 200));
  const dislikeOpacity = Math.max(0, Math.min(1, -pos.x / 200));

  // reset state (used after fly-away)
  const reset = () => {
    setPos({ x: 0, y: 0, rot: 0 });
    setAnimating(false);
  };

  // pointer down: start dragging
  const onPointerDown = (e) => {
    if (animating) return;
    const el = elRef.current;
    el.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;

    setIsDragging(true);
    lastTimeRef.current = performance.now();
    lastXRef.current = e.clientX;

    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startTimeRef.current = performance.now();
  };

  // pointer move: update pos (uses movement deltas)
  const onPointerMove = (e) => {
    if (!isDragging || pointerIdRef.current !== e.pointerId) return;

    const now = performance.now();
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    // rotation proportional to x movement
    const rot = dx * 0.08;

    setPos({ x: dx, y: dy, rot });

    // update last samples for velocity calculation
    lastTimeRef.current = now;
    lastXRef.current = e.clientX;
  };

  // pointer up: decide if it's a swipe or a cancel
  const onPointerUp = (e) => {
    if (pointerIdRef.current !== e.pointerId) return;
    pointerIdRef.current = null;

    const endX = e.clientX;
    const endTime = performance.now();
    const dxTotal = endX - startXRef.current;
    const dt = Math.max(1, endTime - startTimeRef.current); // ms
    const velocity = dxTotal / dt; // px/ms

    setIsDragging(false);

    const isDistanceSwipe = Math.abs(dxTotal) > DISTANCE_THRESHOLD;
    const isFlick = Math.abs(velocity) > VELOCITY_THRESHOLD;

    if (isDistanceSwipe || isFlick) {
      // determine direction
      const toRight = dxTotal > 0 || velocity > 0;
      performFlyAway(toRight, velocity);
    } else {
      // animate back to center
      setAnimating(true);
      // use CSS-like smooth reset
      setPos({ x: 0, y: 0, rot: 0 });
      // finish animation after timeout
      setTimeout(() => reset(), RELEASE_ANIM_MS);
    }

    // release pointer capture
    try {
      const el = elRef.current;
      if (el && e.pointerId !== undefined) el.releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  // fly the card away smoothly and call callbacks after it leaves
  const performFlyAway = (toRight, velocity) => {
    setAnimating(true);

    // choose direction and distance scaled by velocity (clamped)
    const sign = toRight ? 1 : -1;
    const extra = Math.min(1.6, Math.abs(velocity) * 600); // scale vel to px
    const targetX = sign * (FLYAWAY_DISTANCE + extra);
    const rot = sign * 30;

    // set transform to fly away (this uses CSS transition defined inline)
    setPos({ x: targetX, y: pos.y, rot });

    // call the appropriate callback after the animation finishes
    setTimeout(() => {
      // invoke callbacks
      if (toRight) onSwipeRight && onSwipeRight();
      else onSwipeLeft && onSwipeLeft();

      // reset card for next item (small delay so next card not jumpy)
      setTimeout(() => {
        reset();
      }, 60);
    }, RELEASE_ANIM_MS);
  };

  // cleanup on unmount (just in case)
  useEffect(() => {
    return () => {
      const el = elRef.current;
      if (el && pointerIdRef.current) {
        try { el.releasePointerCapture(pointerIdRef.current); } catch (e) {}
      }
    };
  }, []);

  if (!book) return <h2>No more books!</h2>;

  // styles
  const containerStyle = {
    width: 340,
    margin: "18px auto",
    touchAction: "none",
  };

  const cardStyle = {
  transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rot}deg)`,
  transition: isDragging ? "none" : `transform ${RELEASE_ANIM_MS}ms cubic-bezier(.2,.8,.2,1)`,
  cursor: isDragging ? "grabbing" : "grab",
  willChange: "transform",
  filter: isDragging
    ? "drop-shadow(0 0 18px rgba(157,124,255,0.45))"
    : "drop-shadow(0 0 12px rgba(157,124,255,0.22))",
};


  const overlayCommon = {
    position: "absolute",
    top: 24,
    padding: "8px 12px",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 18,
    color: "white",
    pointerEvents: "none",
    boxShadow: "0 3px 10px rgba(0,0,0,0.15)"
  };

  return (
    <div style={containerStyle}>
      <div
        ref={elRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={cardStyle}
      >
        <div style={{ position: "relative" }}>
          {/* Like overlay (right) */}
          <div style={{
            ...overlayCommon,
            right: 18,
            background: "linear-gradient(90deg,#06c06c,#28d48a)",
            opacity: likeOpacity,
            transform: `translateX(${Math.min(0, pos.x * 0.06)}px)`,
          }}>
            LIKE 👍
          </div>

          {/* Dislike overlay (left) */}
          <div style={{
            ...overlayCommon,
            left: 18,
            background: "linear-gradient(90deg,#ff6b6b,#ff8787)",
            opacity: dislikeOpacity,
            transform: `translateX(${Math.max(0, pos.x * 0.06)}px)`,
          }}>
            NOT FOR ME 👎
          </div>

          {/* The actual card content */}
          <BookCard book={book} showButtons={false} />
        </div>
      </div>
    </div>
  );
}
