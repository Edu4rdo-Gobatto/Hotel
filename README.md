# 🦟 Hotel do Mosquito — Sistema de Gerenciamento

## Stack
- **Frontend**: React 18 + Vite + React Router + Recharts
- **Backend**: Node.js + Express (ESModules)
- **Banco**: MySQL (via `mysql2`) — toda comunicação via `CALL sp_xxx()` ou `SELECT * FROM vw_xxx`
- **Auth**: JWT (8h de validade)

---

## Pré-requisitos

- Node.js 18+
- MySQL com o banco `hotel_mosquito` já criado e populado

---

## Configuração

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edite .env com suas credenciais MySQL
npm install
npm run dev       # desenvolvimento (--watch)
# ou
npm start         # produção
```

O servidor sobe em `http://localhost:3001`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173`.  
O Vite faz proxy de `/api/*` → `http://localhost:3001` automaticamente.

---

## Variáveis de Ambiente (backend/.env)

| Variável | Descrição | Padrão |
|---|---|---|
| `DB_HOST` | Host MySQL | localhost |
| `DB_PORT` | Porta MySQL | 3306 |
| `DB_USER` | Usuário | root |
| `DB_PASSWORD` | Senha | (vazio) |
| `DB_NAME` | Nome do banco | hotel_mosquito |
| `JWT_SECRET` | Segredo do JWT | hotel_mosquito_jwt_secret_2024 |
| `PORT` | Porta do servidor | 3001 |

---

## Logins de Teste

| Login | Senha | Perfil |
|---|---|---|
| marcos.gerente | Gerente123 | Gerente |
| patricia.gerente | Gerente123 | Gerente |
| rafael.recepc | Recepc123 | Recepcionista |

---

## Endpoints da API

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login → retorna JWT |

### Clientes (autenticado)
| Método | Rota | SP chamada |
|---|---|---|
| GET | `/api/clientes` | sp_ListarClientes |
| GET | `/api/clientes?busca=X` | sp_BuscarCliente |
| GET | `/api/clientes/:id` | sp_ObterCliente |
| POST | `/api/clientes` | sp_CriarCliente |
| PUT | `/api/clientes/:id` | sp_AtualizarCliente |
| DELETE | `/api/clientes/:id` | sp_ExcluirCliente |

### Quartos (autenticado; write = Gerente)
| Método | Rota | SP chamada |
|---|---|---|
| GET | `/api/quartos` | sp_ListarQuartos |
| GET | `/api/quartos/disponiveis` | sp_ListarQuartosDisponiveis |
| GET | `/api/quartos/:num` | sp_ObterQuarto |
| POST | `/api/quartos` | sp_CriarQuarto |
| PUT | `/api/quartos/:num` | sp_AtualizarQuarto |
| PATCH | `/api/quartos/:num/preco` | sp_AtualizarPrecoQuarto → **trigger** |
| DELETE | `/api/quartos/:num` | sp_ExcluirQuarto |

### Reservas (autenticado)
| Método | Rota | SP chamada |
|---|---|---|
| GET | `/api/reservas` | sp_ListarReservas |
| GET | `/api/reservas/:id` | sp_ObterReserva |
| POST | `/api/reservas` | sp_CriarReserva |
| PUT | `/api/reservas/:id` | sp_AtualizarReserva |
| DELETE | `/api/reservas/:id` | sp_CancelarReserva |

### Hospedagens (autenticado)
| Método | Rota | SP chamada |
|---|---|---|
| GET | `/api/hospedagens` | sp_ListarHospedagens |
| GET | `/api/hospedagens/ativas` | sp_ListarHospedagensAtivas |
| GET | `/api/hospedagens/:id` | sp_ObterHospedagem |
| POST | `/api/hospedagens/checkin` | **sp_RealizarCheckIn** (transação) |
| POST | `/api/hospedagens/:id/checkout` | **sp_RealizarCheckOut** (transação) |

### Consumos (autenticado)
| Método | Rota | SP chamada |
|---|---|---|
| GET | `/api/consumos/hospedagem/:id` | sp_ListarConsumos |
| GET | `/api/consumos/produtos` | sp_ListarProdutosServicos |
| POST | `/api/consumos` | sp_LancarConsumo |
| DELETE | `/api/consumos/:id` | sp_ExcluirConsumo |

### Relatórios (**Gerente apenas**)
| Método | Rota | SP chamada |
|---|---|---|
| GET | `/api/relatorios/ocupacao?mes=&ano=` | sp_RelatorioOcupacao |
| GET | `/api/relatorios/top-clientes` | sp_RelatorioTopClientes |
| GET | `/api/relatorios/top-quartos` | sp_RelatorioTopQuartos |
| GET | `/api/relatorios/faturamento?mes=&ano=` | sp_RelatorioFaturamento |
| GET | `/api/relatorios/historico-precos/:num` | sp_HistoricoPrecos |

### Funcionários (**Gerente apenas**)
| Método | Rota | SP chamada |
|---|---|---|
| GET | `/api/funcionarios` | sp_ListarFuncionarios |
| POST | `/api/funcionarios` | sp_CriarFuncionario |
| PUT | `/api/funcionarios/:id` | sp_AtualizarFuncionario |
| DELETE | `/api/funcionarios/:id` | sp_ExcluirFuncionario |

---

## Regras de Segurança Implementadas

1. **JWT** em cada requisição (middleware `authMiddleware`)
2. **`gerenteOnly`** middleware protege rotas de relatórios e funcionários
3. **sp_RealizarCheckOut** — a SP retorna o valor total mascarado/nulo para Recepcionistas; o frontend exibe o ícone de cadeado
4. **Senhas** armazenadas com hash SHA2 no MySQL (via sp_CriarFuncionario)
5. **Sem SQL cru na rede** — apenas `CALL sp_xxx()` e `SELECT * FROM vw_xxx`

---

## Estrutura de Arquivos

```
hotel-mosquito/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── db/pool.js
│       ├── middleware/auth.js
│       └── routes/
│           ├── auth.js
│           ├── clientes.js
│           ├── quartos.js
│           ├── reservas.js
│           ├── hospedagens.js
│           ├── consumos.js
│           ├── relatorios.js
│           └── funcionarios.js
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── services/api.js
        ├── contexts/AuthContext.jsx
        ├── hooks/useToast.js
        ├── components/
        │   ├── Layout.jsx
        │   ├── Sidebar.jsx
        │   └── Toast.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── DashboardPage.jsx
            ├── ClientesPage.jsx
            ├── QuartosPage.jsx
            ├── ReservasPage.jsx
            ├── CheckInPage.jsx
            ├── CheckOutPage.jsx
            ├── ConsumosPage.jsx
            ├── RelatoriosPage.jsx
            └── FuncionariosPage.jsx
```
