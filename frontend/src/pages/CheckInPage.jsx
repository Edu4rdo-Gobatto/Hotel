import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { LogIn } from 'lucide-react';

export function CheckInPage() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reservas');
      // Apenas reservas confirmadas que ainda não tiveram check-in
      setReservas(data.filter(r => (r.status ?? r.Status) === 'Confirmada'));
    } catch { toast.error('Erro ao carregar reservas.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCheckIn = async (id) => {
    setProcessing(id);
    try {
      const { data } = await api.post('/hospedagens/checkin', { id_reserva: id });
      toast.success(`Check-in realizado! ${data.hospedagem ? `Hospedagem #${data.hospedagem.ID_Hospedagem || ''}` : ''}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao realizar check-in.');
    } finally { setProcessing(null); }
  };

  return (
    <div>
      <ToastContainer toasts={toast.toasts} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Check-in</h1>
          <p className="page-subtitle">Reservas confirmadas aguardando entrada</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Carregando...</div>
        ) : reservas.length === 0 ? (
          <div className="empty-state">
            <LogIn size={32} />
            <p>Nenhuma reserva aguardando check-in.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Cliente</th><th>Quarto</th>
                  <th>Check-in Previsto</th><th>Check-out Previsto</th><th></th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(r => {
                  const id = r.id_reserva ?? r.ID_Reserva ?? r.id;
                  const checkinPrev = r.data_checkin_prev ?? r.Data_Checkin_Prev;
                  const checkoutPrev = r.data_checkout_prev ?? r.Data_Checkout_Prev;
                  return (
                    <tr key={id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text3)' }}>#{id}</td>
                      <td style={{ color: 'var(--text)', fontWeight: 500 }}>{r.nome_cliente ?? r.Nome_Cliente ?? r.Cliente ?? '—'}</td>
                      <td>{r.numero_quarto ?? r.Numero_Quarto ?? r.Quarto ?? '—'}</td>
                      <td style={{ color: new Date(checkinPrev) < new Date() ? 'var(--danger-light)' : 'var(--text2)' }}>
                        {checkinPrev ? new Date(checkinPrev).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td>{checkoutPrev ? new Date(checkoutPrev).toLocaleDateString('pt-BR') : '—'}</td>
                      <td>
                        <button
                          className="btn btn-gold"
                          style={{ fontSize: 12, padding: '6px 14px' }}
                          disabled={processing === id}
                          onClick={() => handleCheckIn(id)}
                        >
                          <LogIn size={14} />
                          {processing === id ? 'Processando...' : 'Realizar Check-in'}
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
