# 📊 Movyra — Onde gestão e movimento se encontram. — CRM & Sistema Financeiro

O **Movyra - Onde gestão e movimento se encontram.** é uma solução robusta e moderna de gestão operacional e financeira para empresas de consultoria e personal training. Desenvolvido para substituir sistemas legados baseados em planilhas, este ERP oferece controle de faturamento, gestão de alunos ativos/inativos, acompanhamento de inadimplência em tempo real, fluxo de despesas e automação de alertas por e-mail.

Este projeto foi projetado seguindo as melhores práticas de **Clean Code**, **TypeScript tipado de ponta a ponta**, **arquitetura em camadas** e **segurança de nível de produção**, sendo 100% pronto para implantação em servidores virtuais (VPS).

---

## 🛠️ Stack Tecnológica

* **Frontend**: React (Vite) + TypeScript + CSS Moderno (Variáveis Dinâmicas & Glassmorphism) + Lucide Icons
* **Backend**: Node.js + Express + TypeScript + Prisma ORM + Zod Validation
* **Banco de Dados**: PostgreSQL (Relacional)
* **Segurança**: Helmet + CORS Restrito + Rate Limiter + JWT + Cookies HttpOnly
* **Containerização & Deploy**: Docker & Docker Compose + Nginx (Reverse Proxy & SSL)

---

## 🔒 Arquitetura de Segurança Aplicada

1. **Autenticação Segura (JWT + Cookies)**:
   * Autenticação baseada em JSON Web Tokens (JWT).
   * O Token é armazenado em cookies HTTP-Only no navegador (`SameSite=Strict` e `Secure` em produção), impedindo roubo de token através de ataques Cross-Site Scripting (XSS).
2. **Proteção de Cabeçalhos (Helmet)**:
   * Configuração de cabeçalhos HTTP de segurança para evitar sniffing de conteúdo, clickjacking e cross-site injection.
3. **Limitação de Taxa (Rate Limiting)**:
   * Controle de requisições por IP para bloquear ataques de força bruta (Brute Force) e sobrecarga de requisições (DoS) na API.
4. **Validação de Entradas (Zod)**:
   * Todos os dados que entram na API (JSON ou parâmetros) passam por esquemas de validação rígidos no nível do backend.
5. **Prevenção de SQL Injection**:
   * Utilização de queries parametrizadas de forma nativa através do Prisma ORM.

---

## 📂 Estrutura do Projeto

```text
/faeda_Consultingsport
  ├── backend/               # Servidor de API REST (Node.js + Express)
  │     ├── prisma/          # Modelagem de dados e migrations (Prisma)
  │     └── src/
  │          ├── controllers/# Gerenciamento de entradas/saídas HTTP
  │          ├── middlewares/# Autenticação, Rate Limit e Error Handler
  │          ├── routes/     # Definição e agrupamento de endpoints
  │          └── db.ts       # Instanciação do Prisma Client
  ├── frontend/              # Interface do Usuário (React + Vite)
  │     ├── src/
  │     │    ├── App.tsx     # Layout geral, telas e simulação offline
  │     │    └── index.css   # Sistema de design (HSL & Dark Mode)
  │     └── index.html       # Carregamento de fontes e estrutura principal
  └── docker-compose.yml     # Orquestração de containers de Produção
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js v18+ instalado
* PostgreSQL rodando localmente (ou via Docker)

---

### Opção A: Execução via Docker (Recomendado & Mais Rápido)

Se você tiver o Docker e o Docker Compose instalados, pode iniciar todo o ecossistema (PostgreSQL + Backend + Frontend) com um único comando na pasta raiz do projeto:

```bash
docker-compose up --build
```

* **Frontend**: `http://localhost:8080`
* **Backend (API)**: `http://localhost:3001`
* **Credenciais de Acesso**: `admin@movyra.com` / `admin123`

---

### Opção B: Execução Manual (Desenvolvimento)

#### Passo 1: Configurar e rodar o Backend
1. Entre na pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie e configure o arquivo `.env` baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Execute as migrations do banco de dados e gere o client do Prisma:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. Alimente o banco de dados com os dados iniciais de teste (Seed):
   ```bash
   npx prisma db seed
   ```
6. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

#### Passo 2: Configurar e rodar o Frontend
1. Em um novo terminal, entre na pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor do frontend:
   ```bash
   npm run dev
   ```
4. Abra o navegador em `http://localhost:5173`.

---

## 🌐 Deploy em Servidor VPS (Linux Ubuntu/Debian)

### Passo 1: Preparar o Servidor
Instale o Docker e o Nginx na VPS:
```bash
sudo apt update && sudo apt install docker.io docker-compose nginx -y
```

### Passo 2: Subir os Containers do ERP
1. Clone este repositório na sua VPS.
2. Configure as variáveis de ambiente seguras no arquivo `docker-compose.yml` (como senhas do banco e chaves secretas do JWT).
3. Suba a aplicação em segundo plano:
   ```bash
   docker-compose up -d --build
   ```

### Passo 3: Configurar o Nginx e Certbot (HTTPS)
Configure o Nginx como proxy reverso para apontar o seu domínio para as portas internas dos containers (`8080` para o frontend e `3001` para a API do backend).

Instale o Let's Encrypt para obter o certificado SSL gratuito:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com
```
