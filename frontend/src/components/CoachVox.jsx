import { useId } from 'react';

export default function CoachVox({ size = 64, mood = 'calm' }) {
  const id = useId();

  const stops =
    mood === 'celebrate'
      ? ['#f0b4a0', '#b8aef0', '#8cd2c8']
      : mood === 'sass'
        ? ['#b8aef0', '#c88aaa', '#7882be']
        : ['#b8aef0', '#8cd2c8', '#c8dc9a'];

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        filter: `drop-shadow(0 0 ${size / 3}px rgba(184,174,240,0.55))`,
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <radialGradient id={`vox-${id}`} cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="35%" stopColor={stops[0]} />
            <stop offset="75%" stopColor={stops[1]} />
            <stop offset="100%" stopColor={stops[2]} />
          </radialGradient>
          <filter id={`blob-${id}`}>
            <feGaussianBlur stdDeviation="0.4" />
          </filter>
        </defs>
        <g filter={`url(#blob-${id})`}>
          <path
            d="M50,8 C68,8 88,22 90,46 C92,68 78,90 54,92 C30,94 10,78 8,54 C6,30 30,8 50,8 Z"
            fill={`url(#vox-${id})`}
          >
            <animate
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="M50,8 C68,8 88,22 90,46 C92,68 78,90 54,92 C30,94 10,78 8,54 C6,30 30,8 50,8 Z;
                      M52,6 C72,10 90,26 88,50 C86,72 70,92 48,90 C26,88 8,72 10,48 C12,26 32,2 52,6 Z;
                      M50,8 C68,8 88,22 90,46 C92,68 78,90 54,92 C30,94 10,78 8,54 C6,30 30,8 50,8 Z"
            />
          </path>
        </g>
        <ellipse cx="38" cy="32" rx="10" ry="6" fill="rgba(255,255,255,0.55)" />
        <ellipse cx="42" cy="28" rx="4" ry="2" fill="rgba(255,255,255,0.85)" />
      </svg>
    </div>
  );
}