import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';

const EMPTY = { nome: '', cpf: '', email: '', telefone: '', endereco: '' };

function formatCPF(v) {
  return v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14);
}
function formatTel(v) {
  return v.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
}

export function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/clientes', busca ? { params: { busca } } : {});
      setClientes(data);
    } catch { toast.error('Erro ao carregar clientes.'); }
    finally { setLoading(false); }
  }, [busca]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal('edit'); };
  const openEdit = (c) => {
    setForm({ nome: c.nome || '', cpf: c.cpf || '', email: c.email || '', telefone: c.telefone || '', endereco: c.endereco || '' });
    setEditId(c.id);
    setModal('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, cpf: form.cpf.replace(/\D/g, '') };
      if (editId) {
        await api.put(`/clientes/${editId}`, payload);
        toast.success('Cliente atualizado.');
      } else {
        await api.post('/clientes', payload);
        toast.success('Cliente criado.');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/clientes/${deleteId}`);
      toast.success('Cliente excluído.');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao excluir.');
    }
  };

  return (
    <div>
      <ToastContainer toasts={toast.toasts} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">{clientes.length} clientes cadastrados</p>
        </div>
        <button className="btn btn-gold" onClick={openCreate}><Plus size={15} /> Novo Cliente</button>
      </div>

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
        <input
          style={{ paddingLeft: 36 }}
          placeholder="Buscar por nome ou CPF..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        {busca && (
          <button onClick={() => setBusca('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
            <X size={14} />
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Carregando...</div>
        ) : clientes.length === 0 ? (
          <div className="empty-state"><p>Nenhum cliente encontrado.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{c.nome}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.cpf}</td>
                    <td>{c.email || <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td>{c.telefone || <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => openEdit(c)}><Pencil size={14} /></button>
                        <button className="btn btn-ghost" style={{ padding: '4px 8px', color: 'var(--danger-light)' }} onClick={() => setDeleteId(c.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal criar/editar */}
      {modal === 'edit' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Nome *</label>
                <input required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>CPF *</label>
                  <input required value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: formatCPF(e.target.value) }))} placeholder="000.000.000-00" />
                </div>
                <div className="field">
                  <label>Telefone</label>
                  <input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: formatTel(e.target.value) }))} placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="field">
                <label>E-mail</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="field">
                <label>Endereço</label>
                <input value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <h2 className="modal-title">Confirmar Exclusão</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
