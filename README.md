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

Legenda da coluna **Banco**:
- `SP` — Stored Procedure (`CALL sp_xxx()`)
- `View` — View MySQL (`SELECT * FROM vw_xxx`)

Legenda da coluna **Operação**:
- `SELECT` — apenas leitura, nenhuma tabela alterada
- `INSERT` — insere registro
- `UPDATE` — atualiza registro
- `DELETE` — remove registro

---

### Autenticação
| Método | Rota | Banco | Objeto | Operação | Tabela(s) afetada(s) |
|---|---|---|---|---|---|
| POST | `/api/auth/login` | SP | `sp_Login` | SELECT | — |

---

### Clientes (autenticado)
| Método | Rota | Banco | Objeto | Operação | Tabela(s) afetada(s) |
|---|---|---|---|---|---|
| GET | `/api/clientes` | SP | `sp_ListarClientes` | SELECT | — |
| GET | `/api/clientes?busca=X` | SP | `sp_BuscarCliente` | SELECT | — |
| GET | `/api/clientes/:id` | SP | `sp_ObterCliente` | SELECT | — |
| POST | `/api/clientes` | SP | `sp_CriarCliente` | INSERT | `clientes` |
| PUT | `/api/clientes/:id` | SP | `sp_AtualizarCliente` | UPDATE | `clientes` |
| DELETE | `/api/clientes/:id` | SP | `sp_ExcluirCliente` | DELETE | `clientes` |

---

### Quartos (autenticado; escrita = Gerente)
| Método | Rota | Banco | Objeto | Operação | Tabela(s) afetada(s) |
|---|---|---|---|---|---|
| GET | `/api/quartos` | **View** | `vw_quartos` | SELECT | — |
| GET | `/api/quartos/disponiveis` | SP | `sp_ListarQuartosDisponiveis` | SELECT | — |
| GET | `/api/quartos/:num` | SP | `sp_ObterQuarto` | SELECT | — |
| POST | `/api/quartos` | SP | `sp_CriarQuarto` | INSERT | `quartos` |
| PUT | `/api/quartos/:num` | SP | `sp_AtualizarQuarto` | UPDATE | `quartos` |
| PATCH | `/api/quartos/:num/preco` | SP | `sp_AtualizarPrecoQuarto` | UPDATE | `quartos`, `historico_precos_quartos` (trigger) |
| DELETE | `/api/quartos/:num` | SP | `sp_ExcluirQuarto` | DELETE | `quartos` |

---

### Reservas (autenticado)
| Método | Rota | Banco | Objeto | Operação | Tabela(s) afetada(s) |
|---|---|---|---|---|---|
| GET | `/api/reservas` | SP | `sp_ListarReservas` | SELECT | — |
| GET | `/api/reservas/:id` | SP | `sp_ObterReserva` | SELECT | — |
| POST | `/api/reservas` | SP | `sp_CriarReserva` | INSERT | `reservas` |
| PUT | `/api/reservas/:id` | SP | `sp_AtualizarReserva` | UPDATE | `reservas` |
| DELETE | `/api/reservas/:id` | SP | `sp_CancelarReserva` | DELETE | `reservas` |

---

### Hospedagens (autenticado)
| Método | Rota | Banco | Objeto | Operação | Tabela(s) afetada(s) |
|---|---|---|---|---|---|
| GET | `/api/hospedagens` | SP | `sp_ListarHospedagens` | SELECT | — |
| GET | `/api/hospedagens/ativas` | SP | `sp_ListarHospedagensAtivas` | SELECT | — |
| GET | `/api/hospedagens/:id` | SP | `sp_ObterHospedagem` | SELECT | — |
| POST | `/api/hospedagens/checkin` | SP | `sp_RealizarCheckIn` (transação) | INSERT | `hospedagens`, `reservas` |
| POST | `/api/hospedagens/:id/checkout` | SP | `sp_RealizarCheckOut` (transação) | UPDATE | `hospedagens`, `quartos` |

---

### Consumos (autenticado)
| Método | Rota | Banco | Objeto | Operação | Tabela(s) afetada(s) |
|---|---|---|---|---|---|
| GET | `/api/consumos/hospedagem/:id` | SP | `sp_ListarConsumos` | SELECT | — |
| GET | `/api/consumos/produtos` | SP | `sp_ListarProdutosServicos` | SELECT | — |
| POST | `/api/consumos` | SP | `sp_LancarConsumo` | INSERT | `consumos` |
| DELETE | `/api/consumos/:id` | SP | `sp_ExcluirConsumo` | DELETE | `consumos` |

---

### Relatórios (Gerente apenas)
| Método | Rota | Banco | Objeto | Operação | Tabela(s) afetada(s) |
|---|---|---|---|---|---|
| GET | `/api/relatorios/ocupacao?mes=&ano=` | SP | `sp_RelatorioOcupacao` | SELECT | — |
| GET | `/api/relatorios/top-clientes` | SP | `sp_RelatorioTopClientes` | SELECT | — |
| GET | `/api/relatorios/top-quartos` | SP | `sp_RelatorioTopQuartos` | SELECT | — |
| GET | `/api/relatorios/faturamento?mes=&ano=` | SP | `sp_RelatorioFaturamento` | SELECT | — |
| GET | `/api/relatorios/historico-precos/:num` | SP | `sp_HistoricoPrecos` | SELECT | — |

---

### Funcionários (Gerente apenas)
| Método | Rota | Banco | Objeto | Operação | Tabela(s) afetada(s) |
|---|---|---|---|---|---|
| GET | `/api/funcionarios` | **View** | `vw_funcionarios` | SELECT | — |
| POST | `/api/funcionarios` | SP | `sp_CriarFuncionario` | INSERT | `funcionarios` |
| PUT | `/api/funcionarios/:id` | SP | `sp_AtualizarFuncionario` | UPDATE | `funcionarios` |
| DELETE | `/api/funcionarios/:id` | SP | `sp_ExcluirFuncionario` | DELETE | `funcionarios` |

---

## Regras de Segurança Implementadas

1. **JWT** em cada requisição (middleware `verifyToken`)
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
