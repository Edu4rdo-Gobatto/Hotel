import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Lock } from 'lucide-react';

export function CheckOutPage() {
  const { isGerente } = useAuth();
  const [hospedagens, setHospedagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [resultado, setResultado] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/hospedagens/ativas');
      setHospedagens(data);
    } catch { toast.error('Erro ao carregar hospedagens.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCheckOut = async (id) => {
    setProcessing(id);
    try {
      const { data } = await api.post(`/hospedagens/${id}/checkout`);
      setResultado({ id, ...data.resultado });
      toast.success('Check-out realizado!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao realizar check-out.');
    } finally { setProcessing(null); }
  };

  return (
    <div>
      <ToastContainer toasts={toast.toasts} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Check-out</h1>
          <p className="page-subtitle">Hospedagens em andamento</p>
        </div>
      </div>

      {resultado && (
        <div className="card" style={{ marginBottom: 20, borderColor: (resultado.valor_total ?? resultado.Valor_Total) ? 'rgba(201,168,76,.3)' : 'var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>
                Check-out Realizado — Hospedagem #{resultado.id_hospedagem ?? resultado.ID_Hospedagem ?? resultado.id}
              </div>
              {(resultado.valor_total ?? resultado.Valor_Total) != null ? (
                <div style={{ fontSize: 24, color: 'var(--gold)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                  R$ {parseFloat(resultado.valor_total ?? resultado.Valor_Total).toFixed(2)}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', fontSize: 13 }}>
                  <Lock size={14} />
                  Valor restrito — disponível apenas para Gerentes
                </div>
              )}
            </div>
            <button className="btn btn-outline" onClick={() => setResultado(null)}>Fechar</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Carregando...</div>
        ) : hospedagens.length === 0 ? (
          <div className="empty-state">
            <LogOut size={32} />
            <p>Nenhuma hospedagem ativa no momento.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#Hosp.</th><th>Cliente</th><th>Quarto</th>
                  <th>Check-in Real</th>
                  {isGerente && <th>Valor Estimado</th>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {hospedagens.map(h => {
                  const id = h.id_hospedagem ?? h.ID_Hospedagem;
                  return (
                  <tr key={id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text3)' }}>#{id}</td>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{h.nome_cliente ?? h.Nome_Cliente ?? h.Cliente ?? '—'}</td>
                    <td>{h.numero_quarto ?? h.Numero_Quarto ?? h.Quarto ?? '—'}</td>
                    <td>{(h.data_checkin_real ?? h.Data_Checkin_Real) ? new Date(h.data_checkin_real ?? h.Data_Checkin_Real).toLocaleDateString('pt-BR') : '—'}</td>
                    {isGerente && (
                      <td style={{ color: 'var(--gold)' }}>
                        {(h.valor_total_diarias ?? h.Valor_Total_Diarias) ? `R$ ${parseFloat(h.valor_total_diarias ?? h.Valor_Total_Diarias).toFixed(2)}` : '—'}
                      </td>
                    )}
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: 12, padding: '6px 14px', borderColor: 'var(--danger)', color: 'var(--danger-light)' }}
                        disabled={processing === id}
                        onClick={() => handleCheckOut(id)}
                      >
                        <LogOut size={14} />
                        {processing === id ? 'Processando...' : 'Check-out'}
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
