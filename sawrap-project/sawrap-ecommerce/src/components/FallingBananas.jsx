import React, { useEffect, useState } from 'react';

// Random helper
const rand = (min, max) => Math.random() * (max - min) + min;

export default function FallingBananas({ onDone }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const count = 18;
    const generated = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: rand(0, 96), // vw%
      delay: rand(0, 0.6), // s
      duration: rand(2.2, 3.4), // s
      size: rand(24, 44), // px
      spin: rand(-360, 360), // deg
    }));
    setPieces(generated);

    const timer = setTimeout(() => {
      if (onDone) onDone();
    }, 3800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      <style>{`
        @keyframes sawrap-banana-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(var(--spin)); opacity: 1; }
        }
      `}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}vw`,
            top: 0,
            fontSize: `${p.size}px`,
            animation: `sawrap-banana-fall ${p.duration}s ease-in ${p.delay}s 1 forwards`,
            '--spin': `${p.spin}deg`,
          }}
        >
          🍌
        </span>
      ))}
    </div>
  );
}
