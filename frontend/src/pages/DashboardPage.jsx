import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BedDouble, Users, CalendarCheck, TrendingUp, Clock, CheckCircle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color = 'var(--gold)', sub }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 8,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
          {value ?? '—'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user, isGerente } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [ativas, setAtivas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [hospRes, quartosRes, reservasRes, clientesRes] = await Promise.all([
          api.get('/hospedagens/ativas'),
          api.get('/quartos'),
          api.get('/reservas'),
          api.get('/clientes'),
        ]);
        const hospedagens = hospRes.data;
        const quartos = quartosRes.data;
        const reservas = reservasRes.data;
        const clientes = clientesRes.data;
        setAtivas(hospedagens.slice(0, 5));
        setStats({
          ocupados: quartos.filter(q => q.status === 'Ocupado').length,
          disponiveis: quartos.filter(q => ['Disponivel', 'Disponível', 'Limpo'].includes(q.status)).length,
          totalQuartos: quartos.length,
          reservasAtivas: reservas.filter(r => r.Status === 'Confirmada').length,
          totalClientes: clientes.length,
          hospedagensAtivas: hospedagens.length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Olá, {user?.nome?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => navigate('/checkin')}>
            Check-in
          </button>
          <button className="btn btn-gold" onClick={() => navigate('/reservas')}>
            Nova Reserva
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text3)', padding: 40, textAlign: 'center' }}>Carregando...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard icon={BedDouble} label="Quartos Ocupados" value={stats.ocupados} color="var(--danger-light)"
              sub={`de ${stats.totalQuartos} quartos`} />
            <StatCard icon={CheckCircle} label="Disponíveis" value={stats.disponiveis} color="var(--success)"
              sub="prontos para reserva" />
            <StatCard icon={Clock} label="Hospedagens Ativas" value={stats.hospedagensAtivas} color="var(--info)" />
            <StatCard icon={CalendarCheck} label="Reservas Confirmadas" value={stats.reservasAtivas} color="var(--gold)" />
            <StatCard icon={Users} label="Clientes Cadastrados" value={stats.totalClientes} color="var(--text2)" />
          </div>

          {/* Hospedagens ativas */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)' }}>
                Hospedagens em Andamento
              </h2>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/checkout')}>
                Ver todas →
              </button>
            </div>
            {ativas.length === 0 ? (
              <div className="empty-state"><p>Nenhuma hospedagem ativa no momento.</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Quarto</th>
                      <th>Check-in</th>
                      <th>Valor Estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ativas.map(h => (
                      <tr key={h.ID_Hospedagem}>
                        <td style={{ color: 'var(--text)' }}>{h.Nome_Cliente || h.Cliente || '—'}</td>
                        <td>{h.Numero_Quarto || h.Quarto || '—'}</td>
                        <td>{h.Data_Checkin_Real ? new Date(h.Data_Checkin_Real).toLocaleDateString('pt-BR') : '—'}</td>
                        <td style={{ color: 'var(--gold)' }}>
                          {h.Valor_Total_Diarias != null
                            ? `R$ ${parseFloat(h.Valor_Total_Diarias).toFixed(2)}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {isGerente && (
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-outline" onClick={() => navigate('/relatorios')} style={{ gap: 8 }}>
                <TrendingUp size={15} />
                Acessar Relatórios Gerenciais
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
