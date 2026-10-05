import React, { useEffect, useState } from 'react';
import sawrapLogo from '../assets/sawrap-logo.png';

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1400);
    const doneTimer = setTimeout(() => onFinish(), 1800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-400 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <img
        src={sawrapLogo}
        alt="SaWrap"
        className="h-20 w-auto object-contain animate-in fade-in zoom-in-95 duration-500"
      />
      <div className="mt-6 flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce" />
      </div>
    </div>
  );
}
