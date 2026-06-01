import { Router } from 'express';
import { callProc } from '../db/pool.js';
import { verifyToken, gerenteOnly } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// GET /api/quartos
router.get('/', async (req, res) => {
  try {
    const results = await callProc('sp_ListarQuartos', []);
    res.json(results[0] || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quartos/disponiveis
router.get('/disponiveis', async (req, res) => {
  try {
    const results = await callProc('sp_ListarQuartosDisponiveis', []);
    res.json(results[0] || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quartos/:numero
router.get('/:numero', async (req, res) => {
  try {
    const results = await callProc('sp_ObterQuarto', [req.params.numero]);
    const row = results[0]?.[0];
    if (!row) return res.status(404).json({ error: 'Quarto não encontrado.' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quartos
router.post('/', gerenteOnly, async (req, res) => {
  try {
    const { numero, andar, capacidade, status, id_categoria, preco_diaria } = req.body;
    await callProc('sp_CriarQuarto', [numero, andar, capacidade, status || 'Disponivel', id_categoria, preco_diaria]);
    res.status(201).json({ message: 'Quarto criado com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/quartos/:numero
router.put('/:numero', gerenteOnly, async (req, res) => {
  try {
    const { andar, capacidade, status, id_categoria, preco_diaria } = req.body;
    await callProc('sp_AtualizarQuarto', [req.params.numero, andar, capacidade, status, id_categoria, preco_diaria]);
    res.json({ message: 'Quarto atualizado com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/quartos/:numero/preco — dispara trigger via procedure
router.patch('/:numero/preco', gerenteOnly, async (req, res) => {
  try {
    const { preco_diaria } = req.body;
    await callProc('sp_AtualizarPrecoQuarto', [req.params.numero, preco_diaria]);
    res.json({ message: 'Preço atualizado. Histórico registrado automaticamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/quartos/:numero
router.delete('/:numero', gerenteOnly, async (req, res) => {
  try {
    await callProc('sp_ExcluirQuarto', [req.params.numero]);
    res.json({ message: 'Quarto excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
