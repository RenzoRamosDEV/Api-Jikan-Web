import { useState, useEffect } from 'react';

// Cache map outside component — persists for the session
const cache = new Map();
let lastRequestTime = 0;

export function useAnimeData(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!endpoint) {
      setLoading(false);
      return;
    }

    if (cache.has(endpoint)) {
      setData(cache.get(endpoint));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const now = Date.now();
    const delay = Math.max(0, lastRequestTime + 350 - now);

    const timer = setTimeout(async () => {
      lastRequestTime = Date.now();
      try {
        const res = await fetch(`https://api.jikan.moe/v4${endpoint}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const result = json.data;
        cache.set(endpoint, result);
        setData(result);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [endpoint]);

  return { data, loading, error };
}
