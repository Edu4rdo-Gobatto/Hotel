import { Router } from 'express';
import { callProc, queryView } from '../db/pool.js';
import { verifyToken, gerenteOnly } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken, gerenteOnly);

// GET /api/funcionarios
router.get('/', async (req, res) => {
  try {
    const rows = await queryView('vw_funcionarios');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/funcionarios
router.post('/', async (req, res) => {
  try {
    const { nome, cpf, cargo, login, senha, perfil } = req.body;
    if (!nome || !cpf || !login || !senha || !perfil) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }
    await callProc('sp_CriarFuncionario', [nome, cpf, cargo || null, login, senha, perfil]);
    res.status(201).json({ message: 'Funcionário criado.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Login ou CPF já cadastrado.' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/funcionarios/:id
router.put('/:id', async (req, res) => {
  try {
    const { nome, cpf, cargo, login, perfil } = req.body;
    await callProc('sp_AtualizarFuncionario', [req.params.id, nome, cpf, cargo || null, login, perfil]);
    res.json({ message: 'Funcionário atualizado.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/funcionarios/:id
router.delete('/:id', async (req, res) => {
  try {
    await callProc('sp_ExcluirFuncionario', [req.params.id]);
    res.json({ message: 'Funcionário excluído.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
