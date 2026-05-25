// storage.js
const KEY = 'mario_calc_v3';
export const loadStorage = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
export const saveStorage = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };
export const addEntry = (cur, id, entry) => { const n = { ...cur, [id]: [...(cur[id]||[]).slice(-49), entry] }; saveStorage(n); return n; };
export const clearEntries = (cur, id) => { const n = { ...cur, [id]: [] }; saveStorage(n); return n; };
