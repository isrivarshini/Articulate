import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { COLORS, MODES } from '../constants/tokens';
import { getRandomPrompt, analyzeRecording } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useAudioRecorder from '../hooks/useAudioRecorder';
import Pill from '../components/Pill';
import Waveform from '../components/Waveform';

const btnGhost = {
  padding: '12px 22px', borderRadius: 10,
  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.14)',
  color: 'rgba(255,255,255,0.8)', fontFamily: 'inherit', fontSize: 15, cursor: 'pointer',
};

const btnFilled = (color) => ({
  padding: '12px 24px', borderRadius: 10,
  background: color, border: 'none', color: '#0b0b10',
  fontFamily: 'inherit', fontSize: 15, cursor: 'pointer',
  boxShadow: `0 0 24px ${color}55`,
});

export default function Practice() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const initialMode = location.state?.mode || 'scenarios';

  const [mode, setMode] = useState(initialMode);
  const [context, setContext] = useState('Technical');
  const [promptText, setPromptText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [micError, setMicError] = useState('');

  const { recording, audioBlob, error: recorderError, startRecording, stopRecording, resetRecording } = useAudioRecorder();

  const currentMode = MODES.find((m) => m.id === mode);
  const targetSec = 60;
  const progress = Math.min(elapsed / targetSec, 1);

  // Fetch a prompt when mode or context changes
  useEffect(() => {
    getRandomPrompt(mode, context)
      .then((data) => setPromptText(data.prompt || ''))
      .catch(() => setPromptText('Tell us something interesting. Speak naturally.'));
  }, [mode, context]);

  // Timer
  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setElapsed((e) => e + 0.1), 100);
    return () => clearInterval(t);
  }, [recording]);

  // Handle recorder errors
  useEffect(() => {
    if (recorderError) setMicError(recorderError);
  }, [recorderError]);

  const handleToggleRecording = async () => {
    if (recording) {
      stopRecording();
    } else {
      setElapsed(0);
      resetRecording();
      setMicError('');
      await startRecording();
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    setAnalyzing(true);
    try {
      const result = await analyzeRecording({
        audioBlob,
        mode,
        context,
        promptText,
      });
      await refreshUser(); // update XP/streak
      navigate('/results', { state: { analysis: result } });
    } catch (err) {
      setMicError(err.message || 'Analysis failed. Try again.');
      setAnalyzing(false);
    }
  };

  const fmt = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(Math.floor(s) % 60).toString().padStart(2, '0')}`;

  return (
    <div className="page" style={{ paddingTop: 16 }}>
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        {MODES.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{
            padding: '8px 18px', borderRadius: 8,
            border: `1px solid ${mode === m.id ? m.color : 'rgba(255,255,255,0.14)'}`,
            background: mode === m.id ? `${m.color}25` : 'rgba(0,0,0,0.22)',
            color: mode === m.id ? '#fff' : 'rgba(255,255,255,0.6)',
            fontFamily: 'inherit', fontSize: 14, cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}>{m.name}</button>
        ))}
      </div>

      {/* Context filter */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 38, flexWrap: 'wrap' }}>
        {['Technical', 'Work', 'Presentations', 'Interviews', 'Social', 'Content Creation'].map((c) => (
          <Pill key={c} active={context === c} color={currentMode.color} onClick={() => setContext(c)}>
            {c}
          </Pill>
        ))}
      </div>

      {/* Prompt */}
      <div style={{ maxWidth: 860, margin: '0 auto 38px', textAlign: 'center' }}>
        <div style={{ color: currentMode.color, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
          {currentMode.name} · {context}
        </div>
        <div style={{ fontSize: 30, lineHeight: 1.35, color: 'rgba(255,255,255,0.96)', textWrap: 'balance' }}>
          "{promptText || 'Loading prompt...'}"
        </div>
      </div>

      {/* Error message */}
      {micError && (
        <div style={{
          maxWidth: 600, margin: '0 auto 20px', padding: '12px 16px', borderRadius: 10,
          background: `${COLORS.peach}22`, border: `1px solid ${COLORS.peach}55`,
          color: COLORS.peach, fontSize: 14, textAlign: 'center',
        }}>
          {micError}
        </div>
      )}

      {/* Timer ring + record button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
        <RecordButton recording={recording} progress={progress} color={currentMode.color}
          onClick={handleToggleRecording} />
        <div style={{ marginTop: 18, fontSize: 22, color: 'rgba(255,255,255,0.9)', fontVariantNumeric: 'tabular-nums' }}>
          {fmt(elapsed)} <span className="muted" style={{ fontSize: 16 }}>/ {fmt(targetSec)}</span>
        </div>
        <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>
          {recording ? 'Listening… speak naturally.' : audioBlob ? 'Recording complete. Analyze or re-record.' : 'Tap to start recording.'}
        </div>
      </div>

      {/* Live waveform */}
      <Waveform recording={recording} color={currentMode.color} />

      {/* Action row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 32 }}>
        <button onClick={() => navigate('/')} style={btnGhost}>Cancel</button>
        {audioBlob && !recording && (
          <>
            <button onClick={() => { resetRecording(); setElapsed(0); }} style={btnGhost}>
              ↻ Re-record
            </button>
            <button onClick={handleAnalyze} disabled={analyzing}
              style={{ ...btnFilled(currentMode.color), opacity: analyzing ? 0.6 : 1 }}>
              {analyzing ? 'Analyzing...' : 'End & analyze →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function RecordButton({ recording, progress, color, onClick }) {
  const size = 168;
  const r = 78;
  const c = 2 * Math.PI * r;

  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: '50%',
      background: 'transparent', border: 'none', cursor: 'pointer',
      position: 'relative', padding: 0,
    }}>
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 0.1s linear' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 14, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, ${color}, ${color}aa 60%, ${color}55)`,
        display: 'grid', placeItems: 'center',
        boxShadow: `0 0 60px ${color}88, inset 0 0 40px rgba(255,255,255,0.15)`,
        animation: recording ? 'pulse 1.4s ease-in-out infinite' : 'none',
      }}>
        {recording
          ? <div style={{ width: 28, height: 28, background: '#0b0b10', borderRadius: 4 }} />
          : <div style={{ width: 0, height: 0, borderLeft: '22px solid #0b0b10', borderTop: '14px solid transparent', borderBottom: '14px solid transparent', marginLeft: 6 }} />}
      </div>
    </button>
  );
}