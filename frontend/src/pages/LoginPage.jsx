import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bug, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', senha: '' });
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.login, form.senha);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      {/* Decorative background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,168,76,.06) 0%, transparent 70%)',
      }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)',
            marginBottom: 16,
          }}>
            <Bug size={26} color="var(--gold)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--text)', marginBottom: 4 }}>
            Hotel do Mosquito
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>Sistema de Gerenciamento</p>
        </div>

        {/* Card */}
        <div className="card" style={{ border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Login</label>
              <input
                type="text"
                placeholder="seu.login"
                value={form.login}
                onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="field">
              <label>Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.senha}
                  onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                  style={{ paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowSenha(s => !s)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)',
                }}>
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(192,57,43,.15)', border: '1px solid rgba(231,76,60,.3)',
                borderRadius: 6, padding: '10px 14px', marginBottom: 14,
                fontSize: 13, color: '#e74c3c',
              }}>
                {error}
              </div>
            )}

            <button className="btn btn-gold" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 4 }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Hint */}
        <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.1)', borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Logins de teste</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { login: 'marcos.gerente', senha: 'Gerente123', perfil: 'Gerente' },
              { login: 'patricia.gerente', senha: 'Gerente123', perfil: 'Gerente' },
              { login: 'rafael.recepc', senha: 'Recepc123', perfil: 'Recepcionista' },
            ].map(u => (
              <button key={u.login} type="button" onClick={() => setForm({ login: u.login, senha: u.senha })}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '4px 0', color: 'var(--text2)', fontSize: 12,
                }}>
                <span style={{ fontFamily: 'monospace' }}>{u.login}</span>
                <span className={`badge ${u.perfil === 'Gerente' ? 'badge-yellow' : 'badge-blue'}`}>{u.perfil}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
