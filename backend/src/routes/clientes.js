import { Router } from 'express';
import { callProc, queryView } from '../db/pool.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// GET /api/clientes
router.get('/', async (req, res) => {
  try {
    const { busca } = req.query;
    let rows;
    if (busca) {
      const results = await callProc('sp_BuscarCliente', [busca]);
      rows = results[0] || [];
    } else {
      const results = await callProc('sp_ListarClientes', []);
      rows = results[0] || [];
    }
    res.json(rows);
  } catch (err) {
    console.error('[GET CLIENTES]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res) => {
  try {
    const results = await callProc('sp_ObterCliente', [req.params.id]);
    const row = results[0]?.[0];
    if (!row) return res.status(404).json({ error: 'Cliente não encontrado.' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clientes
router.post('/', async (req, res) => {
  try {
    const { nome, cpf, email, telefone, endereco } = req.body;
    if (!nome || !cpf) return res.status(400).json({ error: 'Nome e CPF são obrigatórios.' });
    const results = await callProc('sp_CriarCliente', [nome, cpf, email || null, telefone || null, endereco || null]);
    const row = results[0]?.[0];
    res.status(201).json({ message: 'Cliente criado com sucesso.', id: row?.novo_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'CPF ou e-mail já cadastrado.' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
  try {
    const { nome, cpf, email, telefone, endereco } = req.body;
    await callProc('sp_AtualizarCliente', [req.params.id, nome, cpf, email || null, telefone || null, endereco || null]);
    res.json({ message: 'Cliente atualizado com sucesso.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'CPF ou e-mail já cadastrado.' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', async (req, res) => {
  try {
    await callProc('sp_ExcluirCliente', [req.params.id]);
    res.json({ message: 'Cliente excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
