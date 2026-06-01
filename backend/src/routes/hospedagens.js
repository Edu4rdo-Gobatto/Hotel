import { Router } from 'express';
import { callProc } from '../db/pool.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// GET /api/hospedagens
router.get('/', async (req, res) => {
  try {
    const results = await callProc('sp_ListarHospedagens', []);
    res.json(results[0] || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hospedagens/ativas
router.get('/ativas', async (req, res) => {
  try {
    const results = await callProc('sp_ListarHospedagensAtivas', []);
    res.json(results[0] || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hospedagens/:id
router.get('/:id', async (req, res) => {
  try {
    const results = await callProc('sp_ObterHospedagem', [req.params.id]);
    const row = results[0]?.[0];
    if (!row) return res.status(404).json({ error: 'Hospedagem não encontrada.' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hospedagens/checkin
router.post('/checkin', async (req, res) => {
  try {
    const { id_reserva } = req.body;
    if (!id_reserva) return res.status(400).json({ error: 'ID da reserva obrigatório.' });
    const results = await callProc('sp_RealizarCheckIn', [id_reserva, req.user.id]);
    const row = results[0]?.[0];
    res.status(201).json({ message: 'Check-in realizado.', hospedagem: row });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/hospedagens/:id/checkout
router.post('/:id/checkout', async (req, res) => {
  try {
    const results = await callProc('sp_RealizarCheckOut', [req.params.id, req.user.id]);
    const row = results[0]?.[0];

    // Se for recepcionista, o valor total vem mascarado ou nulo — conforme a SP
    res.json({ message: 'Check-out realizado.', resultado: row });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
