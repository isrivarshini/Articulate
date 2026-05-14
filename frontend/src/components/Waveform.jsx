import { useState, useEffect, useMemo } from 'react';

export default function Waveform({ recording, color }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setTick((x) => x + 1), 80);
    return () => clearInterval(t);
  }, [recording]);

  const N = 64;
  const bars = useMemo(() => {
    return Array.from({ length: N }, (_, i) => {
      const s = Math.sin(i * 0.5 + tick * 0.3) * Math.cos(i * 0.13 + tick * 0.21);
      const noise = (Math.sin(i * 7.13 + tick * 1.7) + 1) / 2;
      const env = Math.sin((i / N) * Math.PI);
      return Math.max(0.08, (Math.abs(s) * 0.55 + noise * 0.45) * env);
    });
  }, [tick]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        maxWidth: 720,
        margin: '0 auto',
        height: 80,
      }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: `${recording ? h * 100 : 8}%`,
            minHeight: 4,
            borderRadius: 3,
            background: `linear-gradient(180deg, ${color}, ${color}66)`,
            boxShadow: `0 0 6px ${color}66`,
            transition: 'height 0.08s ease-out',
          }}
        />
      ))}
    </div>
  );
}