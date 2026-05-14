import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, MODES } from '../constants/tokens';
import { useAuth } from '../context/AuthContext';
import { getRandomPrompt } from '../services/api';
import CoachVox from '../components/CoachVox';

export default function Home() {
  const [hovered, setHovered] = useState(null);
  const [dailyPrompt, setDailyPrompt] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    getRandomPrompt('debates', 'Technical')
      .then((data) => setDailyPrompt(data.prompt))
      .catch(() => setDailyPrompt('Convince a skeptic that pineapple belongs on pizza.'));
  }, []);

  const startMode = (modeId) => {
    navigate('/practice', { state: { mode: modeId } });
  };

  const xpForNextLevel = [0, 500, 1200, 2100, 3200, 4500, 6000, 8000, 10500, 13500, 17000, 21000, 25500, 30500, 36000, 42000, 48500, 55500, 63000, 71000];
  const nextLevelXp = xpForNextLevel[user?.level] || xpForNextLevel[xpForNextLevel.length - 1];
  const prevLevelXp = xpForNextLevel[(user?.level || 1) - 1] || 0;
  const progress = nextLevelXp > prevLevelXp
    ? ((user?.xp || 0) - prevLevelXp) / (nextLevelXp - prevLevelXp) * 100
    : 0;

  return (
    <div className="page home">
      {/* Hero */}
      <section style={{ textAlign: 'center', paddingTop: 28, paddingBottom: 14 }}>
        <h1 style={{
          fontSize: 84, lineHeight: 1.0, fontWeight: 400,
          letterSpacing: '-0.5px',
          textShadow: '0 2px 32px rgba(0,0,0,0.35)',
        }}>
          Speak with clarity.<br />
          <span style={{ opacity: 0.92 }}>Master your voice.</span>
        </h1>
      </section>

      {/* Coach greeting */}
      <section style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18,
        margin: '28px auto 36px', maxWidth: 720,
      }}>
        <CoachVox size={62} mood="sass" />
        <div style={{ textAlign: 'left' }}>
          <div style={{ color: COLORS.lavender, fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }}>Coach Vox</div>
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.92)' }}>
            "Oh look who decided to show up, {user?.display_name || 'stranger'}. Let's fix that mumbling."
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, margin: '0 auto 22px', maxWidth: 920 }}>
        <StatCard color={COLORS.lavender} icon="🔥" label="Streak" value={user?.streak_days || 0} sub="days in a row" />
        <StatCard color={COLORS.mint} icon="✦" label="XP" value={(user?.xp || 0).toLocaleString()} sub="total earned" />
        <StatCard color={COLORS.peach} icon="◆" label="Level" value={user?.level || 1} sub={user?.level >= 6 ? 'Intermediate' : 'Beginner'} />
      </section>

      {/* XP bar */}
      <section className="glass" style={{ maxWidth: 920, margin: '0 auto 28px', padding: '14px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
          <span className="secondary">Level {user?.level || 1} → {(user?.level || 1) + 1}</span>
          <span className="muted">{(user?.xp || 0).toLocaleString()} / {nextLevelXp.toLocaleString()} XP</span>
        </div>
        <div style={{
          height: 10, borderRadius: 999, background: 'rgba(0,0,0,0.35)', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            width: `${Math.min(progress, 100)}%`, height: '100%',
            background: `linear-gradient(90deg, ${COLORS.lavender}, ${COLORS.mint})`,
            boxShadow: '0 0 18px rgba(184,174,240,0.55)',
            borderRadius: 999,
          }} />
        </div>
      </section>

      {/* Daily challenge */}
      <section className="glass" style={{
        maxWidth: 920, margin: '0 auto 36px', padding: '22px 26px',
        display: 'flex', alignItems: 'center', gap: 22, justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: `linear-gradient(135deg, ${COLORS.peach}, ${COLORS.lavender})`,
            display: 'grid', placeItems: 'center', fontSize: 26,
            boxShadow: '0 0 24px rgba(240,180,160,0.45)',
          }}>☀</div>
          <div>
            <div style={{ color: COLORS.peach, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 4 }}>Daily Challenge</div>
            <div style={{ fontSize: 19, marginBottom: 2 }}>{dailyPrompt || 'Loading...'}</div>
            <div className="muted" style={{ fontSize: 13 }}>60 seconds · Debate mode · +50 XP bonus</div>
          </div>
        </div>
        <button onClick={() => startMode('debates')} style={{
          padding: '12px 22px', borderRadius: 10,
          background: 'rgba(255,255,255,0.95)', color: '#0b0b10',
          border: 'none', fontFamily: 'inherit', fontSize: 15, cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}>Start →</button>
      </section>

      {/* Modes grid */}
      <section style={{ maxWidth: 920, margin: '0 auto 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <h2 style={{ fontSize: 24, fontWeight: 400 }}>Practice modes</h2>
          <span className="muted" style={{ fontSize: 13 }}>Pick your weapon.</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {MODES.map((m) => (
            <ModeCard key={m.id} mode={m} hovered={hovered === m.id}
              onHover={(h) => setHovered(h ? m.id : null)}
              onClick={() => startMode(m.id)} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 920, margin: '0 auto' }}>
        <button onClick={() => navigate('/practice')} style={{
          width: '100%', padding: '18px', borderRadius: 14, border: 'none', cursor: 'pointer',
          background: `linear-gradient(90deg, ${COLORS.lavender}, ${COLORS.mint})`,
          color: '#0b0b10', fontFamily: 'inherit', fontSize: 20,
          boxShadow: '0 10px 40px rgba(140,210,200,0.35), 0 0 0 1px rgba(255,255,255,0.12) inset',
          letterSpacing: 0.3,
        }}>Start today's session →</button>
      </section>
    </div>
  );
}

function StatCard({ color, icon, label, value, sub }) {
  return (
    <div className="glass" style={{ padding: '18px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 20, color }}>{icon}</span>
        <span style={{ color, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div className="muted" style={{ fontSize: 12 }}>{sub}</div>
    </div>
  );
}

function ModeCard({ mode, hovered, onHover, onClick }) {
  return (
    <button
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
      style={{
        textAlign: 'left', padding: '22px 24px', borderRadius: 12,
        background: 'rgba(0,0,0,0.25)',
        border: `1px solid ${hovered ? mode.color + '90' : 'rgba(255,255,255,0.12)'}`,
        cursor: 'pointer', fontFamily: 'inherit', color: '#fff',
        backdropFilter: 'blur(14px)', position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}>
      <div style={{
        position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%',
        background: `radial-gradient(circle, ${mode.color}55, transparent 70%)`, filter: 'blur(20px)',
      }} />
      <div style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: 6,
        background: `${mode.color}30`, color: mode.color,
        fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase',
        marginBottom: 12, border: `1px solid ${mode.color}55`,
      }}>{mode.name}</div>
      <div style={{ fontSize: 17, marginBottom: 6, position: 'relative' }}>{mode.blurb}</div>
      <div className="muted" style={{ fontSize: 12, position: 'relative' }}>5 prompts · 25–100 XP each</div>
    </button>
  );
}