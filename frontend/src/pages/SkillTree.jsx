import { COLORS } from '../constants/tokens';

const NODES = [
  { id: 1, branch: 'scenarios', label: 'First Words', state: 'done', icon: 'A' },
  { id: 2, branch: 'scenarios', label: 'Self-Intro', state: 'done', icon: 'B' },
  { id: 3, branch: 'prompts', label: '60-sec Riff', state: 'done', icon: 'C' },
  { id: 4, branch: 'prompts', label: 'Topic Toss', state: 'done', icon: 'D' },
  { id: 5, branch: 'scenarios', label: 'Small Talk', state: 'current', icon: 'E' },
  { id: 6, branch: 'debates', label: 'Soft Debates', state: 'locked', icon: 'F' },
  { id: 7, branch: 'prompts', label: 'Speed Pivot', state: 'locked', icon: 'G' },
  { id: 8, branch: 'stories', label: 'Mini Story', state: 'locked', icon: 'H' },
  { id: 9, branch: 'scenarios', label: 'Conflict Talk', state: 'locked', icon: 'I' },
  { id: 10, branch: 'debates', label: 'Hot Takes', state: 'locked', icon: 'J' },
  { id: 11, branch: 'stories', label: 'The Setup', state: 'locked', icon: 'K' },
  { id: 12, branch: 'scenarios', label: 'Pitch It', state: 'locked', icon: 'L' },
  { id: 13, branch: 'prompts', label: 'Free Association', state: 'locked', icon: 'M' },
  { id: 14, branch: 'debates', label: 'Cross-Examine', state: 'locked', icon: 'N' },
  { id: 15, branch: 'stories', label: 'The Twist', state: 'locked', icon: 'O' },
  { id: 16, branch: 'scenarios', label: 'Hard Convo', state: 'locked', icon: 'P' },
  { id: 17, branch: 'debates', label: 'Steelman', state: 'locked', icon: 'Q' },
  { id: 18, branch: 'stories', label: 'Long Form', state: 'locked', icon: 'R' },
  { id: 19, branch: 'prompts', label: 'Cold Open', state: 'locked', icon: 'S' },
  { id: 20, branch: 'scenarios', label: 'Keynote', state: 'locked', icon: 'T' },
];

const branchColor = {
  scenarios: COLORS.lavender,
  prompts: COLORS.mint,
  debates: COLORS.peach,
  stories: COLORS.sage,
};

export default function SkillTree() {
  return (
    <div className="page" style={{ paddingTop: 14, maxWidth: 980 }}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 38, fontWeight: 400 }}>Your skill path</h1>
        <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>
          20 nodes · 4 branches · climb your way up.
        </p>
      </div>

      {/* Branch legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 30, flexWrap: 'wrap' }}>
        {Object.entries(branchColor).map(([k, c]) => (
          <div
            key={k}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span
              style={{ width: 10, height: 10, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}` }}
            />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' }}>
              {k}
            </span>
          </div>
        ))}
      </div>

      {/* Vertical winding path */}
      <div style={{ position: 'relative', padding: '20px 0 60px' }}>
        {NODES.map((n, i) => {
          const offset = Math.sin(i * 0.85) * 180;
          const color = branchColor[n.branch];
          return (
            <div
              key={n.id}
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 28,
                transform: `translateX(${offset}px)`,
                transition: 'transform 0.3s',
              }}
            >
              <SkillNode node={n} color={color} />
              {i < NODES.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 84,
                    width: 4,
                    height: 32,
                    background: n.state === 'done' ? color : 'rgba(255,255,255,0.12)',
                    borderRadius: 2,
                    boxShadow: n.state === 'done' ? `0 0 10px ${color}88` : 'none',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillNode({ node, color }) {
  const isDone = node.state === 'done';
  const isCurrent = node.state === 'current';
  const isLocked = node.state === 'locked';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
      <button
        style={{
          width: 84,
          height: 84,
          borderRadius: '50%',
          border: 'none',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          background: isDone
            ? `radial-gradient(circle at 35% 30%, #fff8, ${color}, ${color}cc)`
            : isCurrent
              ? `radial-gradient(circle at 35% 30%, #fff5, ${color}99, ${color}55)`
              : 'rgba(0,0,0,0.45)',
          color: '#0b0b10',
          fontFamily: 'inherit',
          fontSize: 30,
          position: 'relative',
          boxShadow: isCurrent
            ? `0 0 0 4px ${color}, 0 0 32px ${color}88`
            : isDone
              ? `0 6px 22px ${color}55`
              : 'inset 0 0 0 1px rgba(255,255,255,0.12)',
          opacity: isLocked ? 0.55 : 1,
        }}
      >
        {isDone ? (
          <span style={{ color: '#0b0b10', fontSize: 36 }}>✓</span>
        ) : isLocked ? (
          <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.45)' }}>🔒</span>
        ) : (
          <span style={{ color: '#0b0b10', fontSize: 30 }}>{node.icon}</span>
        )}
      </button>
      <div style={{ fontSize: 13, color: isLocked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)' }}>
        {node.label}
      </div>
      {isCurrent && (
        <div
          style={{
            padding: '2px 8px',
            borderRadius: 6,
            background: color,
            color: '#0b0b10',
            fontSize: 10,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          You're here
        </div>
      )}
    </div>
  );
}