type History = Record<string, string[]>;
const KEY = 'mario_calc_v3';
export const loadStorage = (): History => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
};
export const saveStorage = (d: History): void => {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
};
export const addEntry = (cur: History, id: string, entry: string): History => {
  const n = { ...cur, [id]: [...(cur[id] || []).slice(-49), entry] };
  saveStorage(n); return n;
};
export const clearEntries = (cur: History, id: string): History => {
  const n = { ...cur, [id]: [] }; saveStorage(n); return n;
};
