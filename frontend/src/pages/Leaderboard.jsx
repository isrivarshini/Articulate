import { useState, useEffect } from 'react';
import { COLORS } from '../constants/tokens';
import { getLeaderboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

export default function Leaderboard() {
  const [tab, setTab] = useState('global');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    getLeaderboard(20)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const medals = ['🥇', '🥈', '🥉'];
  const podiumColors = [COLORS.peach, COLORS.lavender, COLORS.mint];

  return (
    <div className="page" style={{ paddingTop: 14, maxWidth: 1000 }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <h1 style={{ fontSize: 38, fontWeight: 400 }}>This week's rankings</h1>
        <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>
          Resets Sunday at midnight. Top 3 earn medals.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 30 }}>
        {['global', 'friends'].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 22px', borderRadius: 8,
            border: `1px solid ${tab === t ? COLORS.lavender : 'rgba(255,255,255,0.14)'}`,
            background: tab === t ? `${COLORS.lavender}22` : 'rgba(0,0,0,0.22)',
            color: tab === t ? '#fff' : 'rgba(255,255,255,0.6)',
            fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.5)' }}>Loading rankings...</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.5)' }}>
          No rankings yet. Be the first to practice!
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length >= 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 16, marginBottom: 28, alignItems: 'end' }}>
              <PodiumCard person={{ ...top3[1], medal: medals[1], color: podiumColors[1] }} height={170} isMe={top3[1].user_id === user?.id} />
              <PodiumCard person={{ ...top3[0], medal: medals[0], color: podiumColors[0] }} height={210} winner isMe={top3[0].user_id === user?.id} />
              <PodiumCard person={{ ...top3[2], medal: medals[2], color: podiumColors[2] }} height={150} isMe={top3[2].user_id === user?.id} />
            </div>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div className="glass" style={{ padding: '8px 8px' }}>
              {rest.map((p) => (
                <LeaderRow key={p.rank} p={p} isMe={p.user_id === user?.id} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PodiumCard({ person, height, winner, isMe }) {
  const name = person.display_name || person.username;
  return (
    <div className="glass" style={{
      padding: '22px 16px 18px', textAlign: 'center', minHeight: height,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      border: winner ? `1px solid ${person.color}66` : '1px solid rgba(255,255,255,0.12)',
      boxShadow: winner ? `0 0 50px ${person.color}33` : 'none',
    }}>
      <div style={{ fontSize: 32, marginBottom: 6 }}>{person.medal}</div>
      <Avatar name={name} size={winner ? 76 : 60} color={person.color} />
      <div style={{ fontSize: winner ? 20 : 17, marginTop: 10 }}>
        {name}{isMe && <span style={{ color: COLORS.lavender, marginLeft: 6, fontSize: 12 }}>(you)</span>}
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>#{person.rank}</div>
      <div style={{
        marginTop: 12, padding: '6px 14px', borderRadius: 999,
        background: `${person.color}22`, border: `1px solid ${person.color}55`,
        color: person.color, fontSize: 14,
      }}>{person.xp.toLocaleString()} XP</div>
      <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>🔥 {person.streak_days}-day streak</div>
    </div>
  );
}

function LeaderRow({ p, isMe }) {
  const name = p.display_name || p.username;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10,
      background: isMe ? `${COLORS.lavender}1a` : 'transparent',
      border: isMe ? `1px solid ${COLORS.lavender}55` : '1px solid transparent',
      marginBottom: 4,
    }}>
      <div style={{ width: 36, fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>#{p.rank}</div>
      <Avatar name={name} size={40} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16 }}>
          {name}{isMe && <span style={{ color: COLORS.lavender, marginLeft: 8, fontSize: 12 }}>(you)</span>}
        </div>
        <div className="muted" style={{ fontSize: 12 }}>🔥 {p.streak_days}-day streak</div>
      </div>
      <div style={{ fontSize: 17, color: '#fff' }}>
        {p.xp.toLocaleString()} <span className="muted" style={{ fontSize: 12 }}>XP</span>
      </div>
    </div>
  );
}