import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Pencil, Trash2, DollarSign } from 'lucide-react';

const STATUS_BADGE = {
  'Disponivel': 'badge-green', 'Disponível': 'badge-green',
  'Ocupado': 'badge-red', 'Limpo': 'badge-green',
  'Manutencao': 'badge-yellow', 'Manutenção': 'badge-yellow',
  'Reservado': 'badge-blue',
};

export function QuartosPage() {
  const { isGerente } = useAuth();
  const [quartos, setQuartos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ numero: '', andar: '', capacidade: 2, status: 'Disponivel', id_categoria: '', preco_diaria: '' });
  const [precoModal, setPrecoModal] = useState(null);
  const [novoPreco, setNovoPreco] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [qRes] = await Promise.all([api.get('/quartos')]);
      setQuartos(qRes.data);
      // Categorias via quartos (extrair únicos)
      const cats = [...new Map(qRes.data.map(q => [q.id_categoria, { id: q.id_categoria, nome: q.categoria }])).values()];
      setCategorias(cats);
    } catch { toast.error('Erro ao carregar quartos.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form._editing) {
        await api.put(`/quartos/${form.numero}`, form);
        toast.success('Quarto atualizado.');
      } else {
        await api.post('/quartos', form);
        toast.success('Quarto criado.');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar.');
    } finally { setSaving(false); }
  };

  const handlePreco = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/quartos/${precoModal}/preco`, { preco_diaria: novoPreco });
      toast.success('Preço atualizado. Histórico registrado.');
      setPrecoModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao atualizar preço.');
    }
  };

  return (
    <div>
      <ToastContainer toasts={toast.toasts} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Quartos</h1>
          <p className="page-subtitle">{quartos.length} quartos cadastrados</p>
        </div>
        {isGerente && (
          <button className="btn btn-gold" onClick={() => { setForm({ numero: '', andar: '', capacidade: 2, status: 'Disponivel', id_categoria: '', preco_diaria: '' }); setModal('edit'); }}>
            <Plus size={15} /> Novo Quarto
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Carregando...</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nº</th><th>Andar</th><th>Categoria</th><th>Capacidade</th>
                  <th>Diária</th><th>Status</th>
                  {isGerente && <th style={{ width: 100 }}></th>}
                </tr>
              </thead>
              <tbody>
                {quartos.map(q => (
                  <tr key={q.numero}>
                    <td style={{ color: 'var(--text)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{q.numero}</td>
                    <td>{q.andar}º</td>
                    <td>{q.categoria || '—'}</td>
                    <td>{q.capacidade} pax</td>
                    <td style={{ color: 'var(--gold)' }}>
                      {q.preco_diaria ? `R$ ${parseFloat(q.preco_diaria).toFixed(2)}` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[q.status] || 'badge-gray'}`}>{q.status}</span>
                    </td>
                    {isGerente && (
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost" style={{ padding: '4px 8px' }} title="Atualizar preço" onClick={() => { setPrecoModal(q.numero); setNovoPreco(q.preco_diaria || ''); }}>
                            <DollarSign size={14} />
                          </button>
                          <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => {
                            setForm({ ...q, id_categoria: q.id_categoria, preco_diaria: q.preco_diaria, _editing: true });
                            setModal('edit');
                          }}><Pencil size={14} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal quarto */}
      {modal === 'edit' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{form._editing ? 'Editar Quarto' : 'Novo Quarto'}</h2>
            <form onSubmit={handleSave}>
              <div className="field-row">
                <div className="field">
                  <label>Número *</label>
                  <input required type="number" value={form.numero} disabled={form._editing}
                    onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Andar *</label>
                  <input required type="number" value={form.andar}
                    onChange={e => setForm(f => ({ ...f, andar: e.target.value }))} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Capacidade</label>
                  <input type="number" min="1" value={form.capacidade}
                    onChange={e => setForm(f => ({ ...f, capacidade: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Diária (R$) *</label>
                  <input required type="number" step="0.01" value={form.preco_diaria}
                    onChange={e => setForm(f => ({ ...f, preco_diaria: e.target.value }))} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Categoria *</label>
                  <select required value={form.id_categoria}
                    onChange={e => setForm(f => ({ ...f, id_categoria: e.target.value }))}>
                    <option value="">Selecione...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {['Disponivel', 'Ocupado', 'Limpo', 'Manutencao', 'Reservado'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal preço */}
      {precoModal && (
        <div className="modal-overlay" onClick={() => setPrecoModal(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Atualizar Preço — Quarto {precoModal}</h2>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>
              O histórico de preços será registrado automaticamente via trigger.
            </p>
            <form onSubmit={handlePreco}>
              <div className="field">
                <label>Nova Diária (R$)</label>
                <input required type="number" step="0.01" value={novoPreco}
                  onChange={e => setNovoPreco(e.target.value)} autoFocus />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setPrecoModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-gold">Atualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
