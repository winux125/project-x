"use client";
import { useState, useEffect } from "react";

export function TypingText({
  texts,
  speed = 60,
  pause = 2000,
  className,
}: {
  texts: string[];
  speed?: number;
  pause?: number;
  className?: string;
}) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];

    if (!deleting && charIndex === current.length) {
      const timeout = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(timeout);
    }

    if (deleting && charIndex === 0) {
      setDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(
      () => setCharIndex((prev) => prev + (deleting ? -1 : 1)),
      deleting ? speed / 2 : speed
    );
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, textIndex, texts, speed, pause]);

  return (
    <span className={className}>
      {texts[textIndex].slice(0, charIndex)}
      <span className="inline-block w-px h-[1em] bg-fd-green ml-0.5 animate-pulse" />
    </span>
  );
}
