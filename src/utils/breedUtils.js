import { breeds, initialTraits } from './breeds';

export function seededRandom(seedString) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedString.length; i++) {
    h ^= seedString.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h >>> 0) / 4294967296;
}

export function sampleFromDistribution(entries, seed) {
  const r = seed ? seededRandom(seed) : Math.random();
  let cum = 0;
  for (const e of entries) {
    cum += e.prob;
    if (r <= cum) return e.name;
  }
  return entries[entries.length - 1].name;
}

export function determineBreedFromTraits(traitsObj, seed) {
  const traitKeys = Object.keys(initialTraits);

  // Compute squared distance (unweighted; weights were all 1 and therefore redundant)
  const entries = Object.entries(breeds).map(([name, profile]) => {
    let sqDist = 0;
    for (const k of traitKeys) {
      const d = (traitsObj[k] || 0) - (profile[k] || 0);
      sqDist += d * d;
    }
    return { name, dist: sqDist };
  });

  // Convert distances to similarity scores using a Gaussian kernel
  const SIGMA = 2.0; // kernel bandwidth — can be tuned if needed
  const denom = 2 * SIGMA * SIGMA;
  entries.forEach(e => e.score = Math.exp(-e.dist / denom));

  const total = entries.reduce((s, e) => s + e.score, 0) || 1;
  entries.forEach(e => e.prob = e.score / total);

  // Sort for predictable behavior (helps tests & UX)
  entries.sort((a, b) => b.prob - a.prob);

  // Sample one breed from distribution (supports seeded randomness if `seed` provided)
  return sampleFromDistribution(entries, seed);
}

/**
 * Fetch the list of breeds from dog.ceo and cache it for the module lifetime.
 * @param {Function} fetchFn - optional fetch implementation for testability
 * @returns {Promise<Record<string,string[]>>}
 */
export async function getBreedsMap(fetchFn = fetch, ttlMs = 60 * 60 * 1000) {
  // simple in-memory cache with TTL (module lifetime)
  const now = Date.now();
  if (getBreedsMap._cache && (now - getBreedsMap._ts < ttlMs)) return getBreedsMap._cache;
  try {
    const res = await fetchFn('https://dog.ceo/api/breeds/list/all');
    if (!res || !res.ok) return {};
    const json = await res.json();
    const map = json && json.message ? json.message : {};
    getBreedsMap._cache = map;
    getBreedsMap._ts = Date.now();
    return map;
  } catch {
    return {};
  }
} 

/**
 * Generate candidate endpoints for a given breed name.
 * Exported for testing.
 */
export function generateCandidates(name) {
  const candidates = new Set();
  if (!name) return Array.from(candidates);
  const raw = String(name).trim().toLowerCase();
  candidates.add(raw);
  candidates.add(raw.replace(/\s+/g, '-'));
  candidates.add(raw.replace(/\s+/g, ''));
  const tokens = raw.split(/[-_\s]+/).filter(Boolean);
  if (tokens.length === 2) {
    candidates.add(`${tokens[0]}/${tokens[1]}`);
    candidates.add(`${tokens[1]}/${tokens[0]}`);
    candidates.add(`${tokens[0]}-${tokens[1]}`);
    candidates.add(`${tokens[1]}-${tokens[0]}`);
  }
  candidates.add(raw.replace(/\s+/g, '_'));
  return Array.from(candidates);
}

async function tryFetch(endpoint, fetchFn = fetch, { attempts = 3, backoffMs = 200 } = {}) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetchFn(`https://dog.ceo/api/breed/${endpoint}/images/random`);
      if (!res || !res.ok) return null;
      const data = await res.json();
      if (data && data.message) return data;
      return null;
    } catch {
      // transient network error -> retry with exponential backoff
      if (i === attempts - 1) return null;
      const wait = backoffMs * (2 ** i);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  return null;
}

/**
 * Fetch a random image for a breed using dog.ceo. Accepts an optional fetch
 * implementation to make unit testing easy. Returns the API response object or
 * null when not found or on error.
 */
export async function fetchArtworkByApi(apiName, fetchFn = fetch, options = {}) {
  if (!apiName) return null;
  const { attempts = 3, backoffMs = 200, ttlMs } = options;

  // Primary try (with retries/backoff)
  let data = await tryFetch(apiName, fetchFn, { attempts, backoffMs });
  if (data) return data;

  // Fallback: try candidates and known breeds list (getBreedsMap respects ttlMs if provided)
  const breedsMap = await getBreedsMap(fetchFn, typeof ttlMs === 'number' ? ttlMs : 60 * 60 * 1000);
  const candidates = generateCandidates(apiName);

  Object.keys(breedsMap).forEach(main => {
    const subs = breedsMap[main] || [];
    candidates.push(main);
    subs.forEach(s => candidates.push(`${main}/${s}`));
    subs.forEach(s => candidates.push(`${main}-${s}`));
    subs.forEach(s => candidates.push(`${s}/${main}`));
  });

  const uniqCandidates = [...new Set(candidates)];
  for (const cand of uniqCandidates) {
    data = await tryFetch(cand, fetchFn, { attempts, backoffMs });
    if (data) return data;
  }

  return null;
}
