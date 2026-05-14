import { useState, useEffect, useId } from 'react';
import { COLORS } from '../constants/tokens';
import { useAuth } from '../context/AuthContext';
import { getStats, getBadges, logout } from '../services/api';
import ImageSlot from '../components/ImageSlot';

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getBadges()])
      .then(([s, b]) => { setStats(s); setBadges(b); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = stats ? [
    { label: 'Total XP', value: stats.total_xp.toLocaleString(), color: COLORS.mint },
    { label: 'Longest streak', value: `${stats.longest_streak} days`, color: COLORS.lavender },
    { label: 'Exercises', value: stats.total_sessions.toString(), color: COLORS.peach },
    { label: 'Avg score', value: stats.avg_score ? Math.round(stats.avg_score).toString() : '—', color: COLORS.sage },
  ] : [];

  return (
    <div className="page" style={{ paddingTop: 14, maxWidth: 1080 }}>
      {/* Header */}
      <div className="glass" style={{
        padding: '32px 36px', display: 'flex', alignItems: 'center', gap: 28, marginBottom: 20,
      }}>
        <ImageSlot shape="circle" placeholder="Drop your avatar"
          style={{ width: 104, height: 104, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 36, fontWeight: 400, lineHeight: 1.05 }}>
            {user?.display_name || user?.username || 'User'}
          </h1>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{
              padding: '4px 12px', borderRadius: 6,
              background: `${COLORS.peach}22`, border: `1px solid ${COLORS.peach}55`,
              color: COLORS.peach, fontSize: 12, letterSpacing: 0.6,
            }}>Level {user?.level || 1} · {(user?.level || 1) >= 6 ? 'Intermediate' : 'Beginner'}</span>
            <span style={{
              padding: '4px 12px', borderRadius: 6,
              background: `${COLORS.lavender}22`, border: `1px solid ${COLORS.lavender}55`,
              color: COLORS.lavender, fontSize: 12, letterSpacing: 0.6,
            }}>🔥 {user?.streak_days || 0}-day streak</span>
            <span style={{
              padding: '4px 12px', borderRadius: 6,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)', fontSize: 12,
            }}>{user?.email}</span>
          </div>
        </div>
        <button onClick={logout} style={{
          padding: '10px 18px', borderRadius: 10,
          background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.16)',
          color: 'rgba(255,255,255,0.85)', fontFamily: 'inherit', fontSize: 14, cursor: 'pointer',
        }}>Log out</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.5)' }}>Loading stats...</div>
      ) : (
        <>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            {STAT_CARDS.map((s) => (
              <div key={s.label} className="glass" style={{ padding: '18px 20px' }}>
                <div style={{ color: s.color, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 30, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Score history chart */}
          {stats?.score_history?.length > 0 && (
            <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <h2 style={{ fontSize: 20, fontWeight: 400 }}>Score history</h2>
                <span className="muted" style={{ fontSize: 13 }}>Last {stats.score_history.length} sessions</span>
              </div>
              <ScoreChart data={stats.score_history} />
            </div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 400 }}>Badges</h2>
                <span className="muted" style={{ fontSize: 13 }}>
                  {badges.filter((b) => b.earned).length} of {badges.length} earned
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 14 }}>
                {badges.map((b) => (
                  <div key={b.id} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    opacity: b.earned ? 1 : 0.32, filter: b.earned ? 'none' : 'grayscale(0.7)',
                  }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 14,
                      background: b.earned
                        ? `radial-gradient(circle at 30% 25%, #fff5, ${COLORS.lavender}, ${COLORS.lavender}aa)`
                        : 'rgba(0,0,0,0.35)',
                      display: 'grid', placeItems: 'center', fontSize: 26, color: '#0b0b10',
                      boxShadow: b.earned ? `0 6px 20px ${COLORS.lavender}55` : 'inset 0 0 0 1px rgba(255,255,255,0.12)',
                    }}>{b.emoji}</div>
                    <div style={{ fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>{b.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ScoreChart({ data }) {
  const W = 980, H = 220, PAD = 24;
  const minVal = Math.max(Math.min(...data) - 10, 0);
  const maxVal = Math.min(Math.max(...data) + 10, 100);
  const range = maxVal - minVal || 1;
  const xs = data.map((_, i) => PAD + i * ((W - PAD * 2) / Math.max(data.length - 1, 1)));
  const ys = data.map((v) => H - PAD - ((v - minVal) / range) * (H - PAD * 2));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  const fill = `${path} L${xs[xs.length - 1]},${H - PAD} L${xs[0]},${H - PAD} Z`;
  const id = useId();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id={`f-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.mint} stopOpacity="0.45" />
          <stop offset="100%" stopColor={COLORS.lavender} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`s-${id}`} x1="0" x2="1">
          <stop offset="0%" stopColor={COLORS.lavender} />
          <stop offset="100%" stopColor={COLORS.mint} />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#f-${id})`} />
      <path d={path} fill="none" stroke={`url(#s-${id})`} strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(184,174,240,0.5))' }} />
      {xs.map((x, i) => i % Math.max(Math.floor(data.length / 6), 1) === 0 && (
        <circle key={i} cx={x} cy={ys[i]} r="3.5" fill={COLORS.lavender}
          style={{ filter: 'drop-shadow(0 0 6px rgba(184,174,240,0.7))' }} />
      ))}
    </svg>
  );
}