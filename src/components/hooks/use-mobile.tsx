import { useState, useEffect } from 'react';

export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(window.matchMedia(`(max-width: ${breakpoint}px)`).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handleChange = (e:any) => setIsMobile(e.matches);

    mediaQuery.addEventListener('change', handleChange); // Use addEventListener for wider browser support
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpoint]);

  return isMobile;
};
