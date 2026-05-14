import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/tokens';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({ email, username, password });
      } else {
        await login({ email, password });
      }
      await refreshUser();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '80vh', paddingTop: 40,
    }}>
      <div className="glass" style={{
        padding: '40px 36px', maxWidth: 420, width: '100%',
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 400, textAlign: 'center', marginBottom: 8 }}>
          {isRegister ? 'Create account' : 'Welcome back'}
        </h1>
        <p className="muted" style={{ textAlign: 'center', fontSize: 14, marginBottom: 28 }}>
          {isRegister ? 'Start your speaking journey.' : 'Pick up where you left off.'}
        </p>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, marginBottom: 16,
            background: `${COLORS.peach}22`, border: `1px solid ${COLORS.peach}55`,
            color: COLORS.peach, fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          {isRegister && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
            />
          )}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: `linear-gradient(90deg, ${COLORS.lavender}, ${COLORS.mint})`,
              color: '#0b0b10', fontFamily: 'inherit', fontSize: 16,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Loading...' : isRegister ? 'Sign up' : 'Log in'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{
              background: 'none', border: 'none', color: COLORS.lavender,
              fontFamily: 'inherit', fontSize: 14, cursor: 'pointer',
            }}
          >
            {isRegister ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '12px 14px', borderRadius: 10,
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.14)',
  color: '#fff', fontFamily: 'inherit', fontSize: 15,
  outline: 'none',
};