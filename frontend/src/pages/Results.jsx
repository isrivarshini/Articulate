import { useId } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { COLORS } from '../constants/tokens';
import CoachVox from '../components/CoachVox';

const btnGhost = {
  padding: '12px 22px', borderRadius: 10,
  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.14)',
  color: 'rgba(255,255,255,0.8)', fontFamily: 'inherit', fontSize: 15, cursor: 'pointer',
};

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const analysis = location.state?.analysis;

  // Use real data if available, otherwise fallback
  const scores = analysis
    ? { clarity: analysis.clarity_score, vocabulary: analysis.vocabulary_score, confidence: analysis.confidence_score }
    : { clarity: 72, vocabulary: 84, confidence: 68 };
  const composite = analysis?.composite_score || Math.round((scores.clarity + scores.vocabulary + scores.confidence) / 3);

  const transcript = analysis?.transcript || 'No transcript available.';
  const coachFeedback = analysis?.coach_feedback || '"Complete a practice session to get feedback from Coach Vox."';
  const tips = analysis?.improvement_tips || [];
  const fillerWords = analysis?.filler_words || [];
  const strongWords = analysis?.strong_words || [];
  const suggestedUpgrades = analysis?.suggested_upgrades || [];
  const lexicalMetrics = analysis?.lexical_metrics || {};
  const xpEarned = analysis?.xp_earned || 0;
  const wordCount = analysis?.word_count || 0;
  const wpm = analysis?.words_per_minute || 0;
  const duration = analysis?.audio_duration_sec || 0;

  return (
    <div className="page" style={{ paddingTop: 16, maxWidth: 1080 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ color: COLORS.peach, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
          Session complete
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 400, lineHeight: 1.1 }}>Round complete.</h1>
        <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
          {Math.round(duration)} seconds · {wordCount} words spoken · {Math.round(wpm)} wpm
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 20 }}>
        {/* Left: composite + breakdown */}
        <div className="glass" style={{ padding: '28px 28px 24px', textAlign: 'center' }}>
          <div className="muted" style={{ fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 14 }}>Composite Score</div>
          <CompositeRing value={composite} />
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 28, gap: 14 }}>
            <ScoreBar label="Clarity" value={scores.clarity} color={COLORS.lavender} />
            <ScoreBar label="Vocabulary" value={scores.vocabulary} color={COLORS.mint} />
            <ScoreBar label="Confidence" value={scores.confidence} color={COLORS.peach} />
          </div>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Tag color={COLORS.mint}>+{xpEarned} XP earned</Tag>
            {fillerWords.length <= 2 && <Tag color={COLORS.lavender}>Clean speaker</Tag>}
          </div>
        </div>

        {/* Right: Vox commentary */}
        <div className="glass" style={{ padding: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <CoachVox size={56} mood={composite >= 80 ? 'celebrate' : 'sass'} />
            <div>
              <div style={{ color: COLORS.lavender, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase' }}>Coach Vox</div>
              <div style={{ fontSize: 18 }}>{composite >= 80 ? 'Not bad at all.' : 'Brutally honest, as always.'}</div>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, lineHeight: 1.55, marginBottom: 14 }}>
            "{coachFeedback}"
          </p>

          {tips.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14, marginTop: 6 }}>
              <div className="muted" style={{ fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10 }}>What to fix</div>
              {tips.map((tip, i) => (
                <FeedbackRow key={i} icon={i === 0 ? '—' : i === 1 ? '↓' : '↑'} text={tip} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vocabulary breakdown */}
      {(strongWords.length > 0 || suggestedUpgrades.length > 0) && (
        <div className="glass" style={{ marginTop: 20, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div>
              <div style={{ color: COLORS.mint, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 4 }}>
                Vocabulary · {scores.vocabulary} / 100
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 400 }}>Word-level analysis</h2>
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              {wordCount} words · diversity {lexicalMetrics.unique_words_ratio || '—'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 22 }}>
            <div>
              {strongWords.length > 0 && (
                <>
                  <div className="muted" style={{ fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10 }}>Strong word choices</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                    {strongWords.map((t) => (
                      <span key={t.word} style={{
                        padding: '6px 12px', borderRadius: 8,
                        background: `${COLORS.mint}1f`, border: `1px solid ${COLORS.mint}55`,
                        color: '#fff', fontSize: 14, display: 'inline-flex', gap: 8, alignItems: 'baseline',
                      }}>
                        <span>{t.word}</span>
                        <span style={{ color: COLORS.mint, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' }}>{t.tag}</span>
                      </span>
                    ))}
                  </div>
                </>
              )}

              {suggestedUpgrades.length > 0 && (
                <>
                  <div className="muted" style={{ fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10 }}>Suggested upgrades</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {suggestedUpgrades.map((s) => (
                      <div key={s.from || s.original} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                        borderRadius: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)',
                      }}>
                        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, textDecoration: 'line-through' }}>{s.from || s.original}</span>
                        <span style={{ color: COLORS.peach, fontSize: 14 }}>→</span>
                        <span style={{ color: COLORS.mint, fontSize: 14 }}>{s.to || s.suggestion}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div>
              <div className="muted" style={{ fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10 }}>Lexical metrics</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <MetricBar label="Unique words ratio" value={(lexicalMetrics.unique_words_ratio || 0) * 100} display={`${Math.round((lexicalMetrics.unique_words_ratio || 0) * 100)}%`} color={COLORS.mint} />
                <MetricBar label="Avg syllables / word" value={(lexicalMetrics.avg_syllables_per_word || 0) * 30} display={lexicalMetrics.avg_syllables_per_word || '—'} color={COLORS.lavender} />
                <MetricBar label="Domain precision" value={lexicalMetrics.domain_precision === 'High' ? 88 : lexicalMetrics.domain_precision === 'Medium' ? 55 : 25} display={lexicalMetrics.domain_precision || '—'} color={COLORS.peach} />
                <MetricBar label="Hedge words" value={Math.min((lexicalMetrics.hedge_word_count || 0) * 10, 100)} display={lexicalMetrics.hedge_word_count || 0} color={COLORS.sage} />
                <MetricBar label="Reading grade level" value={(lexicalMetrics.reading_grade_level || 0) * 5} display={lexicalMetrics.reading_grade_level || '—'} color={COLORS.mint} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript */}
      <div className="glass" style={{ marginTop: 20, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div className="muted" style={{ fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase' }}>Transcription</div>
          {fillerWords.length > 0 && (
            <div className="muted" style={{ fontSize: 12 }}>
              {fillerWords.reduce((sum, f) => sum + f.count, 0)} filler words detected
            </div>
          )}
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>
          {transcript}
        </p>
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 26 }}>
        <button onClick={() => navigate('/')} style={btnGhost}>Back home</button>
        <button onClick={() => navigate('/practice')} style={btnGhost}>↻ Replay & improve</button>
        <button onClick={() => navigate('/practice')} style={{
          padding: '12px 26px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: `linear-gradient(90deg, ${COLORS.lavender}, ${COLORS.mint})`,
          color: '#0b0b10', fontFamily: 'inherit', fontSize: 15,
          boxShadow: '0 8px 24px rgba(140,210,200,0.35)',
        }}>Next prompt →</button>
      </div>
    </div>
  );
}

function MetricBar({ label, value, display, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: 'rgba(255,255,255,0.78)' }}>{label}</span>
        <span style={{ color }}>{display}</span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: 'rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, boxShadow: `0 0 8px ${color}aa`, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function FeedbackRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '6px 0', alignItems: 'baseline' }}>
      <span style={{ color: COLORS.peach, fontSize: 18, width: 14, textAlign: 'center' }}>{icon}</span>
      <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)' }}>{text}</span>
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span style={{ padding: '4px 10px', borderRadius: 6, background: `${color}20`, border: `1px solid ${color}55`, color, fontSize: 12, letterSpacing: 0.4 }}>
      {children}
    </span>
  );
}

function CompositeRing({ value }) {
  const size = 180;
  const r = 78;
  const c = 2 * Math.PI * r;
  const id = useId();
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={COLORS.lavender} />
            <stop offset="100%" stopColor={COLORS.mint} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#g-${id})`} strokeWidth="6"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: 'drop-shadow(0 0 10px rgba(184,174,240,0.55))' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 56, lineHeight: 1 }}>{value}</div>
          <div className="muted" style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>/ 100</div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
        <span style={{ color }}>{label}</span>
        <span className="secondary">{value}</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: 'rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, boxShadow: `0 0 10px ${color}aa`, borderRadius: 999 }} />
      </div>
    </div>
  );
}