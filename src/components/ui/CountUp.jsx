import React, { useEffect, useRef, useState } from 'react';

export default function CountUp({ value, duration = 800, prefix = '', suffix = '', decimals = 0, className = '' }) {
  const [display, setDisplay] = useState(0);
  const frame = useRef();
  const start = useRef();

  useEffect(() => {
    cancelAnimationFrame(frame.current);
    start.current = null;
    const startValue = display;
    const delta = Number(value) - startValue;

    const step = (ts) => {
      if (!start.current) start.current = ts;
      const t = Math.min(1, (ts - start.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(startValue + delta * eased);
      if (t < 1) frame.current = requestAnimationFrame(step);
      else setDisplay(Number(value));
    };

    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString('en-IN');

  return <span className={className}>{prefix}{formatted}{suffix}</span>;
}
