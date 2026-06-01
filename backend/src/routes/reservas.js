import { Router } from 'express';
import { callProc } from '../db/pool.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// GET /api/reservas
router.get('/', async (req, res) => {
  try {
    const results = await callProc('sp_ListarReservas', []);
    res.json(results[0] || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reservas/:id
router.get('/:id', async (req, res) => {
  try {
    const results = await callProc('sp_ObterReserva', [req.params.id]);
    const row = results[0]?.[0];
    if (!row) return res.status(404).json({ error: 'Reserva não encontrada.' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reservas
router.post('/', async (req, res) => {
  try {
    const { id_cliente, id_quarto, data_checkin_prev, data_checkout_prev } = req.body;
    if (!id_cliente || !id_quarto || !data_checkin_prev || !data_checkout_prev) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }
    const results = await callProc('sp_CriarReserva', [
      id_cliente, id_quarto, data_checkin_prev, data_checkout_prev, req.user.id
    ]);
    const row = results[0]?.[0];
    res.status(201).json({ message: 'Reserva criada.', id: row?.novo_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/reservas/:id
router.put('/:id', async (req, res) => {
  try {
    const { id_quarto, data_checkin_prev, data_checkout_prev, status } = req.body;
    await callProc('sp_AtualizarReserva', [req.params.id, id_quarto, data_checkin_prev, data_checkout_prev, status]);
    res.json({ message: 'Reserva atualizada.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reservas/:id
router.delete('/:id', async (req, res) => {
  try {
    await callProc('sp_CancelarReserva', [req.params.id]);
    res.json({ message: 'Reserva cancelada.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
