import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { Plus, Trash2 } from 'lucide-react';

export function ConsumosPage() {
  const [hospedagens, setHospedagens] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [consumos, setConsumos] = useState([]);
  const [hospSel, setHospSel] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ id_produto_servico: '', quantidade: 1 });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [hRes, pRes] = await Promise.all([api.get('/hospedagens/ativas'), api.get('/consumos/produtos')]);
        setHospedagens(hRes.data);
        setProdutos(pRes.data);
      } catch { toast.error('Erro ao carregar dados.'); }
    }
    load();
  }, []);

  const loadConsumos = useCallback(async (id) => {
    if (!id) { setConsumos([]); return; }
    try {
      const { data } = await api.get(`/consumos/hospedagem/${id}`);
      setConsumos(data);
    } catch { toast.error('Erro ao carregar consumos.'); }
  }, []);

  useEffect(() => { loadConsumos(hospSel); }, [hospSel, loadConsumos]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/consumos', { id_hospedagem: hospSel, ...form });
      toast.success('Consumo lançado.');
      setModal(false);
      setForm({ id_produto_servico: '', quantidade: 1 });
      loadConsumos(hospSel);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao lançar consumo.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir este consumo?')) return;
    try {
      await api.delete(`/consumos/${id}`);
      toast.success('Consumo excluído.');
      loadConsumos(hospSel);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao excluir.');
    }
  };

  const totalConsumos = consumos.reduce((acc, c) => acc + parseFloat(c.Subtotal || c.Total || c.Valor || 0), 0);

  return (
    <div>
      <ToastContainer toasts={toast.toasts} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Consumos</h1>
          <p className="page-subtitle">Frigobar, restaurante, lavanderia</p>
        </div>
        {hospSel && (
          <button className="btn btn-gold" onClick={() => setModal(true)}><Plus size={15} /> Lançar Consumo</button>
        )}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="field">
          <label>Selecionar Hospedagem Ativa</label>
          <select value={hospSel} onChange={e => setHospSel(e.target.value)}>
            <option value="">Selecione uma hospedagem...</option>
            {hospedagens.map(h => (
              <option key={h.ID_Hospedagem} value={h.ID_Hospedagem}>
                #{h.ID_Hospedagem} — {h.Nome_Cliente || h.Cliente || '—'} (Quarto {h.Numero_Quarto || h.Quarto})
              </option>
            ))}
          </select>
        </div>
      </div>

      {hospSel && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text)' }}>Lançamentos</span>
            {totalConsumos > 0 && (
              <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Total: R$ {totalConsumos.toFixed(2)}</span>
            )}
          </div>
          {consumos.length === 0 ? (
            <div className="empty-state"><p>Nenhum consumo lançado ainda.</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Produto/Serviço</th><th>Tipo</th><th>Qtd</th><th>Data/Hora</th><th>Subtotal</th><th></th></tr>
                </thead>
                <tbody>
                  {consumos.map(c => (
                    <tr key={c.ID_Consumo}>
                      <td style={{ color: 'var(--text)' }}>{c.Nome_Produto || c.Produto || '—'}</td>
                      <td><span className="badge badge-gray">{c.Tipo || '—'}</span></td>
                      <td>{c.Quantidade}</td>
                      <td style={{ fontSize: 12 }}>
                        {c.Data_Hora ? new Date(c.Data_Hora).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td style={{ color: 'var(--gold)' }}>
                        R$ {parseFloat(c.Subtotal || c.Total || 0).toFixed(2)}
                      </td>
                      <td>
                        <button className="btn btn-ghost" style={{ padding: '4px 8px', color: 'var(--danger-light)' }}
                          onClick={() => handleDelete(c.ID_Consumo)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Lançar Consumo</h2>
            <form onSubmit={handleAdd}>
              <div className="field">
                <label>Produto / Serviço *</label>
                <select required value={form.id_produto_servico}
                  onChange={e => setForm(f => ({ ...f, id_produto_servico: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {produtos.map(p => (
                    <option key={p.ID_Produto_Servico} value={p.ID_Produto_Servico}>
                      {p.Nome} — {p.Tipo} — R$ {parseFloat(p.Preco_Venda || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Quantidade *</label>
                <input required type="number" min="1" value={form.quantidade}
                  onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Lançando...' : 'Lançar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
