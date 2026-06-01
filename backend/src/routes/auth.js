import { Router } from 'express';
import { callProc } from '../db/pool.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { login, senha } = req.body;
    if (!login || !senha) {
      return res.status(400).json({ error: 'Login e senha são obrigatórios.' });
    }

    // Chama sp_Login — retorna dados do funcionário (sem senha)
    const results = await callProc('sp_Login', [login, senha]);
    const row = results[0]?.[0];

    if (!row || !row.id) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = signToken({
      id: row.id,
      nome: row.nome,
      login: row.login,
      perfil: row.perfil,
      cargo: row.cargo,
    });

    res.json({
      token,
      funcionario: {
        id: row.id,
        nome: row.nome,
        login: row.login,
        perfil: row.perfil,
        cargo: row.cargo,
      },
    });
  } catch (err) {
    console.error('[LOGIN]', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

export default router;
