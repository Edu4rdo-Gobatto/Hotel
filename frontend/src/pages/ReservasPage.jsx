import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { Plus, Trash2 } from 'lucide-react';

const STATUS_BADGE = {
  'Confirmada': 'badge-green', 'Pendente': 'badge-yellow',
  'Cancelada': 'badge-red', 'Concluida': 'badge-gray', 'Concluída': 'badge-gray',
  'CheckIn': 'badge-blue',
};

export function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [quartos, setQuartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ id_cliente: '', id_quarto: '', data_checkin_prev: '', data_checkout_prev: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [rRes, cRes, qRes] = await Promise.all([
        api.get('/reservas'),
        api.get('/clientes'),
        api.get('/quartos/disponiveis'),
      ]);
      setReservas(rRes.data);
      setClientes(cRes.data);
      setQuartos(qRes.data);
    } catch { toast.error('Erro ao carregar dados.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/reservas', form);
      toast.success('Reserva criada com sucesso!');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar reserva.');
    } finally { setSaving(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancelar esta reserva?')) return;
    try {
      await api.delete(`/reservas/${id}`);
      toast.success('Reserva cancelada.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao cancelar.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <ToastContainer toasts={toast.toasts} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Reservas</h1>
          <p className="page-subtitle">{reservas.length} reservas no sistema</p>
        </div>
        <button className="btn btn-gold" onClick={() => setModal(true)}><Plus size={15} /> Nova Reserva</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Carregando...</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Cliente</th><th>Quarto</th>
                  <th>Check-in Prev.</th><th>Check-out Prev.</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(r => {
                  const id = r.id_reserva ?? r.ID_Reserva;
                  const status = r.status ?? r.Status;
                  return (
                    <tr key={id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text3)' }}>#{id}</td>
                      <td style={{ color: 'var(--text)', fontWeight: 500 }}>{r.nome_cliente ?? r.Nome_Cliente ?? r.Cliente ?? '—'}</td>
                      <td>{r.numero_quarto ?? r.Numero_Quarto ?? r.Quarto ?? '—'}</td>
                      <td>{(r.data_checkin_prev ?? r.Data_Checkin_Prev) ? new Date(r.data_checkin_prev ?? r.Data_Checkin_Prev).toLocaleDateString('pt-BR') : '—'}</td>
                      <td>{(r.data_checkout_prev ?? r.Data_Checkout_Prev) ? new Date(r.data_checkout_prev ?? r.Data_Checkout_Prev).toLocaleDateString('pt-BR') : '—'}</td>
                      <td><span className={`badge ${STATUS_BADGE[status] || 'badge-gray'}`}>{status}</span></td>
                      <td>
                        {status === 'Confirmada' && (
                          <button className="btn btn-ghost" style={{ padding: '4px 8px', color: 'var(--danger-light)' }}
                            onClick={() => handleCancel(id)}><Trash2 size={14} /></button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Nova Reserva</h2>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Cliente *</label>
                <select required value={form.id_cliente} onChange={e => setForm(f => ({ ...f, id_cliente: e.target.value }))}>
                  <option value="">Selecione o cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome} — {c.cpf}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Quarto (disponíveis) *</label>
                <select required value={form.id_quarto} onChange={e => setForm(f => ({ ...f, id_quarto: e.target.value }))}>
                  <option value="">Selecione o quarto...</option>
                  {quartos.map(q => (
                    <option key={q.numero} value={q.numero}>
                      Quarto {q.numero} — {q.categoria} — R$ {parseFloat(q.preco_diaria || 0).toFixed(2)}/dia
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Check-in Previsto *</label>
                  <input required type="date" min={today} value={form.data_checkin_prev}
                    onChange={e => setForm(f => ({ ...f, data_checkin_prev: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Check-out Previsto *</label>
                  <input required type="date" min={form.data_checkin_prev || today} value={form.data_checkout_prev}
                    onChange={e => setForm(f => ({ ...f, data_checkout_prev: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Criando...' : 'Criar Reserva'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
