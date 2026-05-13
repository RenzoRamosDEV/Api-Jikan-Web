import { useState, useEffect, useCallback } from 'react';

export function useCarousel(items, intervalMs = 6000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    if (!items || items.length === 0) return;
    setCurrentIndex(i => (i + 1) % items.length);
  }, [items]);

  const prev = useCallback(() => {
    if (!items || items.length === 0) return;
    setCurrentIndex(i => (i - 1 + items.length) % items.length);
  }, [items]);

  const goTo = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (isPaused || !items || items.length <= 1) return;
    const timer = setInterval(next, intervalMs);
    return () => clearInterval(timer);
  }, [next, intervalMs, isPaused, items]);

  return {
    currentIndex,
    next,
    prev,
    goTo,
    pause: () => setIsPaused(true),
    resume: () => setIsPaused(false),
  };
}
