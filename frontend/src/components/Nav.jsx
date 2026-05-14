import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'practice', label: 'Practice', path: '/practice' },
  { id: 'skills', label: 'Skills', path: '/skills' },
  { id: 'rank', label: 'Rank', path: '/leaderboard' },
  { id: 'profile', label: 'Profile', path: '/profile' },
];

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = NAV_ITEMS.find((item) => item.path === location.pathname)?.id
    || (location.pathname === '/results' ? 'practice' : 'home');

  return (
    <nav className="nav">
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span>Articulate</span>
      </div>
      <div className="tabs">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={'tab ' + (currentTab === item.id ? 'active' : '')}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}