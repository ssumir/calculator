import { useState, useCallback } from 'react';
import { loadStorage, addEntry, clearEntries } from '../utils/storage';
export const useHistory = () => {
  const [history, setHistory] = useState(loadStorage);
  const add = useCallback((id, entry) => setHistory(p => addEntry(p, id, entry)), []);
  const clear = useCallback((id) => setHistory(p => clearEntries(p, id)), []);
  return { history, add, clear };
};
