import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const EMPTY = { nome: '', cpf: '', cargo: '', login: '', senha: '', perfil: 'Recepcionista' };

export function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/funcionarios');
      setFuncionarios(data);
    } catch { toast.error('Erro ao carregar funcionários.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (f) => {
    setForm({ nome: f.nome || '', cpf: f.cpf || '', cargo: f.cargo || '', login: f.login || '', senha: '', perfil: f.perfil || 'Recepcionista' });
    setEditId(f.id);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/funcionarios/${editId}`, form);
        toast.success('Funcionário atualizado.');
      } else {
        await api.post('/funcionarios', form);
        toast.success('Funcionário criado.');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/funcionarios/${deleteId}`);
      toast.success('Funcionário excluído.');
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
          <h1 className="page-title">Funcionários</h1>
          <p className="page-subtitle">Área restrita — Gerência</p>
        </div>
        <button className="btn btn-gold" onClick={openCreate}><Plus size={15} /> Novo Funcionário</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Carregando...</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Nome</th><th>Login</th><th>Cargo</th><th>Perfil</th><th style={{ width: 80 }}></th></tr>
              </thead>
              <tbody>
                {funcionarios.map(f => (
                  <tr key={f.id}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{f.nome}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{f.login}</td>
                    <td>{f.cargo || '—'}</td>
                    <td>
                      <span className={`badge ${f.perfil === 'Gerente' ? 'badge-yellow' : 'badge-blue'}`}>{f.perfil}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => openEdit(f)}><Pencil size={14} /></button>
                        <button className="btn btn-ghost" style={{ padding: '4px 8px', color: 'var(--danger-light)' }} onClick={() => setDeleteId(f.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editId ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Nome *</label>
                <input required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>CPF *</label>
                  <input required value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Cargo</label>
                  <input value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} placeholder="Ex: Recepcionista" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Login *</label>
                  <input required value={form.login} onChange={e => setForm(f => ({ ...f, login: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Senha {editId ? '(deixe em branco para manter)' : '*'}</label>
                  <input type="password" required={!editId} value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label>Perfil *</label>
                <select required value={form.perfil} onChange={e => setForm(f => ({ ...f, perfil: e.target.value }))}>
                  <option value="Recepcionista">Recepcionista</option>
                  <option value="Gerente">Gerente</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <h2 className="modal-title">Confirmar Exclusão</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Tem certeza que deseja excluir este funcionário?</p>
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
