# Biblioteca Microserviço de Aluguéis

## Iniciar o Servidor
npm install  
npm nodemon app.js

Base URL (local): http://localhost:3000

---

## Endpoints de Aluguéis

### 1. Criar Aluguel
POST /alugueis  
Headers: Content-Type: application/json  
Body:
{
  "idUsuario": "1",
  "idLivro": "6"
}  
Resposta: 201 Created com objeto do aluguel criado (prazo fixo 15 dias).

---

### 2. Listar Todos os Aluguéis
GET /alugueis  
Resposta: 200 OK com array de aluguéis:
[
  {
    "_id": "6845d1f7ef38625a46d8905d",
    "usuario": { "id": "1", "nome": "Carlos Silva" },
    "livro":   { "id": "6", "titulo": "São Cipriano" },
    "prazo": 15,
    "dataLocacao": "2025-06-08T...",
    "dataDevolucao": null
  }
]

---

### 3. Buscar Aluguel por ID
GET /alugueis/{id}  
Ex.: /alugueis/6845d1f7ef38625a46d8905d  
Resposta: 200 OK com objeto do aluguel.

---

### 4. Renovar Aluguel
PATCH /alugueis/{id}/renovar  
Headers: Content-Type: application/json  
Body:
{
  "novoPrazo": 30
}  
Resposta: 200 OK com mensagem de sucesso e aluguel atualizado.

---

### 5. Devolver Livro (sem multa)
PATCH /alugueis/{id}/devolver  
Headers: Content-Type: application/json  
Body:
{
  "dataDevolucao": "2025-06-10"
}  
Resposta: 200 OK
{
  "mensagem": "Livro devolvido dentro do prazo.",
  "aluguel": { /* dados atualizados */ }
}

---

### 6. Devolver Livro com Atraso
PATCH /alugueis/{id}/devolver  
Body:
{
  "dataDevolucao": "2025-07-01"
}  
Resposta: 200 OK
{
  "mensagem": "Livro devolvido com atraso e multa aplicada no saldo devedor.",
  "aluguel": { /* dados do aluguel */ },
  "atrasoDias": 2,
  "valorMulta": 4.0,
  "multa": true
}

---

## Observações
- O saldoDevedor do usuário é atualizado via POST /usuarios/{id}/saldo (serviço de Usuários).
- A quantidade de exemplares é ajustada no microserviço de Livros.
