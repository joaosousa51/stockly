# Stockly

Controle de estoque: cadastro de produtos, entrada e saída, e um painel que
mostra o que está acabando. Backend em FastAPI com SQLAlchemy assíncrono,
frontend em React com TypeScript, tudo sobe com um `docker compose up`.

É um projeto de estudo. Eu queria aprender SQLAlchemy 2.0 no modo async de
verdade — não o `session.query()` de tutorial — e um controle de estoque é o
menor domínio que ainda tem uma regra de negócio real: a quantidade não pode
ficar negativa, e ela não pode ser editada à mão.

---

## A decisão que define o projeto

**Quantidade não é um campo editável. É o resultado das movimentações.**

Não existe rota para "definir o estoque do produto X como 40". Existe
`POST /api/movements` com tipo `entrada` ou `saida`, e a quantidade do produto
é atualizada como consequência. Quem quiser corrigir um estoque errado registra
uma movimentação com a justificativa no campo `notes`.

Isso custa um passo a mais na interface e resolve a pergunta que todo controle
de estoque manual não sabe responder: *por que tem 12 aqui se ontem tinha 20?*
Com movimentação, a resposta está na tabela. Sem ela, a resposta é "alguém
digitou".

O `PUT /api/products/{id}` reflete isso: ele aceita nome, descrição, categoria,
preço e estoque mínimo. Não aceita `quantity` nem `sku`.

---

## Rodando

Com Docker, que é o caminho testado:

```bash
git clone https://github.com/joaosousa51/stockly.git
cd stockly
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

Sem Docker, você precisa de um Postgres rodando e de dois terminais:

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # ajuste a DATABASE_URL
uvicorn app.main:app --reload
```

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

O banco não precisa de migration para subir: o `lifespan` do FastAPI roda
`Base.metadata.create_all` no startup e cria as tabelas se não existirem. Isso
é adequado para um projeto deste tamanho e é a razão de o Alembic estar
configurado mas sem nenhuma revisão gerada — veja as limitações abaixo.

---

## Como está organizado

```
backend/app/
  models/      SQLAlchemy — Product, Movement
  schemas/     Pydantic — entrada e saída da API, separadas do model
  services/    regra de negócio — é aqui que mora a validação de saída
  routers/     HTTP — traduz exceção de domínio em status code
  core/        config e sessão do banco
frontend/src/
  services/    cliente axios, uma função por endpoint
  hooks/       useApi — loading/erro/refresh em um lugar só
  pages/       Dashboard, Produtos, Movimentações
```

A separação `routers` / `services` existe por um motivo específico: o service
levanta `ValueError` quando o estoque é insuficiente, e quem transforma isso em
HTTP 400 é o router. O service não sabe o que é HTTP, então dá para chamar a
mesma função de um script ou de um teste sem subir a API.

Endpoints completos no Swagger — não vou duplicar a lista aqui, ela sai
desatualizada.

---

## Limitações conhecidas

Escrevo isto porque um README que só lista o que funciona não ajuda ninguém a
avaliar o código.

- **Não tem autenticação.** Nenhuma. Qualquer um que alcance a porta 8000
  apaga o estoque inteiro. Isso é aceitável para um projeto local e seria
  inaceitável em qualquer outro lugar.
- **Não tem testes.** É a primeira coisa da lista.
- **`price` é `Float`.** Deveria ser `Numeric(10, 2)`. Com float, o
  `SUM(price * quantity)` do dashboard acumula erro de arredondamento — pouco
  visível com dez produtos, errado com dez mil.
- **O Alembic está configurado e não tem nenhuma migration.** `migrations/`
  tem o `env.py` e o template, mas não tem `versions/`. Como as tabelas são
  criadas no startup, isso nunca apareceu — mas `alembic upgrade head` falha.
- **As métricas do dia são em UTC.** `entries_today` e `exits_today` contam
  contra a data UTC, não contra o seu fuso. É consistente, mas não é o que um
  usuário em Brasília esperaria depois das 21h. Resolver direito pede
  `DateTime(timezone=True)` nas colunas.

---

## Licença

MIT. João Victor Teixeira Sousa — https://github.com/joaosousa51
