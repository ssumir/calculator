import { useState, useEffect } from 'react';
const get = () => {
  const w = window.innerWidth;
  return { w, sm: w < 480, md: w >= 480 && w < 768, lg: w >= 768,
    pad: w < 380 ? 12 : w < 600 ? 16 : 22,
    btnH: w < 380 ? 50 : w < 600 ? 56 : 62,
    fs: w < 380 ? 13 : w < 600 ? 15 : 16,
    grid: w < 380 ? 2 : w < 600 ? 3 : w < 900 ? 4 : 5,
  };
};
export const useDevice = () => {
  const [d, setD] = useState(get);
  useEffect(() => { const h = () => setD(get()); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  return d;
};
