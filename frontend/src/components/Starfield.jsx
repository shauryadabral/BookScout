// frontend/src/components/Starfield.jsx
import React from "react";

/* Very lightweight: places several absolutely-positioned sparkles with small random offsets.
   You can tweak positions or add more elements.
*/
export default function Starfield() {
  // positions for 12 sparkles (percent values)
  const positions = [
    { left: "5%", top: "12%", size: 8, cls: "slow" },
    { left: "22%", top: "6%", size: 6, cls: "fast" },
    { left: "40%", top: "18%", size: 10, cls: "slow" },
    { left: "60%", top: "8%", size: 7, cls: "fast" },
    { left: "78%", top: "14%", size: 6, cls: "slow" },
    { left: "88%", top: "30%", size: 9, cls: "fast" },

    { left: "10%", top: "70%", size: 7, cls: "slow" },
    { left: "30%", top: "62%", size: 6, cls: "fast" },
    { left: "50%", top: "72%", size: 8, cls: "slow" },
    { left: "66%", top: "62%", size: 5, cls: "fast" },
    { left: "82%", top: "78%", size: 6, cls: "slow" },
    { left: "44%", top: "48%", size: 9, cls: "fast" },
  ];

  return (
    <div className="starfield" aria-hidden="true">
      {positions.map((p, i) => (
        <div
          key={i}
          className={`sparkle ${p.cls}`}
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
        />
      ))}
    </div>
  );
}
