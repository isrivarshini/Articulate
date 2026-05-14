export default function Pill({ active, color, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 999,
        border: '1px solid ' + (active ? color : 'rgba(255,255,255,0.18)'),
        background: active ? `${color}26` : 'rgba(0,0,0,0.22)',
        color: active ? '#fff' : 'rgba(255,255,255,0.7)',
        fontFamily: 'inherit',
        fontSize: 14,
        cursor: 'pointer',
        transition: 'all 0.18s',
      }}
    >
      {children}
    </button>
  );
}