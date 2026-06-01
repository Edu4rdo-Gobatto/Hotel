import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, BedDouble, CalendarCheck,
  LogIn, LogOut, ShoppingCart, BarChart3, ChevronRight,
  UserCog, Bug
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/quartos', icon: BedDouble, label: 'Quartos' },
  { to: '/reservas', icon: CalendarCheck, label: 'Reservas' },
  { to: '/checkin', icon: LogIn, label: 'Check-in' },
  { to: '/checkout', icon: LogOut, label: 'Check-out' },
  { to: '/consumos', icon: ShoppingCart, label: 'Consumos' },
];

const gerenteItems = [
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { to: '/funcionarios', icon: UserCog, label: 'Funcionários' },
];

export function Sidebar() {
  const { user, logout, isGerente } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bug size={22} color="var(--gold)" />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text)', lineHeight: 1.2 }}>
              Hotel do
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--gold)', lineHeight: 1.2 }}>
              Mosquito
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 20 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={navStyle}>
              {({ isActive }) => (
                <span style={linkInner(isActive)}>
                  <Icon size={16} />
                  {label}
                  {isActive && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {isGerente && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', letterSpacing: '.1em', textTransform: 'uppercase', padding: '8px 12px 4px' }}>
              Gerência
            </div>
            {gerenteItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} style={navStyle}>
                {({ isActive }) => (
                  <span style={linkInner(isActive)}>
                    <Icon size={16} />
                    {label}
                    {isActive && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <div style={{ padding: '8px 12px', marginBottom: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.nome?.split(' ')[0]}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user?.perfil}</div>
        </div>
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }} onClick={handleLogout}>
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  );
}

const navStyle = { display: 'block', textDecoration: 'none', marginBottom: 2 };
const linkInner = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 12px',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: isActive ? 600 : 400,
  color: isActive ? 'var(--gold)' : 'var(--text2)',
  background: isActive ? 'rgba(201,168,76,.08)' : 'transparent',
  cursor: 'pointer',
  transition: 'all .15s',
});
