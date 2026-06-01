import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import clientesRoutes from './routes/clientes.js';
import quartosRoutes from './routes/quartos.js';
import reservasRoutes from './routes/reservas.js';
import hospedagensRoutes from './routes/hospedagens.js';
import consumosRoutes from './routes/consumos.js';
import relatoriosRoutes from './routes/relatorios.js';
import funcionariosRoutes from './routes/funcionarios.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/quartos', quartosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/hospedagens', hospedagensRoutes);
app.use('/api/consumos', consumosRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/funcionarios', funcionariosRoutes);

// Error handler global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

app.listen(PORT, () => {
  console.log(`🏨 Hotel do Mosquito API rodando em http://localhost:${PORT}`);
});
