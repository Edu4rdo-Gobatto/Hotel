import { Router } from 'express';
import { callProc } from '../db/pool.js';
import { verifyToken, gerenteOnly } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken, gerenteOnly);

// GET /api/relatorios/ocupacao?mes=6&ano=2024
router.get('/ocupacao', async (req, res) => {
  try {
    const mes = parseInt(req.query.mes) ?? new Date().getMonth() + 1;
    const ano = parseInt(req.query.ano) ?? new Date().getFullYear();
    const results = await callProc('sp_RelatorioOcupacao', [mes, ano]);
    res.json(results[0] || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/relatorios/top-clientes
router.get('/top-clientes', async (req, res) => {
  try {
    const results = await callProc('sp_RelatorioTopClientes', []);
    res.json(results[0] || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/relatorios/top-quartos
router.get('/top-quartos', async (req, res) => {
  try {
    const results = await callProc('sp_RelatorioTopQuartos', []);
    res.json(results[0] || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/relatorios/faturamento?mes=6&ano=2024
router.get('/faturamento', async (req, res) => {
  try {
    const mes = parseInt(req.query.mes) ?? new Date().getMonth() + 1;
    const ano = parseInt(req.query.ano) ?? new Date().getFullYear();
    const results = await callProc('sp_RelatorioFaturamento', [mes, ano]);
    res.json(results[0] || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/relatorios/historico-precos/:numeroQuarto
router.get('/historico-precos/:numero', async (req, res) => {
  try {
    const results = await callProc('sp_HistoricoPrecos', [req.params.numero]);
    res.json(results[0] || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
