import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para controlar el carrusel de imágenes.
 * @param {Array} items - Lista de elementos del carrusel
 * @param {number} intervalMs - Intervalo en milisegundos entre diapositivas
 */
export function useCarousel(items, intervalMs = 6000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalItems = items?.length ?? 0;

  const next = useCallback(() => {
    if (totalItems === 0) return;
    setCurrentIndex(i => (i + 1) % totalItems);
  }, [totalItems]);

  const prev = useCallback(() => {
    if (totalItems === 0) return;
    setCurrentIndex(i => (i - 1 + totalItems) % totalItems);
  }, [totalItems]);

  const goTo = useCallback((index) => {
    if (index >= 0 && index < totalItems) {
      setCurrentIndex(index);
    }
  }, [totalItems]);

  useEffect(() => {
    if (isPaused || totalItems <= 1) return;
    const timer = setInterval(next, intervalMs);
    return () => clearInterval(timer);
  }, [next, intervalMs, isPaused, totalItems]);

  return {
    currentIndex,
    next,
    prev,
    goTo,
    pause: () => setIsPaused(true),
    resume: () => setIsPaused(false),
    isPaused,
    totalItems,
  };
}
