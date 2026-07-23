# Plano de Implementação: Migração para Web App ERP (React + Node.js + PostgreSQL + TypeScript)

Este plano descreve a migração do sistema **FAEDA CRM & Finance** de uma arquitetura baseada em Google Sheets/Apps Script para um sistema completo de nível empresarial, seguro, escalável e pronto para hospedagem em VPS.

---

## Arquitetura Proposta

O projeto será estruturado em um repositório monorepo ou pastas separadas para Frontend e Backend:

```text
/faeda-cloud-erp
  ├── backend/          # Node.js + Express + TypeScript + Prisma
  ├── frontend/         # React + Vite + TypeScript + CSS Moderno/Variables
  └── docker-compose.yml
```

### 1. Banco de Dados (PostgreSQL)

Usaremos o **Prisma ORM** para modelagem rápida, migrações seguras e tipagem estática integrada com TypeScript.

```prisma
// Esquema do Banco de Dados Proposto

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  USER
}

enum StudentStatus {
  EM_ABERTO
  ADIMPLENTE
  INADIMPLENTE
  INATIVO
}

enum ExpenseType {
  OPERACIONAL
  PESSOAL
}

model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(USER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Student {
  id           String        @id @default(uuid())
  code         String        @unique // Padrão FAEDA-001
  name         String
  email        String?
  whatsapp     String?
  dueDay       Int
  plan         String
  value        Decimal       @db.Decimal(10, 2)
  status       StudentStatus @default(EM_ABERTO)
  association  String        // Vínculo (Ex: tipo de plano/modalidade)
  notes        String?       @db.Text
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  payments     Payment[]
}

model Payment {
  id           String    @id @default(uuid())
  studentId    String
  student      Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  paymentDate  DateTime  @default(now())
  referenceMonth DateTime // Mês/Ano correspondente à competência
  amount       Decimal   @db.Decimal(10, 2)
  status       String    // PAGO, PAGO_PARCIAL, EM_ATRASO
  notes        String?
  createdAt    DateTime  @default(now())
}

model Expense {
  id          String      @id @default(uuid())
  date        DateTime    @default(now())
  category    String
  description String
  type        ExpenseType
  value       Decimal     @db.Decimal(10, 2)
  paymentMethod String
  nature      String
  notes       String?
  createdAt   DateTime    @default(now())
}
```

---

## Técnicas de Segurança Aplicadas

1. **Autenticação e Autorização**:
   - JWT (JSON Web Tokens) assinados digitalmente.
   - Refresh tokens armazenados em **HTTP-Only, Secure, SameSite=Strict cookies** para mitigar ataques XSS e CSRF.
   - Senhas criptografadas com `argon2` ou `bcrypt`.
2. **Proteção de Rede e APIs**:
   - **Helmet**: Configuração de headers HTTP seguros para evitar clickjacking, sniffing de MIME e ataques baseados em JS.
   - **Rate Limiting**: Limitação de chamadas por IP (ex: máx 100 requisições a cada 15 min) para impedir brute-force e ataques DoS.
   - **CORS**: Configuração restrita apenas para o domínio oficial da VPS e ambiente de desenvolvimento.
3. **Validação e Sanitização**:
   - Validação forte de input com **Zod** no backend. Tudo o que entra na API é validado no nível de tipo e valor antes de tocar o banco.
   - Consultas parametrizadas (via Prisma) para eliminar riscos de SQL Injection.
4. **Variáveis de Ambiente**:
   - Nenhuma credencial exposta no código. Uso rigoroso de arquivos `.env` e secrets de produção.

---

## Estrutura do Backend (Clean Code)

O Backend será construído com **Node.js, Express e TypeScript** seguindo os princípios de separação de responsabilidades (Layered Architecture):

