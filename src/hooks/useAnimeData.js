import { useState, useEffect, useCallback } from 'react';

// ==================== CACHE OPTIMIZADO ====================
const cache = new Map();
const CACHE_MAX_SIZE = 50;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de TTL

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
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// ==================== BACKOFF EXPONENCIAL ====================
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateBackoff(attempt) {
  // Backoff exponencial: 1s, 2s, 4s
  return Math.pow(2, attempt) * INITIAL_RETRY_DELAY;
}

async function fetchWithRetry(url, options = {}, attempt = 0) {
  try {
    const response = await fetch(url, options);
    
    // Si es rate limit (429) o error de servidor (5xx), reintentar
    if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
      const delay = calculateBackoff(attempt);
      console.log(`⚠️ Intento ${attempt + 1} falló (${response.status}). Reintentando en ${delay}ms...`);
      await sleep(delay);
      return fetchWithRetry(url, options, attempt + 1);
    }
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    if (attempt < MAX_RETRIES && (error.message.includes('fetch') || error.message.includes('network'))) {
      const delay = calculateBackoff(attempt);
      console.log(`⚠️ Error de red en intento ${attempt + 1}. Reintentando en ${delay}ms...`);
      await sleep(delay);
      return fetchWithRetry(url, options, attempt + 1);
    }
    throw error;
  }
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
    const wait = WINDOW_MS - (now - windowStart);
    setTimeout(scheduleNext, wait);
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

// ==================== BATCH PROCESSING ====================
/**
 * Procesa múltiples endpoints en batch para reducir llamadas
 * @param {string[]} endpoints - Array de endpoints a llamar
 * @param {number} batchSize - Tamaño del batch (default: 5)
 * @returns {Promise<Array>} - Array de resultados en el mismo orden
 */
export async function fetchBatch(endpoints, batchSize = 5) {
  const results = [];
  
  for (let i = 0; i < endpoints.length; i += batchSize) {
    const batch = endpoints.slice(i, i + batchSize);
    
    // Verificar caché primero
    const batchPromises = batch.map(async (endpoint) => {
      const cached = getFromCache(endpoint);
      if (cached) {
        console.log(`📦 Cache hit: ${endpoint}`);
        return { endpoint, data: cached, fromCache: true };
      }
      
      try {
        const data = await fetchWithQueue(endpoint);
        return { endpoint, data, fromCache: false };
      } catch (error) {
        console.error(`❌ Error en batch para ${endpoint}:`, error);
        return { endpoint, data: null, error: error.message };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Pausa entre batches para no saturar la API
    if (i + batchSize < endpoints.length) {
      await sleep(200);
    }
  }
  
  return results;
}

// ==================== FETCH PRINCIPAL ====================
async function fetchWithQueue(endpoint) {
  await enqueue();
  try {
    const res = await fetchWithRetry(`https://api.jikan.moe/v4${endpoint}`);
    const json = await res.json();
    return json.data;
  } finally {
    activeRequests--;
    scheduleNext();
  }
}

// ==================== HOOK PRINCIPAL ====================
export function useAnimeData(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!endpoint) {
      setLoading(false);
      return;
    }

    // Verificar caché con TTL
    const cachedData = getFromCache(endpoint);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchWithQueue(endpoint)
      .then(result => {
        if (cancelled) return;
        setCache(endpoint, result);
        setData(result);
      })
      .catch(e => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [endpoint, retryCount]);

  const retry = useCallback(() => {
    cache.delete(endpoint);
    setRetryCount(c => c + 1);
  }, [endpoint]);

  return { data, loading, error, retry };
}

// ==================== HOOK PARA MULTIPLES ENDPOINTS ====================
export function useAnimeDataBatch(endpoints, batchSize = 5) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!endpoints || endpoints.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setProgress(0);

    const processBatch = async () => {
      try {
        const results = [];
        
        for (let i = 0; i < endpoints.length; i += batchSize) {
          if (cancelled) break;
          
          const batch = endpoints.slice(i, i + batchSize);
          const batchResults = await fetchBatch(batch, batchSize);
          results.push(...batchResults);
          
          const progressPercent = Math.min(100, ((i + batch.length) / endpoints.length) * 100);
          setProgress(progressPercent);
        }
        
        if (!cancelled) {
          setData(results);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    processBatch();

    return () => { cancelled = true; };
  }, [endpoints, batchSize]);

  return { data, loading, error, progress };
}

// ==================== HOOK CON STREAMING (PARA DATOS GRANDES) ====================
export function useAnimeDataStream(endpoint, onChunk) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startStream = useCallback(async () => {
    if (!endpoint) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await enqueue();
      const response = await fetchWithRetry(`https://api.jikan.moe/v4${endpoint}`);
      
      // Para la API de Jikan, procesamos el JSON completo
      // pero simulamos "streaming" procesando chunks del array si es una lista
      const json = await response.json();
      
      if (Array.isArray(json.data) && onChunk) {
        // Procesar array en chunks de 10 items
        const chunkSize = 10;
        for (let i = 0; i < json.data.length; i += chunkSize) {
          const chunk = json.data.slice(i, i + chunkSize);
          onChunk(chunk, i, json.data.length);
          // Pequeña pausa para no bloquear el UI
          await sleep(16); // ~60fps
        }
      }
      
      return json.data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
      activeRequests--;
      scheduleNext();
    }
  }, [endpoint, onChunk]);

  return { startStream, loading, error };
}

// ==================== FUNCIONES UTILITARIAS ====================

/**
 * Invalida todo el caché o un endpoint específico
 */
export function invalidateCache(endpoint = null) {
  if (endpoint) {
    cache.delete(endpoint);
    console.log(`🗑️ Caché invalidado: ${endpoint}`);
  } else {
    cache.clear();
    console.log('🗑️ Todo el caché invalidado');
  }
}

/**
 * Obtiene estadísticas del caché
 */
export function getCacheStats() {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp <= CACHE_TTL_MS) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }
  
  return {
    total: cache.size,
    valid: validEntries,
    expired: expiredEntries,
    maxSize: CACHE_MAX_SIZE,
    hitRate: validEntries / Math.max(cache.size, 1)
  };
}

/**
 * Prefetch: carga datos en caché antes de necesitarlos
 */
export async function prefetchAnimeData(endpoints) {
  const uncachedEndpoints = endpoints.filter(ep => !getFromCache(ep));
  
  if (uncachedEndpoints.length === 0) {
    console.log('✅ Todos los endpoints ya están en caché');
    return;
  }
  
  console.log(`🚀 Prefetching ${uncachedEndpoints.length} endpoints...`);
  const results = await fetchBatch(uncachedEndpoints);
  
  results.forEach(({ endpoint, data, error }) => {
    if (data && !error) {
      setCache(endpoint, data);
    }
  });
  
  console.log(`✅ Prefetch completado`);
}
