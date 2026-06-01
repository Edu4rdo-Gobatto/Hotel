import { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, BedDouble, DollarSign } from 'lucide-react';

const TABS = ['ocupacao', 'top-clientes', 'top-quartos', 'faturamento'];
const TAB_LABEL = { ocupacao: 'Taxa de Ocupação', 'top-clientes': 'Top Clientes', 'top-quartos': 'Top Quartos', faturamento: 'Faturamento' };
const TAB_ICON = { ocupacao: TrendingUp, 'top-clientes': Users, 'top-quartos': BedDouble, faturamento: DollarSign };

const GOLD = '#c9a84c';

export function RelatoriosPage() {
  const [tab, setTab] = useState('ocupacao');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      let url = `/relatorios/${tab}`;
      if (tab === 'ocupacao' || tab === 'faturamento') url += `?mes=${mes}&ano=${ano}`;
      const { data: d } = await api.get(url);
      setData(d);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Acesso restrito a Gerentes.');
      } else {
        toast.error('Erro ao carregar relatório.');
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab, mes, ano]);

  const renderContent = () => {
    if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>Carregando...</div>;
    if (!data.length) return <div className="empty-state"><p>Nenhum dado encontrado para o período.</p></div>;

    if (tab === 'ocupacao') {
      const row = data[0] || {};
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, padding: 20 }}>
          {Object.entries(row).map(([k, v]) => (
            <div key={k} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>
                {typeof v === 'number' ? (k.toLowerCase().includes('taxa') ? `${parseFloat(v).toFixed(1)}%` : v) : v}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4, textTransform: 'capitalize' }}>
                {k.replace(/_/g, ' ')}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (tab === 'faturamento') {
      return (
        <div style={{ padding: 20 }}>
          {data.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
              {Object.entries(row).map(([k, v]) => (
                <div key={k} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>
                    {k.toLowerCase().includes('valor') || k.toLowerCase().includes('total') || k.toLowerCase().includes('receita')
                      ? `R$ ${parseFloat(v || 0).toFixed(2)}` : v}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4, textTransform: 'capitalize' }}>
                    {k.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (tab === 'top-clientes') {
      const key = Object.keys(data[0]).find(k => k.toLowerCase().includes('nome') || k === 'Cliente') || Object.keys(data[0])[0];
      const valKey = Object.keys(data[0]).find(k => k.toLowerCase().includes('diaria') || k.toLowerCase().includes('total') || k.toLowerCase().includes('qtd')) || Object.keys(data[0])[1];
      return (
        <div style={{ padding: 20 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fill: 'var(--text3)', fontSize: 12 }} />
              <YAxis type="category" dataKey={key} width={150} tick={{ fill: 'var(--text2)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              <Bar dataKey={valKey} radius={[0, 4, 4, 0]}>
                {data.map((_, i) => <Cell key={i} fill={GOLD} opacity={1 - i * 0.06} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (tab === 'top-quartos') {
      const key = Object.keys(data[0]).find(k => k.toLowerCase().includes('numero') || k === 'Quarto') || Object.keys(data[0])[0];
      const valKey = Object.keys(data[0]).find(k => k.toLowerCase().includes('reserva') || k.toLowerCase().includes('total') || k.toLowerCase().includes('qtd')) || Object.keys(data[0])[1];
      return (
        <div style={{ padding: 20 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ left: 10 }}>
              <XAxis dataKey={key} tick={{ fill: 'var(--text3)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              <Bar dataKey={valKey} radius={[4, 4, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={GOLD} opacity={1 - i * 0.06} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
  };

  return (
    <div>
      <ToastContainer toasts={toast.toasts} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Área restrita — Gerência</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const Icon = TAB_ICON[t];
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`btn ${tab === t ? 'btn-gold' : 'btn-outline'}`}
              style={{ fontSize: 13 }}>
              <Icon size={14} /> {TAB_LABEL[t]}
            </button>
          );
        })}
      </div>

      {/* Filtro mês/ano */}
      {(tab === 'ocupacao' || tab === 'faturamento') && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-end' }}>
          <div style={{ width: 140 }}>
            <label>Mês</label>
            <select value={mes} onChange={e => setMes(+e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div style={{ width: 100 }}>
            <label>Ano</label>
            <input type="number" value={ano} onChange={e => setAno(+e.target.value)} min="2020" max="2030" />
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, minHeight: 200 }}>
        {renderContent()}
      </div>
    </div>
  );
}