- `src/controllers`: Validação de requisições, envio de respostas HTTP.
- `src/services`: Regras de negócio essenciais (cálculo de inadimplência, automação de vencimento, envio de relatórios em PDF).
- `src/repositories`: Abstração de acesso ao banco (Prisma wrapper).
- `src/middlewares`: Tratamento global de erros, autenticação JWT, CORS, rate limiting.
- `src/utils`: Geradores de PDFs, envio de emails (Nodemailer) e formatações.

---

## Estrutura do Frontend (React + TS)

Uma interface de alta performance com design premium:

- **Dashboard Financeiro**: Indicadores (Lucro Operacional, Receita Bruta, Ticket Médio, Retenção, inadimplentes ativos).
- **Cadastro e Gestão de Alunos**: Listagem com filtros, busca avançada e transição fácil de status.
- **Registro Financeiro**: Módulo de lançamentos facilitado.
- **Controle de Despesas**: Gráfico de despesas por categoria e natureza (Pessoal vs. Operacional).
- **Gestão de Pós-Pagos**: Registro específico para quem consome o serviço e paga posteriormente.

---

## Plano de Execução

### Fase 1: Setup do Projeto e Banco de Dados (Backend)
- [ ] Inicializar projeto Node.js + TypeScript com Fastify/Express.
- [ ] Instalar e configurar o Prisma ORM com PostgreSQL.
- [ ] Criar scripts de migração iniciais.
- [ ] Criar sementes (seeds) de teste para o banco de dados.

### Fase 2: Segurança e APIs Iniciais
- [ ] Implementar middleware de autenticação (JWT + Cookies).
- [ ] Configurar CORS, Helmet e Rate Limiter.
- [ ] Desenvolver rotas para Autenticação (`/api/auth`).
- [ ] Desenvolver rotas CRUD de Alunos (`/api/students`).
- [ ] Desenvolver rotas CRUD de Despesas (`/api/expenses`).
- [ ] Desenvolver rotas CRUD de Pagamentos/Financeiro (`/api/payments`).

### Fase 3: Regras de Negócio e Serviços
- [ ] Desenvolver serviço de cálculo e disparo de inadimplentes (conversão do script original).
- [ ] Adicionar automação para alteração de status baseada no dia de vencimento.
- [ ] Criar gerador de relatórios PDF de inadimplentes.

### Fase 4: Frontend (React + TypeScript)
- [ ] Inicializar o app frontend com React + Vite + TS.
- [ ] Criar folha de estilos base (`index.css`) com design premium (variáveis de cores HSL, modo escuro nativo, transições suaves).
- [ ] Implementar as telas: Login, Dashboard, Gestão de Alunos, Financeiro e Relatórios.
- [ ] Integrar com a API REST utilizando `Axios` ou `Fetch` com interceptores de tokens.

### Fase 5: Docker & VPS Deploy Ready
- [ ] Criar `Dockerfile` para o backend e frontend.
- [ ] Criar `docker-compose.yml` contendo a aplicação e o banco PostgreSQL.
- [ ] Documentar o fluxo de deploy na VPS (Nginx + SSL com Certbot).

---

## Open Questions

> [!IMPORTANT]
> 1. **Framework do Frontend**: Você prefere manter um SPA React clássico (Vite) ou prefere utilizar Next.js? Para sistemas internos hospedados em VPS, o Vite é extremamente leve e rápido de implantar.
> 2. **Notificações**: O sistema atual envia relatórios de inadimplência por e-mail. Você gostaria de expandir isso para envio automático por WhatsApp (usando alguma API de WhatsApp) ou manter apenas e-mail por enquanto?
> 3. **Migração de Dados**: Você possui dados ativos que precisam ser exportados das planilhas Google Sheets atuais para o novo banco PostgreSQL? Se sim, podemos criar um script de importação dedicado.

---

## Plano de Verificação

### Testes Automatizados
- Scripts de teste de integração para as rotas da API usando Jest/Vitest.
- Testes de integridade do Schema do Prisma.

### Verificação Manual
- Validar fluxo de login e expiração do token JWT.
- Testar comportamento sob rate limiting para garantir a robustez.
- Testar responsividade da UI em múltiplos dispositivos.
