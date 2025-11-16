// src/utils/favorites.js
const STORAGE_KEY = 'favorites_v1_ids';

/**
 * Return array of saved favourite IDs (strings).
 */
export const getFavoriteIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('getFavoriteIds error', e);
    return [];
  }
};

/**
 * Save array of favourite IDs (strings).
 */
export const saveFavoriteIds = (ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('saveFavoriteIds error', e);
  }
};

/**
 * Add an id to favourites (id can be number or string).
 */
export const addFavorite = (id) => {
  const sid = String(id);
  const ids = getFavoriteIds();
  if (!ids.includes(sid)) {
    ids.push(sid);
    saveFavoriteIds(ids);
  }
};

/**
 * Remove an id from favourites.
 */
export const removeFavorite = (id) => {
  const sid = String(id);
  const ids = getFavoriteIds().filter((i) => i !== sid);
  saveFavoriteIds(ids);
};

/**
 * Return true if id is favourited.
 */
export const isFavorite = (id) => {
  const sid = String(id);
  return getFavoriteIds().includes(sid);
};

/**
 * Toggle favourite state for an id. Returns newState: true if added, false if removed.
 */
export const toggleFavorite = (id) => {
  const sid = String(id);
  if (isFavorite(sid)) {
    removeFavorite(sid);
    return false;
  } else {
    addFavorite(sid);
    return true;
  }
};
