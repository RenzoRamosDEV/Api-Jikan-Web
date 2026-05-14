import { useState, useEffect, useCallback } from 'react';

// ==================== CACHE CON TTL + PERSISTENCIA ====================
const CACHE_MAX_SIZE = 50;
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_STORAGE_KEY = 'anime_cache_v1';

const cache = new Map();

function loadPersistedCache() {
  try {
    const saved = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!saved) return;
    const entries = JSON.parse(saved);
    entries.forEach(([key, value]) => cache.set(key, value));
  } catch { /* ignorar errores de parse o quota */ }
}

function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  if (cache.size >= CACHE_MAX_SIZE) {
    cache.delete(cache.keys().next().value);
  }
  cache.set(key, { data, timestamp: Date.now() });
  setTimeout(() => {
    try {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify([...cache.entries()]));
    } catch { /* quota excedida */ }
  }, 0);
}

loadPersistedCache();

// ==================== DEDUPLICACIÓN IN-FLIGHT ====================
const inFlightRequests = new Map();

// ==================== BACKOFF EXPONENCIAL CON JITTER ====================
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateBackoff(attempt) {
  const base = Math.pow(2, attempt) * INITIAL_RETRY_DELAY;
  const jitter = base * 0.2 * (Math.random() * 2 - 1);
  return Math.round(base + jitter);
}

async function fetchWithRetry(url, signal, attempt = 0) {
  const response = await fetch(url, { signal });

  if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
    const delay = calculateBackoff(attempt);
    await sleep(delay);
    return fetchWithRetry(url, signal, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response;
}

// ==================== COLA CON CONCURRENCIA LIMITADA ====================
const queue = [];
let activeRequests = 0;
const MAX_CONCURRENT = 3;
const WINDOW_MS = 1100;
let windowStart = 0;
let windowCount = 0;

function scheduleNext() {
  if (queue.length === 0) return;
  if (activeRequests >= MAX_CONCURRENT) return;

  const now = Date.now();
  if (now - windowStart >= WINDOW_MS) {
    windowStart = now;
    windowCount = 0;
  }

  if (windowCount >= MAX_CONCURRENT) {
    setTimeout(scheduleNext, WINDOW_MS - (now - windowStart));
    return;
  }

  const resolve = queue.shift();
  activeRequests++;
  windowCount++;
  resolve();
}

function enqueue() {
  return new Promise(resolve => {
    queue.push(resolve);
    scheduleNext();
  });
}

// ==================== FETCH PRINCIPAL ====================
async function fetchWithQueue(endpoint, signal) {
  const cached = getFromCache(endpoint);
  if (cached) return cached;

  if (inFlightRequests.has(endpoint)) {
    return inFlightRequests.get(endpoint);
  }

  await enqueue();

  const promise = fetchWithRetry(`https://api.jikan.moe/v4${endpoint}`, signal)
    .then(res => res.json())
    .then(json => {
      setCache(endpoint, json.data);
      return json.data;
    })
    .finally(() => {
      inFlightRequests.delete(endpoint);
      activeRequests--;
      scheduleNext();
    });

  inFlightRequests.set(endpoint, promise);
  return promise;
}

// ==================== HOOK PRINCIPAL ====================
export function useAnimeData(endpoint) {
  const [data, setData] = useState(() => getFromCache(endpoint));
  const [loading, setLoading] = useState(() => !getFromCache(endpoint));
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!endpoint) {
      setLoading(false);
      return;
    }

    const cached = getFromCache(endpoint);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchWithQueue(endpoint, controller.signal)
      .then(result => {
        if (controller.signal.aborted) return;
        setData(result);
      })
      .catch(e => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [endpoint, retryCount]);

  const retry = useCallback(() => {
    cache.delete(endpoint);
    inFlightRequests.delete(endpoint);
    setRetryCount(c => c + 1);
  }, [endpoint]);

  return { data, loading, error, retry };
}

// ==================== FUNCIONES UTILITARIAS ====================
export function invalidateCache(endpoint = null) {
  if (endpoint) {
    cache.delete(endpoint);
    inFlightRequests.delete(endpoint);
  } else {
    cache.clear();
    inFlightRequests.clear();
    try { localStorage.removeItem(CACHE_STORAGE_KEY); } catch { /* ignorar */ }
  }
}

export function getCacheStats() {
  const now = Date.now();
  let valid = 0;
  let expired = 0;
  for (const [, entry] of cache.entries()) {
    if (now - entry.timestamp <= CACHE_TTL_MS) valid++;
    else expired++;
  }
  return { total: cache.size, valid, expired, maxSize: CACHE_MAX_SIZE };
}
