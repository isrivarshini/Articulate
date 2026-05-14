import { COLORS } from '../constants/tokens';

export default function Avatar({ name, size = 40, color }) {
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('');
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const palette = [COLORS.lavender, COLORS.mint, COLORS.peach, COLORS.sage];
  const c = color || palette[hash % palette.length];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, #fff8, ${c}, ${c}cc)`,
        display: 'grid',
        placeItems: 'center',
        color: '#0b0b10',
        fontSize: size * 0.36,
        boxShadow: `0 4px 14px ${c}55`,
      }}
    >
      {initials}
    </div>
  );
}