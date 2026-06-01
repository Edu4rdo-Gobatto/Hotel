import { Router } from 'express';
import { callProc } from '../db/pool.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// GET /api/consumos/hospedagem/:idHospedagem
router.get('/hospedagem/:idHospedagem', async (req, res) => {
  try {
    const results = await callProc('sp_ListarConsumos', [req.params.idHospedagem]);
    res.json(results[0] || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/consumos
router.post('/', async (req, res) => {
  try {
    const { id_hospedagem, id_produto_servico, quantidade } = req.body;
    if (!id_hospedagem || !id_produto_servico || !quantidade) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }
    await callProc('sp_LancarConsumo', [id_hospedagem, id_produto_servico, quantidade]);
    res.status(201).json({ message: 'Consumo lançado.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/consumos/produtos
router.get('/produtos', async (req, res) => {
  try {
    const results = await callProc('sp_ListarProdutosServicos', []);
    res.json(results[0] || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/consumos/:id
router.delete('/:id', async (req, res) => {
  try {
    await callProc('sp_ExcluirConsumo', [req.params.id]);
    res.json({ message: 'Consumo excluído.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
