# 📦 Stockly - Sistema de Controle de Estoque

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-24-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Sistema fullstack de controle de estoque com dashboard, CRUD de produtos, movimentações de entrada/saída, alertas de estoque baixo e relatórios.**
[📖 Documentação da API](#endpoints-da-api) · [🐛 Reportar Bug](../../issues)

</div>

---

## ✨ Funcionalidades

- **Dashboard** — Visão geral com métricas, produtos em baixa e movimentações recentes
- **CRUD de Produtos** — Cadastro completo com nome, SKU, categoria, preço e quantidade
- **Movimentações** — Registro de entradas e saídas com histórico
- **Alertas de Estoque** — Notificação visual para produtos abaixo do estoque mínimo
- **Busca e Filtros** — Pesquisa por nome/SKU, filtro por categoria e ordenação
- **Relatórios** — Resumo de movimentações por período
- **Validação** — Tipagem forte com TypeScript no front e Pydantic no back
- **Containerização** — Docker Compose para subir toda a stack com um comando

## 🛠️ Tecnologias Utilizadas

### Backend
| Tecnologia | Descrição |
|------------|-----------|
| **Python 3.11** | Linguagem principal do backend |
| **FastAPI** | Framework web moderno e assíncrono |
| **SQLAlchemy 2.0** | ORM com suporte a async |
| **Pydantic v2** | Validação e serialização de dados |
| **PostgreSQL 16** | Banco de dados relacional principal |
| **Alembic** | Migrations do banco de dados |
| **Uvicorn** | Servidor ASGI |

### Frontend
| Tecnologia | Descrição |
|------------|-----------|
| **React 18** | Biblioteca de UI |
| **TypeScript 5** | Tipagem estática |
| **Tailwind CSS** | Estilização utilitária |
| **Axios** | Cliente HTTP tipado |
| **React Router v6** | Navegação SPA |
| **Lucide React** | Ícones |
| **Vite** | Build tool |

### Infraestrutura
| Tecnologia | Descrição |
|------------|-----------|
| **Docker** | Containerização |
| **Docker Compose** | Orquestração de containers |
| **MySQL 8** | Banco alternativo configurado |

## 🚀 Como Executar

### Com Docker (recomendado)

```bash
# Clone o repositório
git clone https://github.com/joaosousa51/stockly.git
cd stockly

# Suba toda a stack com um comando
docker compose up --build

# Acesse:
# Frontend: http://localhost:5173
# API:      http://localhost:8000
# Docs:     http://localhost:8000/docs (Swagger automático)
```

### Sem Docker

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
pip install -r requirements.txt

# Configure o .env
cp .env.example .env

# Rode as migrations
alembic upgrade head

# Inicie o servidor
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 📁 Estrutura do Projeto

```
stockly/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py         # Configurações e variáveis de ambiente
│   │   │   └── database.py       # Conexão com banco de dados
│   │   ├── models/
│   │   │   ├── product.py        # Model SQLAlchemy de Produto
│   │   │   └── movement.py       # Model SQLAlchemy de Movimentação
│   │   ├── schemas/
│   │   │   ├── product.py        # Schemas Pydantic de Produto
│   │   │   └── movement.py       # Schemas Pydantic de Movimentação
│   │   ├── routers/
│   │   │   ├── products.py       # Endpoints de Produtos
│   │   │   ├── movements.py      # Endpoints de Movimentações
│   │   │   └── dashboard.py      # Endpoints do Dashboard
│   │   ├── services/
│   │   │   ├── product_service.py    # Lógica de negócio de Produtos
│   │   │   └── movement_service.py   # Lógica de negócio de Movimentações
│   │   └── main.py               # Entry point FastAPI
│   ├── migrations/
│   │   └── versions/             # Arquivos de migration
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/           # Componentes React reutilizáveis
│   │   ├── pages/                # Páginas da aplicação
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # Chamadas à API (Axios)
│   │   ├── types/                # Interfaces TypeScript
│   │   └── utils/                # Funções auxiliares
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
├── docker-compose.mysql.yml      # Alternativa com MySQL
└── README.md
```

## 📡 Endpoints da API

A documentação interativa (Swagger) é gerada automaticamente em `http://localhost:8000/docs`

### Produtos

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/products` | Listar produtos (com busca, filtro e paginação) |
| `GET` | `/api/products/:id` | Detalhes de um produto |
| `POST` | `/api/products` | Criar produto |
| `PUT` | `/api/products/:id` | Atualizar produto |
| `DELETE` | `/api/products/:id` | Excluir produto |

### Movimentações

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/movements` | Listar movimentações |
| `POST` | `/api/movements` | Registrar entrada ou saída |

### Dashboard

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/dashboard/stats` | Métricas gerais |
| `GET` | `/api/dashboard/low-stock` | Produtos com estoque baixo |
| `GET` | `/api/dashboard/recent` | Movimentações recentes |

## 🧠 Conceitos Aplicados

- **Clean Architecture** — Separação em camadas (routers, services, models, schemas)
- **TypeScript** — Tipagem forte no frontend com interfaces e generics
- **Pydantic v2** — Validação robusta de dados no backend
- **SQLAlchemy 2.0** — ORM moderno com async/await
- **Docker Multi-stage** — Builds otimizados para produção
- **Docker Compose** — Orquestração de múltiplos serviços
- **Migrations** — Versionamento de banco com Alembic
- **REST API** — Endpoints seguindo convenções REST
- **Documentação automática** — Swagger/OpenAPI gerado pelo FastAPI
- **Variáveis de ambiente** — Configuração segura via .env


## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com ❤️ por **[João Victor Teixeira Sousa](https://github.com/joaosousa51)**

</div>
