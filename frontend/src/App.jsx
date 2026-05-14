import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Nav from './components/Nav';
import Home from './pages/Home';
import Practice from './pages/Practice';
import Results from './pages/Results';
import SkillTree from './pages/SkillTree';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', color: 'rgba(255,255,255,0.5)' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'rgba(255,255,255,0.5)' }}>
        Loading Articulate...
      </div>
    );
  }

  return (
    <>
      {user && <Nav />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/skills" element={<ProtectedRoute><SkillTree /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}